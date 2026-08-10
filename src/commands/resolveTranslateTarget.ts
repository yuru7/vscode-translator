import * as vscode from 'vscode';

export interface TranslateTarget {
  text: string;
  range: vscode.Range;
  /** Snapshot of the editor selection used for stale-check. */
  selection: vscode.Selection;
}

/**
 * Selection があればそれを使う。未選択ならカーソル行を
 * 「行頭〜次の行頭」まで選択してから、その行テキストを返す。
 */
export function resolveTranslateTarget(
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
