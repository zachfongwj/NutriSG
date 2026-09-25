import {
  JsonRpcRequest,
  JsonRpcResponse,
  MCPToolDefinition,
  MCPInitializeResult,
  MCPToolsListResult,
  MCPToolCallResult,
  MCPServerConnectionConfig
} from './types';
import { MCPCallLog } from '../types/orchestration';

export interface MCPHandler {
  handleRequest(req: JsonRpcRequest): Promise<JsonRpcResponse>;
}

export class MCPClient {
  private serverConfig: MCPServerConnectionConfig;
  private isInitialized = false;
  private discoveredTools: MCPToolDefinition[] = [];
  private serverInfo?: { name: string; version: string };
  private inProcessHandler?: MCPHandler;
  private requestIdCounter = 1;

  constructor(config: MCPServerConnectionConfig, inProcessHandler?: MCPHandler) {
    this.serverConfig = config;
    this.inProcessHandler = inProcessHandler;
  }

  public getServerConfig(): MCPServerConnectionConfig {
    return this.serverConfig;
  }

  public getDiscoveredTools(): MCPToolDefinition[] {
    return [...this.discoveredTools];
  }

  public getServerInfo() {
    return this.serverInfo;
  }

  public isConnected(): boolean {
    return this.isInitialized;
  }

  /**
   * Connect and initialize MCP session with the server
   */
  public async connect(): Promise<{ success: boolean; toolsCount: number; error?: string }> {
    try {
      const initReq: JsonRpcRequest = {
        jsonrpc: '2.0',
        id: this.requestIdCounter++,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {}
          },
          clientInfo: {
            name: 'NutriSG-MCP-Client',
            version: '1.0.0'
          }
        }
      };

      const initRes = await this.sendJsonRpc<MCPInitializeResult>(initReq);
      if (initRes.error) {
        return { success: false, toolsCount: 0, error: initRes.error.message };
      }

      this.serverInfo = initRes.result?.serverInfo;

      // Send initialized notification
      await this.sendNotification({
        jsonrpc: '2.0',
        id: this.requestIdCounter++,
        method: 'notifications/initialized'
      });

      // Discover tools
      const listToolsReq: JsonRpcRequest = {
        jsonrpc: '2.0',
        id: this.requestIdCounter++,
        method: 'tools/list',
        params: {}
      };

      const toolsRes = await this.sendJsonRpc<MCPToolsListResult>(listToolsReq);
      if (toolsRes.error) {
        return { success: false, toolsCount: 0, error: toolsRes.error.message };
      }

      this.discoveredTools = toolsRes.result?.tools || [];
      this.isInitialized = true;

      return {
        success: true,
        toolsCount: this.discoveredTools.length
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.isInitialized = false;
      return { success: false, toolsCount: 0, error: msg };
    }
  }

  /**
   * Invokes an MCP tool with validation, response timing and call logging
   */
  public async invokeTool<T = unknown>(
    toolName: string,
    args: Record<string, unknown>
  ): Promise<{
    success: boolean;
    result?: T;
    rawContent?: string;
    log: MCPCallLog;
    error?: string;
  }> {
    const startTime = Date.now();
    const callId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Sanitize arguments to avoid logging sensitive data
    const sanitizedArgs = { ...args };
    for (const key of Object.keys(sanitizedArgs)) {
      if (/key|secret|token|password|auth/i.test(key)) {
        sanitizedArgs[key] = '***REDACTED***';
      }
    }

    if (!this.isInitialized) {
      const connectResult = await this.connect();
      if (!connectResult.success) {
        const duration = Date.now() - startTime;
        const log: MCPCallLog = {
          id: callId,
          timestamp: new Date().toISOString(),
          server: this.serverConfig.serverName as any,
          toolName,
          sanitizedArguments: sanitizedArgs,
          status: 'failure',
          responseTimeMs: duration,
          resultSummary: 'Failed to initialize MCP connection',
          error: connectResult.error
        };
        return { success: false, log, error: connectResult.error };
      }
    }

    // Verify tool exists in discovered tools
    const toolExists = this.discoveredTools.find(t => t.name === toolName);
    if (!toolExists) {
      // Find candidate similar tool or warn
      const available = this.discoveredTools.map(t => t.name).join(', ');
      const duration = Date.now() - startTime;
      const log: MCPCallLog = {
        id: callId,
        timestamp: new Date().toISOString(),
        server: this.serverConfig.serverName as any,
        toolName,
        sanitizedArguments: sanitizedArgs,
        status: 'failure',
        responseTimeMs: duration,
        resultSummary: `Tool '${toolName}' not found among discovered tools (${available || 'none'})`,
        error: `Tool '${toolName}' not found`
      };
      return {
        success: false,
        log,
        error: `Tool '${toolName}' not discovered on server '${this.serverConfig.serverName}'`
      };
    }

    try {
      const toolCallReq: JsonRpcRequest = {
        jsonrpc: '2.0',
        id: this.requestIdCounter++,
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: args
        }
      };

      const res = await this.sendJsonRpc<MCPToolCallResult>(toolCallReq);
      const duration = Date.now() - startTime;

      if (res.error) {
        const log: MCPCallLog = {
          id: callId,
          timestamp: new Date().toISOString(),
          server: this.serverConfig.serverName as any,
          toolName,
          sanitizedArguments: sanitizedArgs,
          status: 'failure',
          responseTimeMs: duration,
          resultSummary: `JSON-RPC Error: ${res.error.message}`,
          error: res.error.message
        };
        return { success: false, log, error: res.error.message };
      }

      if (res.result?.isError) {
        const text = res.result.content?.map(c => c.text).join('\n') || 'Unknown tool error';
        const log: MCPCallLog = {
          id: callId,
          timestamp: new Date().toISOString(),
          server: this.serverConfig.serverName as any,
          toolName,
          sanitizedArguments: sanitizedArgs,
          status: 'failure',
          responseTimeMs: duration,
          resultSummary: text.substring(0, 100),
          error: text
        };
        return { success: false, log, error: text };
      }

      const textOutput = res.result?.content?.map(c => c.text).join('\n') || '';
      let parsedData: T | undefined;
      try {
        if (textOutput) {
          parsedData = JSON.parse(textOutput) as T;
        }
      } catch {
        // If not JSON, leave as raw string
        parsedData = textOutput as unknown as T;
      }

      const summary = textOutput.length > 120 ? `${textOutput.substring(0, 117)}...` : textOutput;
      const log: MCPCallLog = {
        id: callId,
        timestamp: new Date().toISOString(),
        server: this.serverConfig.serverName as any,
        toolName,
        sanitizedArguments: sanitizedArgs,
        status: 'success',
        responseTimeMs: duration,
        resultSummary: summary || 'Tool call completed successfully'
      };

      return {
        success: true,
        result: parsedData,
        rawContent: textOutput,
        log
      };
    } catch (err: unknown) {
      const duration = Date.now() - startTime;
      const msg = err instanceof Error ? err.message : String(err);
      const log: MCPCallLog = {
        id: callId,
        timestamp: new Date().toISOString(),
        server: this.serverConfig.serverName as any,
        toolName,
        sanitizedArguments: sanitizedArgs,
        status: 'failure',
        responseTimeMs: duration,
        resultSummary: `Network/Protocol error: ${msg}`,
        error: msg
      };
      return { success: false, log, error: msg };
    }
  }

  private async sendJsonRpc<T>(req: JsonRpcRequest): Promise<JsonRpcResponse<T>> {
    if (this.serverConfig.transport === 'in_process' && this.inProcessHandler) {
      return (await this.inProcessHandler.handleRequest(req)) as JsonRpcResponse<T>;
    }

    if (this.serverConfig.transport === 'streamable_http' && this.serverConfig.endpointUrl) {
      const response = await fetch(this.serverConfig.endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/event-stream'
        },
        body: JSON.stringify(req)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data as JsonRpcResponse<T>;
    }

    throw new Error(`Unsupported or unconfigured MCP transport: ${this.serverConfig.transport}`);
  }

  private async sendNotification(req: JsonRpcRequest): Promise<void> {
    try {
      if (this.serverConfig.transport === 'in_process' && this.inProcessHandler) {
        await this.inProcessHandler.handleRequest(req);
      } else if (this.serverConfig.transport === 'streamable_http' && this.serverConfig.endpointUrl) {
        await fetch(this.serverConfig.endpointUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(req)
        }).catch(() => {});
      }
    } catch {
      // Notifications do not require response
    }
  }
}
