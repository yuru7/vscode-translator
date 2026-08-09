import { describe, expect, it } from 'vitest';
import { GoogleProtocolError } from '../src/errors/TranslationError';
import { parseGoogleResponse } from '../src/translate/parseGoogleResponse';

describe('parseGoogleResponse', () => {
  it('parses a single sentence', () => {
    const data = [
      [['こんにちは、世界', 'Hello, World', null, null, 10]],
      null,
      'en',
    ];

    expect(parseGoogleResponse(data)).toEqual({
      text: 'こんにちは、世界',
      detectedLanguage: 'en',
    });
  });

  it('concatenates multiple fragments', () => {
    const data = [
      [
        ['1行目。\n', 'Line one.\n', null, null, 3],
        ['2行目。', 'Line two.', null, null, 3],
      ],
      null,
      'en',
    ];

    expect(parseGoogleResponse(data)).toEqual({
      text: '1行目。\n2行目。',
      detectedLanguage: 'en',
    });
  });

  it('preserves newlines in translated text', () => {
    const data = [[['A\nB', 'A\nB', null, null, 1]], null, 'en'];
    expect(parseGoogleResponse(data).text).toBe('A\nB');
  });

  it('returns empty text for empty segment list', () => {
    expect(parseGoogleResponse([[], null, 'en'])).toEqual({
      text: '',
      detectedLanguage: 'en',
    });
  });

  it('throws on empty response array root', () => {
    expect(() => parseGoogleResponse({})).toThrow(GoogleProtocolError);
  });

  it('throws on unexpected segment shape', () => {
    expect(() => parseGoogleResponse([[null], null, 'en'])).toThrow(
      GoogleProtocolError
    );
  });

  it('throws when translation segments are missing', () => {
    expect(() => parseGoogleResponse([null, null, 'en'])).toThrow(
      GoogleProtocolError
    );
  });

  it('returns detectedLanguage when present', () => {
    const result = parseGoogleResponse([
      [['Hello', 'こんにちは', null, null, 10]],
      null,
      'ja',
    ]);
    expect(result.detectedLanguage).toBe('ja');
  });

  it('omits detectedLanguage when absent', () => {
    const result = parseGoogleResponse([
      [['Hello', 'こんにちは', null, null, 10]],
      null,
      null,
    ]);
    expect(result.detectedLanguage).toBeUndefined();
    expect(result.text).toBe('Hello');
  });

  it('falls back to nested language array when index 2 is missing', () => {
    const data = [
      [['Hi', 'やあ', null, null, 1]],
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      [['ja'], null, [1], ['ja']],
    ];

    expect(parseGoogleResponse(data).detectedLanguage).toBe('ja');
  });
});
