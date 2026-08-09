import * as vscode from 'vscode';
import type { PendingHoverStore } from './PendingHoverStore';

export class TranslationHoverProvider implements vscode.HoverProvider {
  constructor(private readonly store: PendingHoverStore) {}

  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.ProviderResult<vscode.Hover> {
    const pending = this.store.get();
    if (!pending) {
      return undefined;
    }

    if (pending.uri !== document.uri.toString()) {
      return undefined;
    }

    if (!pending.range.contains(position)) {
      return undefined;
    }

    return new vscode.Hover(pending.content, pending.range);
  }
}
