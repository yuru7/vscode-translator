import {
  EmptyTranslationError,
  GoogleProtocolError,
  NetworkError,
  RateLimitError,
  TimeoutError,
} from '../errors/TranslationError';
import type { TranslateClient } from './TranslateClient';
import { parseGoogleResponse } from './parseGoogleResponse';
import type { TranslationRequest, TranslationResult } from './types';

const ENDPOINT = 'https://translate.google.com/translate_a/single';
const DEFAULT_TIMEOUT_MS = 10_000;

export class GoogleTranslateClient implements TranslateClient {
  constructor(private readonly timeoutMs: number = DEFAULT_TIMEOUT_MS) {}

  async translate(request: TranslationRequest): Promise<TranslationResult> {
    const url = new URL(ENDPOINT);
    url.searchParams.set('client', 'gtx');
    url.searchParams.set('sl', normalizeLanguage(request.sourceLanguage));
    url.searchParams.set('tl', request.targetLanguage);
    url.searchParams.set('dt', 't');
    url.searchParams.set('ie', 'UTF-8');
    url.searchParams.set('oe', 'UTF-8');
    url.searchParams.set('q', request.text);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
        },
      });
    } catch (error) {
      if (isAbortError(error)) {
        throw new TimeoutError(
          `Google Translate request timed out after ${this.timeoutMs}ms.`
        );
      }
      throw new NetworkError('Google Translate network request failed.', error);
    } finally {
      clearTimeout(timer);
    }

    if (response.status === 429) {
      throw new RateLimitError('Google Translate rate limit exceeded.');
    }

    if (!response.ok) {
      throw new NetworkError(
        `Google Translate request failed with status ${response.status}.`
      );
    }

    let data: unknown;
    try {
      data = await response.json();
    } catch (error) {
      throw new GoogleProtocolError(
        'Google Translate returned invalid JSON.',
        error
      );
    }

    const result = parseGoogleResponse(data);
    if (!result.text.trim()) {
      throw new EmptyTranslationError('Google Translate returned an empty translation.');
    }

    return result;
  }
}

function normalizeLanguage(sourceLanguage: string): string {
  const normalized = sourceLanguage.trim();
  return normalized === '' ? 'auto' : normalized;
}

function isAbortError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as { name?: string }).name === 'AbortError'
  );
}
