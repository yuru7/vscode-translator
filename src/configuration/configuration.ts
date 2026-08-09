import * as vscode from 'vscode';
import { normalizeSourceLanguage } from './normalizeSourceLanguage';

export interface TranslatorConfiguration {
  sourceLanguage: string;
  targetLanguage: string;
  reverseLanguage: string;
}

export function getConfiguration(): TranslatorConfiguration {
  const config = vscode.workspace.getConfiguration('translator');

  return {
    sourceLanguage: normalizeSourceLanguage(
      config.get<string>('sourceLanguage', 'auto')
    ),
    targetLanguage: config.get<string>('targetLanguage', 'ja') || 'ja',
    reverseLanguage: config.get<string>('reverseLanguage', 'en') || 'en',
  };
}

export { normalizeSourceLanguage };
