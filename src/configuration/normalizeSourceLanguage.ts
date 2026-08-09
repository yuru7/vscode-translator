export function normalizeSourceLanguage(value: string | undefined): string {
  const trimmed = (value ?? '').trim();
  return trimmed === '' ? 'auto' : trimmed;
}
