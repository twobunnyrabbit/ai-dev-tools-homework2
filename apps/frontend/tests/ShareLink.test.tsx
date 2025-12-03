import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShareLink } from '../src/components/ShareLink';

describe('ShareLink', () => {
  const mockWriteText = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock navigator.clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: mockWriteText.mockResolvedValue(undefined),
      },
      writable: true,
      configurable: true,
    });
  });

  it('should render copy button with initial text', () => {
    render(<ShareLink sessionId="test-session-123" />);
    expect(screen.getByRole('button')).toHaveTextContent('Copy Share Link');
  });

  it('should show "Copied!" text after clicking', async () => {
    const user = userEvent.setup();
    render(<ShareLink sessionId="test-session-123" />);

    const button = screen.getByRole('button');
    await user.click(button);

    await waitFor(() => {
      expect(button).toHaveTextContent('Copied!');
    });
  });

  it('should render with session ID prop', () => {
    const { rerender } = render(<ShareLink sessionId="session-1" />);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<ShareLink sessionId="session-2" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
