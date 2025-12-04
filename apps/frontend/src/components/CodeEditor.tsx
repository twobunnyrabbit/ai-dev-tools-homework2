import { Editor } from '@monaco-editor/react';
import type * as Monaco from 'monaco-editor';
import type { Language } from '../types/session';

interface CodeEditorProps {
  value: string;
  language: Language;
  onChange: (value: string) => void;
  disabled?: boolean;
  onRun?: () => void;
}

// Map our language types to Monaco language IDs
const languageMap: Record<Language, string> = {
  javascript: 'javascript',
  typescript: 'typescript',
  python: 'python',
  java: 'java',
  go: 'go',
  cpp: 'cpp',
};

export function CodeEditor({ value, language, onChange, disabled = false, onRun }: CodeEditorProps) {
  const handleEditorChange = (newValue: string | undefined) => {
    if (!disabled) {
      onChange(newValue || '');
    }
  };

  const handleEditorDidMount = (editor: Monaco.editor.IStandaloneCodeEditor, monaco: typeof Monaco) => {
    if (onRun) {
      // Add keyboard shortcut: Cmd/Ctrl+Enter to run code
      editor.addAction({
        id: 'run-code',
        label: 'Run Code',
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
        run: () => {
          onRun();
        },
      });
    }
  };

  return (
    <div className="relative h-full">
      {disabled && (
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="text-white text-lg">Connecting...</div>
        </div>
      )}
      <Editor
        height="100%"
        language={languageMap[language]}
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme="vs-dark"
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          wordWrap: 'on',
          automaticLayout: true,
          scrollBeyondLastLine: false,
          padding: { top: 16, bottom: 16 },
          tabSize: 2,
          insertSpaces: true,
          readOnly: disabled,
        }}
      />
    </div>
  );
}
