// The list endpoints answer with a plain array today. Older versions wrapped it in an object
// ({ models: [...] }, { items: [...] }), so both shapes are accepted.
export function toList<T>(response: unknown, keys: string[] = []): T[] {
  if (Array.isArray(response)) {
    return response as T[];
  }

  if (!response || typeof response !== 'object') {
    return [];
  }

  const record = response as Record<string, unknown>;
  for (const key of [...keys, 'items', 'results']) {
    const value = record[key];
    if (Array.isArray(value)) {
      return value as T[];
    }
  }

  return [];
}
