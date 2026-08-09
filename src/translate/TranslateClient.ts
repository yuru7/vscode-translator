import type { TranslationRequest, TranslationResult } from './types';

export interface TranslateClient {
  translate(request: TranslationRequest): Promise<TranslationResult>;
}
