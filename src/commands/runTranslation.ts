import { getConfiguration } from '../configuration/configuration';
import { logInfo } from '../output/logger';
import type { TranslateClient } from '../translate/TranslateClient';
import { prepareTextForTranslation } from '../translate/prepareTextForTranslation';
import {
  needsReverseTranslation,
  resolveTranslationDirection,
} from '../translate/resolveTranslationDirection';

export interface TranslationOutcome {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export async function runTranslation(
  client: TranslateClient,
  rawText: string
): Promise<TranslationOutcome> {
  const config = getConfiguration();
  const initialSource =
    config.sourceLanguage === 'auto' ? 'auto' : config.sourceLanguage;
  const text = prepareTextForTranslation(rawText);

  const first = await client.translate({
    text,
    sourceLanguage: initialSource,
    targetLanguage: config.targetLanguage,
  });

  let translatedText = first.text;
  let direction = resolveTranslationDirection(config, first.detectedLanguage);

  if (needsReverseTranslation(config, first.detectedLanguage)) {
    logInfo('Detected language matches target; requesting reverse translation.');
    const second = await client.translate({
      text,
      sourceLanguage: 'auto',
      targetLanguage: config.reverseLanguage,
    });
    translatedText = second.text;
    direction = {
      sourceLanguage:
        second.detectedLanguage || first.detectedLanguage || 'auto',
      targetLanguage: config.reverseLanguage,
    };
  }

  return {
    translatedText,
    sourceLanguage: direction.sourceLanguage,
    targetLanguage: direction.targetLanguage,
  };
}
