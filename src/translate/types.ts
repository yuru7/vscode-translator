export interface TranslationRequest {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export interface TranslationResult {
  text: string;
  detectedLanguage?: string;
}

export type TranslationErrorKind =
  | 'network'
  | 'timeout'
  | 'rate_limit'
  | 'protocol'
  | 'empty';
