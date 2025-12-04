import * as ts from 'typescript';
import type { ExecutionResult } from '../../types/execution.js';
import { executeJavaScript } from './javascript.executor.js';

export async function executeTypeScript(code: string): Promise<ExecutionResult> {
  const startTime = performance.now();

  try {
    // Transpile TypeScript to JavaScript
    const result = ts.transpileModule(code, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2020,
        lib: ['ES2020'],
        strict: false,
        esModuleInterop: true,
      },
    });

    const transpileTime = performance.now() - startTime;

    // Check for transpilation errors
    if (result.diagnostics && result.diagnostics.length > 0) {
      const errors = result.diagnostics
        .map(diagnostic => {
          const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
          if (diagnostic.file && diagnostic.start !== undefined) {
            const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
            return `Line ${line + 1}:${character + 1} - ${message}`;
          }
          return message;
        })
        .join('\n');

      return {
        status: 'error',
        error: `TypeScript compilation error:\n${errors}`,
        executionTime: Math.round(transpileTime),
        timestamp: Date.now(),
        outputLines: 0,
        outputSize: 0,
        wasTruncated: false,
      };
    }

    // Execute the transpiled JavaScript
    const executionResult = await executeJavaScript(result.outputText);

    // Add transpilation time to total execution time
    return {
      ...executionResult,
      executionTime: Math.round(transpileTime + (executionResult.executionTime || 0)),
    };
  } catch (error) {
    const executionTime = performance.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      status: 'error',
      error: `TypeScript transpilation failed: ${errorMessage}`,
      executionTime: Math.round(executionTime),
      timestamp: Date.now(),
      outputLines: 0,
      outputSize: 0,
      wasTruncated: false,
    };
  }
}
