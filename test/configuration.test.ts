import { describe, expect, it } from 'vitest';
import { normalizeSourceLanguage } from '../src/configuration/normalizeSourceLanguage';

describe('normalizeSourceLanguage', () => {
  it('keeps auto as auto', () => {
    expect(normalizeSourceLanguage('auto')).toBe('auto');
  });

  it('normalizes empty string to auto', () => {
    expect(normalizeSourceLanguage('')).toBe('auto');
  });

  it('normalizes whitespace-only to auto', () => {
    expect(normalizeSourceLanguage('   ')).toBe('auto');
  });

  it('keeps explicit language codes', () => {
    expect(normalizeSourceLanguage('en')).toBe('en');
    expect(normalizeSourceLanguage('ja')).toBe('ja');
    expect(normalizeSourceLanguage('zh-CN')).toBe('zh-CN');
  });

  it('trims explicit language codes', () => {
    expect(normalizeSourceLanguage('  de  ')).toBe('de');
  });

  it('treats undefined as auto', () => {
    expect(normalizeSourceLanguage(undefined)).toBe('auto');
  });
});
