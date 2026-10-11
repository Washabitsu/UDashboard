// Dates come from the API as ISO strings. Anything that can't be read as a date is shown as it is.
export function formatDate(value?: string | null, fallback = 'Never'): string {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export function shorten(value: string, start = 10, end = 6): string {
  return value.length <= start + end + 1 ? value : `${value.slice(0, start)}…${value.slice(-end)}`;
}

// countLabel(1, 'model') -> "1 model", countLabel(3, 'model') -> "3 models"
export function countLabel(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

// The line above a table: "5 models" normally, "2 of 5 models" while a search hides some of them
export function listSummary(shown: number, total: number, singular: string): string {
  return shown === total ? countLabel(total, singular) : `${shown} of ${countLabel(total, singular)}`;
}
