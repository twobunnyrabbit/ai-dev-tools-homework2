import { useEffect, useRef, useState, useCallback } from 'react';
import type { ExecutionResult, WorkerMessage, Language } from '../types/execution.js';

export function useCodeExecution() {
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  // Initialize worker
  useEffect(() => {
    // Create worker instance
    workerRef.current = new Worker(
      new URL('../workers/execution.worker.ts', import.meta.url),
      { type: 'module' }
    );

    // Listen for messages from worker
    const handleMessage = (event: MessageEvent<WorkerMessage>) => {
      const { type, result: workerResult } = event.data;

      if (type === 'result' || type === 'error') {
        setResult(workerResult || null);
        setIsExecuting(false);
      }
    };

    workerRef.current.addEventListener('message', handleMessage);

    // Cleanup on unmount
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  // Execute code function
  const executeCode = useCallback((code: string, language: Language) => {
    if (!workerRef.current) {
      setResult({
        status: 'error',
        error: 'Execution worker not initialized',
        timestamp: Date.now(),
      });
      return;
    }

    // Check if language is supported
    if (language !== 'javascript' && language !== 'typescript' && language !== 'python') {
      setResult({
        status: 'error',
        error: `Code execution not available for ${language}. Editor-only mode.`,
        timestamp: Date.now(),
      });
      return;
    }

    setIsExecuting(true);
    setResult(null);

    // Send execution request to worker
    workerRef.current.postMessage({
      type: 'execute',
      language,
      code,
    } satisfies WorkerMessage);
  }, []);

  // Clear results
  const clearResult = useCallback(() => {
    setResult(null);
  }, []);

  return {
    executeCode,
    clearResult,
    result,
    isExecuting,
  };
}
