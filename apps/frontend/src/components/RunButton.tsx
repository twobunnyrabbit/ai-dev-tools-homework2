import type { Language } from '../types/execution.js';

interface RunButtonProps {
  onRun: () => void;
  isExecuting: boolean;
  language: string;
}

const SUPPORTED_LANGUAGES: Language[] = ['javascript', 'typescript', 'python'];

export function RunButton({ onRun, isExecuting, language }: RunButtonProps) {
  const isSupported = SUPPORTED_LANGUAGES.includes(language as Language);

  return (
    <div className="relative group">
      <button
        onClick={onRun}
        disabled={!isSupported || isExecuting}
        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
          isSupported && !isExecuting
            ? 'bg-green-600 text-white hover:bg-green-700'
            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
        }`}
        title={isSupported ? 'Run code (Cmd/Ctrl+Enter)' : `Code execution not available for ${language}`}
      >
        {isExecuting ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin">⟳</span>
            Running...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            ▶ Run
          </span>
        )}
      </button>

      {/* Tooltip for unsupported languages */}
      {!isSupported && (
        <div className="absolute top-full mt-2 right-0 w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          Code execution not available for {language}. Supported: JavaScript, TypeScript, Python.
        </div>
      )}
    </div>
  );
}
