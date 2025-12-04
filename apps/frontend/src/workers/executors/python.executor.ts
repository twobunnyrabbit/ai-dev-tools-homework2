import { loadPyodide, type PyodideInterface } from 'pyodide';
import type { ExecutionResult } from '../../types/execution.js';
import { truncateOutput } from '../utils/output-limiter.js';

// Cache Pyodide instance globally in worker
let pyodide: PyodideInterface | null = null;
let isLoading = false;
let loadError: string | null = null;

/**
 * Load Pyodide from CDN (lazy loaded on first use)
 * Caches the instance for subsequent executions
 */
async function loadPyodideInstance(): Promise<PyodideInterface> {
  // Return cached instance if already loaded
  if (pyodide) {
    return pyodide;
  }

  // If already loading, wait for it
  if (isLoading) {
    // Wait for loading to complete (poll every 100ms)
    while (isLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (pyodide) {
      return pyodide;
    }
    if (loadError) {
      throw new Error(loadError);
    }
  }

  // Start loading
  isLoading = true;
  loadError = null;

  try {
    console.log('Loading Pyodide from CDN... (first-time setup, ~30MB)');
    pyodide = await loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.29.0/full/',
    });
    console.log('Pyodide loaded successfully');
    isLoading = false;
    return pyodide;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    loadError = `Failed to load Pyodide: ${errorMessage}`;
    isLoading = false;
    throw new Error(loadError);
  }
}

export async function executePython(code: string): Promise<ExecutionResult> {
  const startTime = performance.now();

  try {
    // Load Pyodide (cached after first load)
    const py = await loadPyodideInstance();

    const loadTime = performance.now() - startTime;

    // Capture stdout/stderr
    const captureCode = `
import sys
import io

# Create string buffers for stdout and stderr
_stdout_buffer = io.StringIO()
_stderr_buffer = io.StringIO()

# Redirect stdout and stderr
sys.stdout = _stdout_buffer
sys.stderr = _stderr_buffer

try:
    # Execute user code
${code.split('\n').map(line => `    ${line}`).join('\n')}
except Exception as e:
    import traceback
    sys.stderr.write(traceback.format_exc())

# Get output
_stdout_value = _stdout_buffer.getvalue()
_stderr_value = _stderr_buffer.getvalue()

# Restore stdout/stderr
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__

# Return output as dict
{"stdout": _stdout_value, "stderr": _stderr_value}
`;

    // Run the code
    const result = await py.runPythonAsync(captureCode);
    const executionTime = performance.now() - startTime;

    // Extract output
    const output = result.toJs ? result.toJs() : result;
    const stdout = output.get ? output.get('stdout') : output.stdout || '';
    const stderr = output.get ? output.get('stderr') : output.stderr || '';

    // Apply output truncation
    const { text: truncatedStdout } = truncateOutput(stdout);
    const { text: truncatedStderr } = truncateOutput(stderr);

    // If there's stderr, treat as error
    if (stderr) {
      return {
        status: 'error',
        output: stdout ? truncatedStdout : undefined,
        error: truncatedStderr,
        executionTime: Math.round(executionTime),
        timestamp: Date.now(),
      };
    }

    return {
      status: 'success',
      output: truncatedStdout || '(no output)',
      executionTime: Math.round(executionTime),
      timestamp: Date.now(),
    };
  } catch (error) {
    const executionTime = performance.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Provide helpful error messages
    let enhancedError = errorMessage;
    if (errorMessage.includes('Failed to load Pyodide')) {
      enhancedError = `${errorMessage}\n\nTip: Check your internet connection. Pyodide loads ~30MB from CDN on first use.`;
    } else if (errorMessage.includes('ImportError') || errorMessage.includes('ModuleNotFoundError')) {
      enhancedError = `${errorMessage}\n\nTip: Only Python standard library is available. External packages (numpy, pandas, etc.) are not supported in this environment.`;
    }

    const { text: truncatedError } = truncateOutput(enhancedError);

    return {
      status: 'error',
      error: truncatedError,
      executionTime: Math.round(executionTime),
      timestamp: Date.now(),
    };
  }
}
