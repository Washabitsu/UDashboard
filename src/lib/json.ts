export function toJsonText(value: unknown): string {
  return JSON.stringify(value ?? {}, null, 2);
}

// Reads the text of a JSON editor. Only an object is accepted ({ ... }), not a list or a single value.
// Returns null when the text can't be used.
export function parseJsonObject(text: string): Record<string, unknown> | null {
  try {
    const parsed: unknown = JSON.parse(text);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // Not valid JSON
  }

  return null;
}
