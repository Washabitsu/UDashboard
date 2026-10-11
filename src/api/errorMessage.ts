type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function extractFromDetail(detail: unknown): string | null {
  if (typeof detail === 'string' && detail.trim()) {
    return detail;
  }

  if (Array.isArray(detail)) {
    const parts = detail
      .map((item) => {
        if (typeof item === 'string') {
          return item;
        }
        if (isRecord(item) && typeof item.msg === 'string') {
          return item.msg;
        }
        return null;
      })
      .filter((part): part is string => Boolean(part && part.trim()));

    if (parts.length > 0) {
      return parts.join(', ');
    }
  }

  return null;
}

export function getRequestErrorMessage(error: unknown, fallbackMessage: string): string {
  if (isRecord(error)) {
    const response = error.response;
    if (isRecord(response)) {
      const data = response.data;
      if (isRecord(data)) {
        const detailMessage = extractFromDetail(data.detail);
        if (detailMessage) {
          return detailMessage;
        }

        const message = data.message;
        if (typeof message === 'string' && message.trim()) {
          return message;
        }

        const errorText = data.error;
        if (typeof errorText === 'string' && errorText.trim()) {
          return errorText;
        }
      }
    }

    const message = error.message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  return fallbackMessage;
}
