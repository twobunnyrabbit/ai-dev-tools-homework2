import { useEffect, useRef, useState } from 'react';
import type { ExecutionResult } from '../types/execution.js';

interface OutputPanelProps {
  result: ExecutionResult | null;
  isExecuting: boolean;
  onClear: () => void;
}

export function OutputPanel({ result, isExecuting, onClear }: OutputPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const outputRef = useRef<HTMLDivElement>(null);

  // Auto-expand when execution starts or result arrives
  useEffect(() => {
    if (isExecuting || result) {
      setIsCollapsed(false);
    }
  }, [isExecuting, result]);

  // Auto-scroll to bottom on new output
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [result]);

  const getStatusColor = (status: ExecutionResult['status']) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'timeout':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusLabel = (status: ExecutionResult['status']) => {
    switch (status) {
      case 'success':
        return 'Success';
      case 'error':
        return 'Error';
      case 'timeout':
        return 'Timeout';
      case 'running':
        return 'Running...';
      default:
        return 'Idle';
    }
  };

  return (
    <div className="border-t border-gray-700 bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white"
        >
          <span className={`transition-transform ${isCollapsed ? '' : 'rotate-90'}`}>
            ▶
          </span>
          Output
          {result && (
            <span className={`ml-2 text-xs ${getStatusColor(result.status)}`}>
              {getStatusLabel(result.status)}
            </span>
          )}
          {result?.executionTime !== undefined && (
            <span className="ml-2 text-xs text-gray-500">
              {result.executionTime}ms
            </span>
          )}
        </button>
        <button
          onClick={onClear}
          className="text-xs text-gray-400 hover:text-white"
          disabled={!result}
        >
          Clear
        </button>
      </div>

      {/* Output Content */}
      {!isCollapsed && (
        <div
          ref={outputRef}
          className="max-h-[300px] overflow-y-auto px-4 py-3 bg-gray-950"
        >
          {isExecuting && (
            <div className="text-gray-400 animate-pulse">Running code...</div>
          )}

          {!isExecuting && !result && (
            <div className="text-gray-500 text-sm">
              No output yet. Press Cmd/Ctrl+Enter to run code.
            </div>
          )}

          {result && (
            <div className="font-mono text-sm space-y-2">
              {/* Standard Output */}
              {result.output && (
                <div className="text-gray-200 whitespace-pre-wrap">
                  {result.output}
                </div>
              )}

              {/* Error Output */}
              {result.error && (
                <div className="text-red-400 whitespace-pre-wrap">
                  {result.error}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
