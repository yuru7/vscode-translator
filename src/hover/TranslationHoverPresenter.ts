import * as vscode from 'vscode';
import { PendingHoverStore } from './PendingHoverStore';
import { TranslationHoverProvider } from './TranslationHoverProvider';

/**
 * Presents translation results via HoverProvider.
 *
 * VS Code orders hover providers by document-selector score, then registration
 * time (later wins). Re-registering for the active document's scheme+language
 * scores 10 (max) and, being latest, tends to place translation earlier.
 * Do not use `exclusive` — it requires a proposed API and throws otherwise.
 */
export class TranslationHoverPresenter {
  private readonly store = new PendingHoverStore();
  private readonly provider = new TranslationHoverProvider(this.store);
  private registration: vscode.Disposable | undefined;

  async show(
    editor: vscode.TextEditor,
    range: vscode.Range,
    content: vscode.MarkdownString
  ): Promise<void> {
    this.reregisterForDocument(editor.document);
    this.store.set({
      uri: editor.document.uri.toString(),
      range,
      content,
    });

    await vscode.commands.executeCommand('editor.action.hideHover');
    await vscode.commands.executeCommand('editor.action.showHover');
  }

  get() {
    return this.store.get();
  }

  clear(): void {
    this.store.clear();
  }

  dispose(): void {
    this.clear();
    this.registration?.dispose();
    this.registration = undefined;
  }

  private reregisterForDocument(document: vscode.TextDocument): void {
    this.registration?.dispose();
    this.registration = vscode.languages.registerHoverProvider(
      {
        scheme: document.uri.scheme,
        language: document.languageId,
      },
      this.provider
    );
  }
}
