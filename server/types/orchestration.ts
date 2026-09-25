export interface WorkflowStep {
  stepId: string;
  name: string;
  component: 'Orchestrator' | 'Activity Analysis' | 'Evidence Agent' | 'Constraint Engine' | 'Meal Planning Agent' | 'Food Data Layer' | 'Validation Safety Layer' | 'Recommendation Engine';
  status: 'pending' | 'running' | 'completed' | 'skipped' | 'failed';
  inputSummary?: string;
  outputSummary?: string;
  mcpServerCalled?: string;
  toolName?: string;
  durationMs: number;
  error?: string;
}

export interface MCPCallLog {
  id: string;
  timestamp: string;
  server: 'USDA FoodData Central MCP' | 'PubMed MCP' | 'Garmin Connect MCP' | 'SG FoodID Provider';
  toolName: string;
  sanitizedArguments: Record<string, unknown>;
  status: 'success' | 'failure' | 'cached' | 'fallback';
  responseTimeMs: number;
  resultSummary: string;
  error?: string;
}

export interface OrchestrationTrace {
  requestId: string;
  startTime: string;
  totalDurationMs: number;
  steps: WorkflowStep[];
  mcpCalls: MCPCallLog[];
}
