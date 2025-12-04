import { useEffect, useRef, useState, useCallback } from 'react';
import type { Socket } from 'socket.io-client';
import type { ExecutionResult, WorkerMessage, Language } from '../types/execution.js';

export function useCodeExecution(socket?: Socket | null, sessionId?: string) {
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  // Use refs to track latest socket and sessionId without recreating worker
  const socketRef = useRef(socket);
  const sessionIdRef = useRef(sessionId);

  // Update refs when props change
  useEffect(() => {
    socketRef.current = socket;
    sessionIdRef.current = sessionId;
  }, [socket, sessionId]);

  // Initialize worker (only once)
  useEffect(() => {
    // Create worker instance
    const worker = new Worker(
      new URL('../workers/execution.worker.ts', import.meta.url),
      { type: 'module' }
    );
    workerRef.current = worker;

    // Listen for messages from worker
    const handleMessage = (event: MessageEvent<WorkerMessage>) => {
      console.log('[useCodeExecution] Worker message received:', event.data);
      const { type, result: workerResult } = event.data;

      if (type === 'result' || type === 'error') {
        const finalResult = workerResult || null;
        setResult(finalResult);
        setIsExecuting(false);

        // Emit execution result via socket if connected (using refs)
        if (socketRef.current && sessionIdRef.current && finalResult) {
          console.log('[useCodeExecution] Emitting execution-result via socket');
          socketRef.current.emit('execution-result', {
            sessionId: sessionIdRef.current,
            result: finalResult,
          });
        }
      }
    };

    const handleError = (error: ErrorEvent) => {
      console.error('[useCodeExecution] Worker error:', error);
      setIsExecuting(false);
      setResult({
        status: 'error',
        error: error.message || 'Worker execution failed',
        timestamp: Date.now(),
      });
    };

    worker.addEventListener('message', handleMessage);
    worker.addEventListener('error', handleError);

    console.log('[useCodeExecution] Worker initialized');

    // Cleanup on unmount
    return () => {
      console.log('[useCodeExecution] Cleaning up worker');
      worker.removeEventListener('message', handleMessage);
      worker.removeEventListener('error', handleError);
      worker.terminate();
      workerRef.current = null;
    };
  }, []); // Empty deps - only create worker once

  // Execute code function - use regular function to access current workerRef
  const executeCode = useCallback((code: string, language: Language) => {
    console.log('[useCodeExecution] executeCode called', { language, codeLength: code.length, hasWorker: !!workerRef.current });

    const worker = workerRef.current;
    if (!worker) {
      console.error('[useCodeExecution] Worker not initialized!');
      setResult({
        status: 'error',
        error: 'Execution worker not initialized',
        timestamp: Date.now(),
      });
      setIsExecuting(false);
      return;
    }

    // Check if code is empty
    if (!code || code.trim().length === 0) {
      console.warn('[useCodeExecution] Empty code provided');
      setResult({
        status: 'error',
        error: 'No code to execute',
        timestamp: Date.now(),
      });
      setIsExecuting(false);
      return;
    }

    // Check if language is supported
    if (language !== 'javascript' && language !== 'typescript' && language !== 'python') {
      setResult({
        status: 'error',
        error: `Code execution not available for ${language}. Editor-only mode.`,
        timestamp: Date.now(),
      });
      setIsExecuting(false);
      return;
    }

    console.log('[useCodeExecution] Setting isExecuting to true');
    setIsExecuting(true);
    setResult(null);

    // Emit execution started via socket if connected (using refs)
    if (socketRef.current && sessionIdRef.current) {
      console.log('[useCodeExecution] Emitting execution-started via socket');
      socketRef.current.emit('execution-started', {
        sessionId: sessionIdRef.current,
        code,
        language,
      });
    }

    // Send execution request to worker
    console.log('[useCodeExecution] Posting message to worker', worker);
    try {
      worker.postMessage({
        type: 'execute',
        language,
        code,
      } satisfies WorkerMessage);
      console.log('[useCodeExecution] Message posted successfully');
    } catch (error) {
      console.error('[useCodeExecution] Failed to post message:', error);
      setResult({
        status: 'error',
        error: 'Failed to communicate with worker',
        timestamp: Date.now(),
      });
      setIsExecuting(false);
    }
  }, []); // Empty deps is OK - we access workerRef.current directly

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
