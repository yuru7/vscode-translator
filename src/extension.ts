import * as vscode from 'vscode';
import { insertTranslationCommand } from './commands/insertTranslationCommand';
import { translateSelectionCommand } from './commands/translateSelectionCommand';
import { TranslationHoverPresenter } from './hover/TranslationHoverPresenter';
import { getOutputChannel } from './output/logger';
import { GoogleTranslateClient } from './translate/GoogleTranslateClient';

export function activate(context: vscode.ExtensionContext): void {
  const hoverPresenter = new TranslationHoverPresenter();
  const client = new GoogleTranslateClient();

  context.subscriptions.push({ dispose: () => hoverPresenter.dispose() });

  context.subscriptions.push(
    vscode.commands.registerCommand('translator.translate', () =>
      translateSelectionCommand({ client, hoverPresenter })
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('translator.insertTranslation', () =>
      insertTranslationCommand({ client })
    )
  );

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(() => {
      hoverPresenter.clear();
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((event) => {
      const pending = hoverPresenter.get();
      if (pending && pending.uri === event.document.uri.toString()) {
        hoverPresenter.clear();
      }
    })
  );

  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection((event) => {
      const pending = hoverPresenter.get();
      if (!pending) {
        return;
      }

      if (pending.uri !== event.textEditor.document.uri.toString()) {
        hoverPresenter.clear();
        return;
      }

      const selection = event.selections[0];
      if (!selection) {
        hoverPresenter.clear();
        return;
      }

      // Keep pending hover while the caret stays inside the translated range
      // (important for cursor-line translation with an empty selection).
      if (selection.isEmpty) {
        if (!pending.range.contains(selection.active)) {
          hoverPresenter.clear();
        }
        return;
      }

      if (!selection.isEqual(pending.range)) {
        hoverPresenter.clear();
      }
    })
  );

  context.subscriptions.push(getOutputChannel());
}

export function deactivate(): void {
  // No-op
}
