import type { TranslatorConfiguration } from '../configuration/configuration';

export interface TranslationDirection {
  sourceLanguage: string;
  targetLanguage: string;
}

/**
 * Resolves the final translation direction after an auto-detect pass.
 * When source is fixed (not auto), detectedLanguage is ignored.
 */
export function resolveTranslationDirection(
  config: TranslatorConfiguration,
  detectedLanguage?: string
): TranslationDirection {
  if (config.sourceLanguage !== 'auto') {
    return {
      sourceLanguage: config.sourceLanguage,
      targetLanguage: config.targetLanguage,
    };
  }

  const detected = detectedLanguage?.trim();
  if (detected && languagesEqual(detected, config.targetLanguage)) {
    return {
      sourceLanguage: detected,
      targetLanguage: config.reverseLanguage,
    };
  }

  return {
    sourceLanguage: detected || 'auto',
    targetLanguage: config.targetLanguage,
  };
}

/**
 * Returns true when a second request is needed for reverse translation.
 */
export function needsReverseTranslation(
  config: TranslatorConfiguration,
  detectedLanguage?: string
): boolean {
  if (config.sourceLanguage !== 'auto') {
    return false;
  }
  const detected = detectedLanguage?.trim();
  if (!detected) {
    return false;
  }
  return languagesEqual(detected, config.targetLanguage);
}

function languagesEqual(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}
