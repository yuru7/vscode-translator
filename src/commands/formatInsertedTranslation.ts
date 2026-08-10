import * as vscode from 'vscode';

/**
 * Builds the translation block inserted below the range (no trailing blank line).
 */
export function formatInsertedTranslation(translatedText: string): string {
  return `----- Translation -----\n${translatedText}\n-----------------------`;
}

/**
 * Full insert payload: leading newline to start below the range, plus optional
 * trailing newline when the caret needs a new empty line at EOF.
 */
export function buildInsertText(
  translatedText: string,
  appendTrailingNewline: boolean
): string {
  const body = `\n${formatInsertedTranslation(translatedText)}`;
  return appendTrailingNewline ? `${body}\n` : body;
}

/**
 * True when insertion is on the document's last line (no following line exists).
 */
export function needsTrailingNewlineForCursor(
  document: Pick<vscode.TextDocument, 'lineCount'>,
  insertPosition: Pick<vscode.Position, 'line'>
): boolean {
  return insertPosition.line >= document.lineCount - 1;
}

/**
 * Position at the end of the last line covered by the range.
 * Whole-line selections often end at (nextLine, 0); treat that as the previous line.
 */
export function resolveInsertPosition(
  document: vscode.TextDocument,
  range: vscode.Range
): vscode.Position {
  if (range.end.character === 0 && range.end.line > range.start.line) {
    return document.lineAt(range.end.line - 1).range.end;
  }
  return document.lineAt(range.end.line).range.end;
}

/**
 * Caret line after inserting buildInsertText(...) at insertLine's end.
 * Lands on the line immediately below the footer
 * (pre-existing next line, or the blank line added at EOF).
 */
export function resolveCursorLineAfterInsert(
  insertLine: number,
  translatedText: string
): number {
  const translationLineCount = translatedText.split('\n').length;
  // \n----- Translation -----\n<text>\n-----------------------[?\n]
  // → line after footer
  return insertLine + 3 + translationLineCount;
}
