import type { WorkerMessage, ExecutionResult } from '../types/execution.js';
import { executeJavaScript } from './executors/javascript.executor.js';
import { executeTypeScript } from './executors/typescript.executor.js';
import { executePython } from './executors/python.executor.js';

const TIMEOUT_MS = 5000; // 5 second timeout
const PYTHON_TIMEOUT_MS = 60000; // 60 second timeout for Python (first load can take ~30s)

// Listen for messages from the main thread
self.addEventListener('message', async (event: MessageEvent<WorkerMessage>) => {
  const { type, language, code } = event.data;

  if (type !== 'execute' || !language || !code) {
    return;
  }

  let timeoutId: number | undefined;
  let executionPromise: Promise<ExecutionResult>;

  // Determine timeout based on language (Python needs longer for first-time Pyodide load)
  const timeoutMs = language === 'python' ? PYTHON_TIMEOUT_MS : TIMEOUT_MS;

  // Create timeout promise
  const timeoutPromise = new Promise<ExecutionResult>((resolve) => {
    timeoutId = self.setTimeout(() => {
      resolve({
        status: 'timeout',
        error: `Execution timeout (${timeoutMs / 1000}s limit)`,
        timestamp: Date.now(),
      });
    }, timeoutMs);
  });

  // Execute code based on language
  try {
    switch (language) {
      case 'javascript':
        executionPromise = executeJavaScript(code);
        break;
      case 'typescript':
        executionPromise = executeTypeScript(code);
        break;
      case 'python':
        executionPromise = executePython(code);
        break;
      default:
        self.postMessage({
          type: 'error',
          result: {
            status: 'error',
            error: `Unsupported language: ${language}`,
            timestamp: Date.now(),
          },
        } satisfies WorkerMessage);
        return;
    }

    // Race between execution and timeout
    const result = await Promise.race([executionPromise, timeoutPromise]);

    // Clear timeout if execution finished first
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }

    // Send result back to main thread
    self.postMessage({
      type: 'result',
      result,
    } satisfies WorkerMessage);
  } catch (error) {
    // Clear timeout on error
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    self.postMessage({
      type: 'error',
      result: {
        status: 'error',
        error: errorMessage,
        timestamp: Date.now(),
      },
    } satisfies WorkerMessage);
  }
});
