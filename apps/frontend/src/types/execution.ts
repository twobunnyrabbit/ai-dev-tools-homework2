export type ExecutionStatus = 'idle' | 'running' | 'success' | 'error' | 'timeout';

export type Language = 'javascript' | 'typescript' | 'python' | 'java' | 'go' | 'cpp';

export interface ExecutionResult {
  status: ExecutionStatus;
  output?: string;
  error?: string;
  executionTime?: number;
  timestamp: number;
  outputLines?: number;      // Line count
  outputSize?: number;       // Character count before truncation
  wasTruncated?: boolean;    // Truncation flag
}

export interface WorkerMessage {
  type: 'execute' | 'result' | 'error' | 'timeout';
  language?: Language;
  code?: string;
  result?: ExecutionResult;
}
