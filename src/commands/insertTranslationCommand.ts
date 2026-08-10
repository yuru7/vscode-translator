import * as vscode from 'vscode';
import { TranslationError } from '../errors/TranslationError';
import { logError } from '../output/logger';
import type { TranslateClient } from '../translate/TranslateClient';
import {
  buildInsertText,
  needsTrailingNewlineForCursor,
  resolveCursorLineAfterInsert,
  resolveInsertPosition,
} from './formatInsertedTranslation';
import { resolveTranslateTarget } from './resolveTranslateTarget';
import { runTranslation } from './runTranslation';
import { userFacingTranslationError } from './userFacingTranslationError';

export interface InsertTranslationDeps {
  client: TranslateClient;
}

export async function insertTranslationCommand(
  deps: InsertTranslationDeps
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

  try {
    const outcome = await runTranslation(deps.client, target.text);

    const active = vscode.window.activeTextEditor;
    if (
      !active ||
      active.document.uri.toString() !== editor.document.uri.toString() ||
      !active.selection.isEqual(target.selection)
    ) {
      return;
    }

    const insertPosition = resolveInsertPosition(active.document, target.range);
    const appendTrailingNewline = needsTrailingNewlineForCursor(
      active.document,
      insertPosition
    );
    const insertText = buildInsertText(
      outcome.translatedText,
      appendTrailingNewline
    );
    const cursorLine = resolveCursorLineAfterInsert(
      insertPosition.line,
      outcome.translatedText
    );

    const applied = await active.edit((editBuilder) => {
      editBuilder.insert(insertPosition, insertText);
    });

    if (!applied) {
      await vscode.window.showErrorMessage(
        'Translator: Failed to insert the translation.'
      );
      return;
    }

    const cursor = new vscode.Position(cursorLine, 0);
    active.selection = new vscode.Selection(cursor, cursor);
    active.revealRange(
      new vscode.Range(cursor, cursor),
      vscode.TextEditorRevealType.InCenterIfOutsideViewport
    );
  } catch (error) {
    logError('Translation failed.', error);
    const message =
      error instanceof TranslationError
        ? userFacingTranslationError(error)
        : 'Translator: Unexpected error while translating.';
    await vscode.window.showErrorMessage(message);
  }
}
