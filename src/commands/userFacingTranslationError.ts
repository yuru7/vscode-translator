import { TranslationError } from '../errors/TranslationError';

export function userFacingTranslationError(error: TranslationError): string {
  switch (error.kind) {
    case 'timeout':
      return 'Translator: Google Translate request timed out.';
    case 'rate_limit':
      return 'Translator: Google Translate rate limit exceeded. Try again later.';
    case 'empty':
      return 'Translator: Google Translate returned an empty result.';
    case 'protocol':
      return 'Translator: Unexpected response from Google Translate.';
    case 'network':
    default:
      return 'Translator: Google Translate request failed.';
  }
}
