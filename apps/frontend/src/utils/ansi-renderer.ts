import { AnsiUp } from 'ansi_up';

// Create a singleton instance for performance
const ansiUp = new AnsiUp();

/**
 * Converts ANSI escape codes to HTML
 * XSS-safe - ansi_up escapes HTML by default
 */
export function renderAnsiText(text: string): string {
  if (!text) {
    return '';
  }
  return ansiUp.ansi_to_html(text);
}
