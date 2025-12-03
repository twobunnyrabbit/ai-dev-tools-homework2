import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CodeEditor } from '../src/components/CodeEditor';

// Mock Monaco Editor
vi.mock('@monaco-editor/react', () => ({
  Editor: ({ value, language, onChange, options }: any) => (
    <div data-testid="monaco-editor">
      <div data-language={language}>{value}</div>
      <div data-readonly={options?.readOnly}>
        {options?.readOnly ? 'readonly' : 'editable'}
      </div>
    </div>
  ),
}));

describe('CodeEditor', () => {
  it('should render editor with initial value', () => {
    const onChange = vi.fn();
    render(
      <CodeEditor
        value="console.log('test');"
        language="javascript"
        onChange={onChange}
      />
    );

    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
    expect(screen.getByText("console.log('test');")).toBeInTheDocument();
  });

  it('should use correct Monaco language for each language type', () => {
    const onChange = vi.fn();
    const languages = [
      { lang: 'javascript' as const, expected: 'javascript' },
      { lang: 'typescript' as const, expected: 'typescript' },
      { lang: 'python' as const, expected: 'python' },
      { lang: 'java' as const, expected: 'java' },
      { lang: 'go' as const, expected: 'go' },
      { lang: 'cpp' as const, expected: 'cpp' },
    ];

    languages.forEach(({ lang, expected }) => {
      const { container } = render(
        <CodeEditor value="" language={lang} onChange={onChange} />
      );
      const langDiv = container.querySelector(`[data-language="${expected}"]`);
      expect(langDiv).toBeInTheDocument();
    });
  });

  it('should show "Connecting..." overlay when disabled', () => {
    const onChange = vi.fn();
    render(
      <CodeEditor
        value="test code"
        language="javascript"
        onChange={onChange}
        disabled={true}
      />
    );

    expect(screen.getByText('Connecting...')).toBeInTheDocument();
  });

  it('should not show overlay when enabled', () => {
    const onChange = vi.fn();
    render(
      <CodeEditor
        value="test code"
        language="javascript"
        onChange={onChange}
        disabled={false}
      />
    );

    expect(screen.queryByText('Connecting...')).not.toBeInTheDocument();
  });

  it('should set editor to readonly when disabled', () => {
    const onChange = vi.fn();
    const { container } = render(
      <CodeEditor
        value="test code"
        language="javascript"
        onChange={onChange}
        disabled={true}
      />
    );

    const readonlyDiv = container.querySelector('[data-readonly="true"]');
    expect(readonlyDiv).toBeInTheDocument();
  });

  it('should set editor to editable when not disabled', () => {
    const onChange = vi.fn();
    const { container } = render(
      <CodeEditor
        value="test code"
        language="javascript"
        onChange={onChange}
        disabled={false}
      />
    );

    const editableDiv = container.querySelector('[data-readonly="false"]');
    expect(editableDiv).toBeInTheDocument();
  });
});
