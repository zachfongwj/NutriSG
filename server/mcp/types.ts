export interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

export interface JsonRpcResponse<T = unknown> {
  jsonrpc: '2.0';
  id: string | number;
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

export interface MCPToolParameterSchema {
  type: string;
  description?: string;
  properties?: Record<string, {
    type: string;
    description?: string;
    items?: { type: string };
    enum?: string[];
  }>;
  required?: string[];
}

export interface MCPToolDefinition {
  name: string;
  description?: string;
  inputSchema: MCPToolParameterSchema;
}

export interface MCPInitializeResult {
  protocolVersion: string;
  capabilities: Record<string, unknown>;
  serverInfo: {
    name: string;
    version: string;
  };
}

export interface MCPToolsListResult {
  tools: MCPToolDefinition[];
}

export interface MCPToolContent {
  type: 'text' | 'image' | 'resource';
  text?: string;
  data?: string;
  mimeType?: string;
}

export interface MCPToolCallResult {
  content: MCPToolContent[];
  isError?: boolean;
}

export type MCPTransportType = 'in_process' | 'streamable_http' | 'stdio';

export interface MCPServerConnectionConfig {
  serverId: string;
  serverName: string;
  transport: MCPTransportType;
  endpointUrl?: string;
  command?: string;
  args?: string[];
}
