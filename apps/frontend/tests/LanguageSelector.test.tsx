import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageSelector } from '../src/components/LanguageSelector';
import type { Language } from '../src/types/session';

describe('LanguageSelector', () => {
  it('should render with current language selected', () => {
    const onChange = vi.fn();
    render(<LanguageSelector value="javascript" onChange={onChange} />);

    const select = screen.getByLabelText('Language:') as HTMLSelectElement;
    expect(select.value).toBe('javascript');
  });

  it('should display all supported languages', () => {
    const onChange = vi.fn();
    render(<LanguageSelector value="javascript" onChange={onChange} />);

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(6);
    expect(options.map(opt => opt.textContent)).toEqual([
      'JavaScript',
      'TypeScript',
      'Python',
      'Java',
      'Go',
      'C++',
    ]);
  });

  it('should call onChange when language is changed', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<LanguageSelector value="javascript" onChange={onChange} />);

    const select = screen.getByLabelText('Language:');
    await user.selectOptions(select, 'python');

    expect(onChange).toHaveBeenCalledWith('python');
  });

  it('should call onChange with correct language type', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<[Language], void>();
    render(<LanguageSelector value="javascript" onChange={onChange} />);

    const select = screen.getByLabelText('Language:');
    await user.selectOptions(select, 'typescript');

    expect(onChange).toHaveBeenCalledWith('typescript');
    expect(typeof onChange.mock.calls[0][0]).toBe('string');
  });

  it('should update when value prop changes', () => {
    const onChange = vi.fn();
    const { rerender } = render(<LanguageSelector value="javascript" onChange={onChange} />);

    let select = screen.getByLabelText('Language:') as HTMLSelectElement;
    expect(select.value).toBe('javascript');

    rerender(<LanguageSelector value="python" onChange={onChange} />);

    select = screen.getByLabelText('Language:') as HTMLSelectElement;
    expect(select.value).toBe('python');
  });
});
