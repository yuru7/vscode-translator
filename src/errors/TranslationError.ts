import type { TranslationErrorKind } from '../translate/types';

export class TranslationError extends Error {
  readonly kind: TranslationErrorKind;

  constructor(kind: TranslationErrorKind, message: string, cause?: unknown) {
    super(message);
    this.name = 'TranslationError';
    this.kind = kind;
    if (cause !== undefined) {
      (this as Error & { cause?: unknown }).cause = cause;
    }
  }
}

export class NetworkError extends TranslationError {
  constructor(message: string, cause?: unknown) {
    super('network', message, cause);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends TranslationError {
  constructor(message: string, cause?: unknown) {
    super('timeout', message, cause);
    this.name = 'TimeoutError';
  }
}

export class RateLimitError extends TranslationError {
  constructor(message: string, cause?: unknown) {
    super('rate_limit', message, cause);
    this.name = 'RateLimitError';
  }
}

export class GoogleProtocolError extends TranslationError {
  constructor(message: string, cause?: unknown) {
    super('protocol', message, cause);
    this.name = 'GoogleProtocolError';
  }
}

export class EmptyTranslationError extends TranslationError {
  constructor(message: string, cause?: unknown) {
    super('empty', message, cause);
    this.name = 'EmptyTranslationError';
  }
}
