export type ExecutionStatus = 'idle' | 'running' | 'success' | 'error' | 'timeout';

export type Language = 'javascript' | 'typescript' | 'python' | 'java' | 'go' | 'cpp';

export interface ExecutionResult {
  status: ExecutionStatus;
  output?: string;
  error?: string;
  executionTime?: number;
  timestamp: number;
}

export interface WorkerMessage {
  type: 'execute' | 'result' | 'error' | 'timeout';
  language?: Language;
  code?: string;
  result?: ExecutionResult;
}
