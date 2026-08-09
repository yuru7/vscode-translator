import * as vscode from 'vscode';
import { getConfiguration } from '../configuration/configuration';
import { TranslationError } from '../errors/TranslationError';
import type { TranslationHoverPresenter } from '../hover/TranslationHoverPresenter';
import { logError, logInfo } from '../output/logger';
import type { TranslateClient } from '../translate/TranslateClient';
import { prepareTextForTranslation } from '../translate/prepareTextForTranslation';
import {
  needsReverseTranslation,
  resolveTranslationDirection,
} from '../translate/resolveTranslationDirection';

export interface TranslateSelectionDeps {
  client: TranslateClient;
  hoverPresenter: TranslationHoverPresenter;
}

export async function translateSelectionCommand(
  deps: TranslateSelectionDeps
): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const target = resolveTranslateTarget(editor);
  if (!target) {
    await vscode.window.showInformationMessage('Nothing to translate.');
    return;
  }

  deps.hoverPresenter.clear();

  const config = getConfiguration();

  try {
    const initialSource =
      config.sourceLanguage === 'auto' ? 'auto' : config.sourceLanguage;
    const text = prepareTextForTranslation(target.text);

    const first = await deps.client.translate({
      text,
      sourceLanguage: initialSource,
      targetLanguage: config.targetLanguage,
    });

    let translatedText = first.text;
    let direction = resolveTranslationDirection(
      config,
      first.detectedLanguage
    );

    if (needsReverseTranslation(config, first.detectedLanguage)) {
      logInfo('Detected language matches target; requesting reverse translation.');
      const second = await deps.client.translate({
        text,
        sourceLanguage: 'auto',
        targetLanguage: config.reverseLanguage,
      });
      translatedText = second.text;
      direction = {
        sourceLanguage:
          second.detectedLanguage || first.detectedLanguage || 'auto',
        targetLanguage: config.reverseLanguage,
      };
    }

    const active = vscode.window.activeTextEditor;
    if (
      !active ||
      active.document.uri.toString() !== editor.document.uri.toString() ||
      !active.selection.isEqual(target.selection)
    ) {
      return;
    }

    const markdown = new vscode.MarkdownString();
    markdown.appendMarkdown(
      `**[Translation: \`${direction.sourceLanguage}\` -> \`${direction.targetLanguage}\`]**\n\n`
    );
    markdown.appendText(translatedText);
    markdown.isTrusted = false;

    try {
      await deps.hoverPresenter.show(active, target.range, markdown);
    } catch (error) {
      logError('Failed to show translation hover.', error);
      await vscode.window.showErrorMessage(
        'Translator: Translated successfully, but failed to show the hover.'
      );
    }
  } catch (error) {
    logError('Translation failed.', error);
    const message =
      error instanceof TranslationError
        ? userFacingMessage(error)
        : 'Translator: Unexpected error while translating.';
    await vscode.window.showErrorMessage(message);
  }
}

interface TranslateTarget {
  text: string;
  range: vscode.Range;
  /** Snapshot of the editor selection used for stale-check. */
  selection: vscode.Selection;
}

/**
 * Selection があればそれを使う。未選択ならカーソル行を
 * 「行頭〜次の行頭」まで選択してから、その行テキストを返す。
 */
function resolveTranslateTarget(
  editor: vscode.TextEditor
): TranslateTarget | undefined {
  const selection = editor.selection;

  if (!selection.isEmpty) {
    const text = editor.document.getText(selection);
    if (!text.trim()) {
      return undefined;
    }
    return {
      text,
      range: new vscode.Range(selection.start, selection.end),
      selection,
    };
  }

  const line = editor.document.lineAt(selection.active.line);
  if (line.isEmptyOrWhitespace) {
    return undefined;
  }

  // 行末を始点、行頭を終端（カーソル）として選択する
  const range = line.range;
  const lineSelection = new vscode.Selection(range.end, range.start);
  editor.selection = lineSelection;

  return {
    text: line.text,
    range,
    selection: lineSelection,
  };
}

function userFacingMessage(error: TranslationError): string {
  switch (error.kind) {
    case 'timeout':
      return 'Translator: Google Translate request timed out.';
    case 'rate_limit':
      return 'Translator: Google Translate rate limit exceeded. Try again later.';
    case 'empty':
      return 'Translator: Google Translate returned an empty result.';
    case 'protocol':
      return 'Translator: Unexpected response from Google Translate.';
    case 'network':
    default:
      return 'Translator: Google Translate request failed.';
  }
}
