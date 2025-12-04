export const MAX_OUTPUT_LENGTH = 100_000; // 100KB (chars)
export const MAX_OUTPUT_LINES = 1000;

export interface TruncationResult {
  text: string;
  wasTruncated: boolean;
}

export function truncateOutput(text: string): TruncationResult {
  if (!text) {
    return { text, wasTruncated: false };
  }

  const lines = text.split('\n');
  let truncated = text;
  let wasTruncated = false;
  let truncationReason = '';

  // Check line limit
  if (lines.length > MAX_OUTPUT_LINES) {
    truncated = lines.slice(0, MAX_OUTPUT_LINES).join('\n');
    wasTruncated = true;
    truncationReason = `Exceeded ${MAX_OUTPUT_LINES} line limit`;
  }

  // Check character limit
  if (truncated.length > MAX_OUTPUT_LENGTH) {
    truncated = truncated.substring(0, MAX_OUTPUT_LENGTH);
    wasTruncated = true;
    truncationReason = `Exceeded ${MAX_OUTPUT_LENGTH} character limit`;
  }

  // Append truncation message if truncated
  if (wasTruncated) {
    truncated += `\n\n... [Output truncated. ${truncationReason}]`;
  }

  return { text: truncated, wasTruncated };
}
