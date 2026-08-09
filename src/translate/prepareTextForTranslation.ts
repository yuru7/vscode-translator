/**
 * Prepares selected text before sending it to the translation API.
 *
 * When the whole selection is a standalone variable-style identifier
 * (camelCase / PascalCase / kebab-case / snake_case / SCREAMING_SNAKE_CASE),
 * split it into space-separated words so the translator can treat it as
 * natural language.
 *
 * Code-like expressions that mix other symbols (e.g. `.`, `()`, `::`) are
 * left unchanged so identifiers inside them are not broken apart and
 * mistranslated as ordinary words.
 */
export function prepareTextForTranslation(text: string): string {
  const trimmed = text.trim();
  if (!isVariableStyleIdentifier(trimmed)) {
    return text;
  }

  const words = splitVariableIdentifier(trimmed);
  return words.length > 0 ? words.join(' ') : text;
}

/**
 * True when the entire string is a single identifier that uses a naming
 * convention with word boundaries (not a plain word or code expression).
 */
function isVariableStyleIdentifier(text: string): boolean {
  if (!text || !/^[A-Za-z_][A-Za-z0-9_-]*$/.test(text)) {
    return false;
  }

  return (
    text.includes('_') ||
    text.includes('-') ||
    /[a-z][A-Z]/.test(text) ||
    /[A-Z]{2,}[a-z]/.test(text)
  );
}

function splitVariableIdentifier(text: string): string[] {
  return text
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .split(/[\s_-]+/)
    .filter(Boolean);
}
