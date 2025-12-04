import type { ExecutionResult } from '../../types/execution.js';
import { truncateOutput } from '../utils/output-limiter.js';

export async function executeJavaScript(code: string): Promise<ExecutionResult> {
  const startTime = performance.now();
  const logs: string[] = [];
  const errors: string[] = [];

  // Capture console output
  const originalLog = console.log;
  const originalError = console.error;

  console.log = (...args: unknown[]) => {
    logs.push(args.map(arg => String(arg)).join(' '));
  };

  console.error = (...args: unknown[]) => {
    errors.push(args.map(arg => String(arg)).join(' '));
  };

  try {
    // Execute code using Function constructor (safer than eval)
    const fn = new Function(code);
    const result = fn();

    // If function returns a value, add it to output
    if (result !== undefined) {
      logs.push(String(result));
    }

    const executionTime = performance.now() - startTime;
    const { text: truncatedOutput } = truncateOutput(logs.join('\n'));

    return {
      status: 'success',
      output: truncatedOutput,
      executionTime: Math.round(executionTime),
      timestamp: Date.now(),
    };
  } catch (error) {
    const executionTime = performance.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;

    const { text: truncatedOutput } = logs.length > 0 ? truncateOutput(logs.join('\n')) : { text: '', wasTruncated: false };
    const { text: truncatedError } = truncateOutput(stack || errorMessage);

    return {
      status: 'error',
      output: logs.length > 0 ? truncatedOutput : undefined,
      error: truncatedError,
      executionTime: Math.round(executionTime),
      timestamp: Date.now(),
    };
  } finally {
    // Restore console
    console.log = originalLog;
    console.error = originalError;
  }
}
