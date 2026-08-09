import { GoogleProtocolError } from '../errors/TranslationError';
import type { TranslationResult } from './types';

/**
 * Parses the unofficial Google Translate web endpoint response.
 * Expected shape (simplified):
 * [[["translated","original",...], ...], null, "detectedLang", ...]
 */
export function parseGoogleResponse(data: unknown): TranslationResult {
  if (!Array.isArray(data)) {
    throw new GoogleProtocolError('Google Translate response is not an array.');
  }

  const segments = data[0];
  if (!Array.isArray(segments)) {
    throw new GoogleProtocolError(
      'Google Translate response is missing translation segments.'
    );
  }

  const parts: string[] = [];
  for (const segment of segments) {
    if (!Array.isArray(segment) || typeof segment[0] !== 'string') {
      throw new GoogleProtocolError(
        'Google Translate response contains an invalid translation segment.'
      );
    }
    parts.push(segment[0]);
  }

  const text = parts.join('');
  const detectedLanguage = extractDetectedLanguage(data);

  return {
    text,
    ...(detectedLanguage ? { detectedLanguage } : {}),
  };
}

function extractDetectedLanguage(data: unknown[]): string | undefined {
  const candidate = data[2];
  if (typeof candidate === 'string' && candidate.trim() !== '') {
    return candidate;
  }

  const nested = data[8];
  if (Array.isArray(nested) && Array.isArray(nested[0])) {
    const first = nested[0][0];
    if (typeof first === 'string' && first.trim() !== '') {
      return first;
    }
  }

  return undefined;
}
