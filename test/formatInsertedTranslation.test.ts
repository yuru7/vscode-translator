import { describe, expect, it } from 'vitest';
import {
  buildInsertText,
  formatInsertedTranslation,
  needsTrailingNewlineForCursor,
  resolveCursorLineAfterInsert,
} from '../src/commands/formatInsertedTranslation';

describe('formatInsertedTranslation', () => {
  it('wraps a single-line translation with header and footer', () => {
    expect(formatInsertedTranslation('こんにちは')).toBe(
      '----- Translation -----\nこんにちは\n-----------------------'
    );
  });

  it('preserves multi-line translation bodies', () => {
    expect(formatInsertedTranslation('一行目\n二行目')).toBe(
      '----- Translation -----\n一行目\n二行目\n-----------------------'
    );
  });
});

describe('buildInsertText', () => {
  it('prefixes a newline and omits a trailing blank line by default', () => {
    expect(buildInsertText('こんにちは', false)).toBe(
      '\n----- Translation -----\nこんにちは\n-----------------------'
    );
  });

  it('appends a trailing newline when requested for EOF caret placement', () => {
    expect(buildInsertText('こんにちは', true)).toBe(
      '\n----- Translation -----\nこんにちは\n-----------------------\n'
    );
  });
});

describe('needsTrailingNewlineForCursor', () => {
  it('is true only on the last line of the document', () => {
    expect(
      needsTrailingNewlineForCursor({ lineCount: 5 }, { line: 4 })
    ).toBe(true);
    expect(
      needsTrailingNewlineForCursor({ lineCount: 5 }, { line: 3 })
    ).toBe(false);
  });
});

describe('resolveCursorLineAfterInsert', () => {
  it('places the caret on the line after the footer', () => {
    // line 0 original → header 1 → text 2 → footer 3 → caret 4
    expect(resolveCursorLineAfterInsert(0, 'こんにちは')).toBe(4);
  });

  it('accounts for multi-line translation bodies', () => {
    // line 5 original → header 6 → line1 7 → line2 8 → footer 9 → caret 10
    expect(resolveCursorLineAfterInsert(5, '一行目\n二行目')).toBe(10);
  });
});
