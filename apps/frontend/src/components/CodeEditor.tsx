import { Editor } from '@monaco-editor/react';
import type { Language } from '../types/session';

interface CodeEditorProps {
  value: string;
  language: Language;
  onChange: (value: string) => void;
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

export function CodeEditor({ value, language, onChange }: CodeEditorProps) {
  const handleEditorChange = (newValue: string | undefined) => {
    onChange(newValue || '');
  };

  return (
    <Editor
      height="100%"
      language={languageMap[language]}
      value={value}
      onChange={handleEditorChange}
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
      }}
    />
  );
}
