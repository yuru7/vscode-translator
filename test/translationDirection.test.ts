import { describe, expect, it } from 'vitest';
import type { TranslatorConfiguration } from '../src/configuration/configuration';
import {
  needsReverseTranslation,
  resolveTranslationDirection,
} from '../src/translate/resolveTranslationDirection';

const baseConfig: TranslatorConfiguration = {
  sourceLanguage: 'auto',
  targetLanguage: 'ja',
  reverseLanguage: 'en',
};

describe('resolveTranslationDirection', () => {
  it('uses fixed source and target when source is not auto', () => {
    expect(
      resolveTranslationDirection(
        { ...baseConfig, sourceLanguage: 'en' },
        'ja'
      )
    ).toEqual({
      sourceLanguage: 'en',
      targetLanguage: 'ja',
    });
  });

  it('keeps target when detected differs from target', () => {
    expect(resolveTranslationDirection(baseConfig, 'en')).toEqual({
      sourceLanguage: 'en',
      targetLanguage: 'ja',
    });
  });

  it('switches to reverseLanguage when detected equals target', () => {
    expect(resolveTranslationDirection(baseConfig, 'ja')).toEqual({
      sourceLanguage: 'ja',
      targetLanguage: 'en',
    });
  });

  it('is case-insensitive for language equality', () => {
    expect(resolveTranslationDirection(baseConfig, 'JA')).toEqual({
      sourceLanguage: 'JA',
      targetLanguage: 'en',
    });
  });
});

describe('needsReverseTranslation', () => {
  it('is false for fixed source language', () => {
    expect(
      needsReverseTranslation(
        { ...baseConfig, sourceLanguage: 'en' },
        'ja'
      )
    ).toBe(false);
  });

  it('is true when auto-detected language equals target', () => {
    expect(needsReverseTranslation(baseConfig, 'ja')).toBe(true);
  });

  it('is false when auto-detected language differs from target', () => {
    expect(needsReverseTranslation(baseConfig, 'en')).toBe(false);
  });

  it('is false when detected language is missing', () => {
    expect(needsReverseTranslation(baseConfig, undefined)).toBe(false);
  });
});
