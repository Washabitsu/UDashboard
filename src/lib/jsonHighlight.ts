function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// Turns JSON text into HTML with coloured keys, strings, numbers and literals.
// Every piece of the input is escaped before it goes into the markup.
// Text that is not valid JSON (yet) comes back in one warning colour, so typing is never blocked.
export function highlightJson(value: string): string {
  try {
    JSON.parse(value);
  } catch {
    return `<span class="text-[#f3b0aa]">${escapeHtml(value)}</span>`;
  }

  const tokenRegex = /("(?:\\.|[^"\\])*"\s*:?)|\b(true|false|null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g;
  let highlighted = '';
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(value)) !== null) {
    highlighted += escapeHtml(value.slice(cursor, match.index));

    const token = escapeHtml(match[0]);
    if (match[1]) {
      const isKey = match[0].trimEnd().endsWith(':');
      highlighted += `<span class="${isKey ? 'text-[#9fd8c1]' : 'text-[#f1d9a0]'}">${token}</span>`;
    } else if (match[2]) {
      highlighted += `<span class="text-[#e9a100]">${token}</span>`;
    } else {
      highlighted += `<span class="text-[#c9b8f0]">${token}</span>`;
    }

    cursor = tokenRegex.lastIndex;
  }

  return highlighted + escapeHtml(value.slice(cursor));
}
