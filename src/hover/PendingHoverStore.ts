import * as vscode from 'vscode';

export interface PendingHover {
  uri: string;
  range: vscode.Range;
  content: vscode.MarkdownString;
  createdAt: number;
}

const DEFAULT_TTL_MS = 30_000;

export class PendingHoverStore {
  private pending: PendingHover | undefined;
  private clearTimer: ReturnType<typeof setTimeout> | undefined;

  constructor(private readonly ttlMs: number = DEFAULT_TTL_MS) {}

  set(pending: Omit<PendingHover, 'createdAt'>): void {
    this.clearTimerIfNeeded();
    this.pending = {
      ...pending,
      createdAt: Date.now(),
    };
    this.clearTimer = setTimeout(() => {
      this.clear();
    }, this.ttlMs);
  }

  get(): PendingHover | undefined {
    if (!this.pending) {
      return undefined;
    }
    if (Date.now() - this.pending.createdAt > this.ttlMs) {
      this.clear();
      return undefined;
    }
    return this.pending;
  }

  clear(): void {
    this.clearTimerIfNeeded();
    this.pending = undefined;
  }

  private clearTimerIfNeeded(): void {
    if (this.clearTimer !== undefined) {
      clearTimeout(this.clearTimer);
      this.clearTimer = undefined;
    }
  }
}
