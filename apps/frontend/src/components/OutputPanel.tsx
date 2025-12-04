import { useEffect, useRef, useState } from 'react';
import type { ExecutionResult, Language } from '../types/execution.js';

interface OutputPanelProps {
  result: ExecutionResult | null;
  isExecuting: boolean;
  onClear: () => void;
  remoteResults?: Map<string, { username: string; result: ExecutionResult }>;
  remoteExecuting?: Map<string, { username: string; language: Language }>;
  currentUserId?: string;
}

export function OutputPanel({ result, isExecuting, onClear, remoteResults, remoteExecuting, currentUserId }: OutputPanelProps) {
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
  }, [result, remoteResults, remoteExecuting]);

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
          {/* Remote execution indicators */}
          {remoteExecuting && remoteExecuting.size > 0 && (
            <div className="mb-3 space-y-1">
              {Array.from(remoteExecuting.entries()).map(([userId, data]) => (
                <div key={userId} className="text-blue-400 text-sm animate-pulse">
                  🔄 {data.username} is running {data.language}...
                </div>
              ))}
            </div>
          )}

          {isExecuting && (
            <div className="text-gray-400 animate-pulse mb-3">Running code...</div>
          )}

          {!isExecuting && !result && (!remoteResults || remoteResults.size === 0) && (
            <div className="text-gray-500 text-sm">
              No output yet. Press Cmd/Ctrl+Enter to run code.
            </div>
          )}

          {/* Own result */}
          {result && (
            <div className="mb-4 pb-4 border-b border-gray-700">
              <div className="text-xs font-semibold text-gray-400 mb-2">Your Output</div>
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

                {/* Execution time */}
                {result.executionTime !== undefined && (
                  <div className="text-xs text-gray-500 mt-1">
                    Executed in {result.executionTime}ms
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Remote results */}
          {remoteResults && Array.from(remoteResults.entries())
            .sort((a, b) => a[1].username.localeCompare(b[1].username))
            .map(([userId, data]) => (
              <div key={userId} className="mb-4 pb-4 border-b border-gray-700 last:border-b-0">
                <div className="text-xs font-semibold text-gray-400 mb-2">
                  {data.username}'s Output
                </div>
                <div className="font-mono text-sm space-y-2">
                  {/* Standard Output */}
                  {data.result.output && (
                    <div className="text-gray-200 whitespace-pre-wrap">
                      {data.result.output}
                    </div>
                  )}

                  {/* Error Output */}
                  {data.result.error && (
                    <div className="text-red-400 whitespace-pre-wrap">
                      {data.result.error}
                    </div>
                  )}

                  {/* Execution time */}
                  {data.result.executionTime !== undefined && (
                    <div className="text-xs text-gray-500 mt-1">
                      Executed in {data.result.executionTime}ms
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
