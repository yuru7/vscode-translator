import * as vscode from 'vscode';

let channel: vscode.OutputChannel | undefined;

export function getOutputChannel(): vscode.OutputChannel {
  if (!channel) {
    channel = vscode.window.createOutputChannel('Translator');
  }
  return channel;
}

export function logInfo(message: string): void {
  getOutputChannel().appendLine(`[info] ${message}`);
}

export function logError(message: string, error?: unknown): void {
  const details =
    error instanceof Error
      ? `${error.name}: ${error.message}`
      : error !== undefined
        ? String(error)
        : undefined;

  getOutputChannel().appendLine(
    details ? `[error] ${message} (${details})` : `[error] ${message}`
  );
}
