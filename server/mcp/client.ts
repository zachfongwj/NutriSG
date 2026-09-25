import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import type { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { MCPCallLog } from '../types/orchestration';

export type MCPStatus = 'connected' | 'not_configured' | 'connection_failed' | 'initialization_failed' | 'tool_discovery_failed';

export interface MCPServerConnectionConfig {
  serverId: string;
  serverName: string;
  endpointUrl?: string;
}

export interface MCPStatusReport {
  id: string;
  name: string;
  configured: boolean;
  connected: boolean;
  status: MCPStatus;
  toolsDiscovered: number;
  toolNames: string[];
  serverInfo?: { name?: string; version?: string };
  transport: 'streamable_http' | 'not_configured';
  lastError?: string;
  lastCheckTime: string;
}

export class MCPClient {
  private client?: Client;
  private transport?: StreamableHTTPClientTransport;
  private discoveredTools: Array<{ name: string; description?: string; inputSchema?: unknown }> = [];
  private serverInfo?: { name?: string; version?: string };
  private status: MCPStatus;
  private lastError?: string;
  private connecting?: Promise<void>;

  constructor(private readonly config: MCPServerConnectionConfig) {
    this.status = config.endpointUrl ? 'connection_failed' : 'not_configured';
  }

  getServerConfig() { return this.config; }
  getDiscoveredTools() { return [...this.discoveredTools]; }
  getServerInfo() { return this.serverInfo; }
  isConnected() { return this.status === 'connected'; }
  getStatus() { return this.status; }
  getLastError() { return this.lastError; }

  async connect(): Promise<{ success: boolean; toolsCount: number; error?: string }> {
    if (!this.config.endpointUrl) {
      this.status = 'not_configured';
      return { success: false, toolsCount: 0, error: 'MCP endpoint is not configured' };
    }
    if (this.isConnected()) return { success: true, toolsCount: this.discoveredTools.length };
    if (this.connecting) {
      try { await this.connecting; } catch { /* connectRemote records the failure */ }
      return { success: this.isConnected(), toolsCount: this.discoveredTools.length, error: this.lastError };
    }

    this.connecting = this.connectRemote();
    try { await this.connecting; } catch (error) {
      this.status = 'connection_failed';
      this.lastError = this.safeError(error);
    } finally { this.connecting = undefined; }
    return { success: this.isConnected(), toolsCount: this.discoveredTools.length, error: this.lastError };
  }

  private async connectRemote(): Promise<void> {
    this.status = 'connection_failed';
    this.lastError = undefined;
    this.discoveredTools = [];
    try {
      // Keep the SDK out of module evaluation. This makes importing a health route safe.
      const [{ Client }, { StreamableHTTPClientTransport }] = await Promise.all([
        import('@modelcontextprotocol/sdk/client/index.js'),
        import('@modelcontextprotocol/sdk/client/streamableHttp.js')
      ]);
      this.client = new Client({ name: 'NutriSG', version: '1.0.0' }, { capabilities: { tools: {} } });
      this.transport = new StreamableHTTPClientTransport(new URL(this.config.endpointUrl!));
      try {
        await this.client.connect(this.transport);
      } catch (error) {
        this.status = 'initialization_failed';
        throw error;
      }
      try {
        const listed = await this.client.listTools();
        this.discoveredTools = listed.tools || [];
      } catch (error) {
        this.status = 'tool_discovery_failed';
        throw error;
      }
      this.serverInfo = this.client.getServerVersion() || undefined;
      this.status = 'connected';
    } catch (error) {
      this.lastError = this.safeError(error);
      await this.closeQuietly();
    }
  }

  async invokeTool<T = unknown>(toolName: string, args: Record<string, unknown>): Promise<{ success: boolean; result?: T; rawContent?: string; log: MCPCallLog; error?: string }> {
    const started = Date.now();
    const sanitizedArguments = Object.fromEntries(Object.entries(args).map(([key, value]) => [/key|secret|token|password|auth/i.test(key) ? [key, '***REDACTED***'] : [key, value]]));
    const base = { id: `call_${Date.now()}`, timestamp: new Date().toISOString(), server: this.config.serverName as MCPCallLog['server'], toolName, sanitizedArguments };
    const connected = await this.connect();
    if (!connected.success || !this.client) return { success: false, error: connected.error || 'MCP connection unavailable', log: { ...base, status: 'failure', responseTimeMs: Date.now() - started, resultSummary: 'MCP connection unavailable', error: connected.error } };
    if (!this.discoveredTools.some(tool => tool.name === toolName)) {
      const error = `Tool '${toolName}' was not discovered`;
      return { success: false, error, log: { ...base, status: 'failure', responseTimeMs: Date.now() - started, resultSummary: error, error } };
    }
    try {
      const response = await this.client.callTool({ name: toolName, arguments: args });
      const content = Array.isArray(response.content) ? response.content : [];
      const rawContent = content.filter((item: any) => item.type === 'text').map((item: any) => item.text).join('\n');
      let result: T | undefined;
      if (response.structuredContent !== undefined) result = response.structuredContent as T;
      else if (rawContent) { try { result = JSON.parse(rawContent) as T; } catch { result = rawContent as T; } }
      if ((response as any).isError) throw new Error(rawContent || 'Remote MCP tool returned an error');
      return { success: true, result, rawContent, log: { ...base, status: 'success', responseTimeMs: Date.now() - started, resultSummary: rawContent.slice(0, 120) || 'Tool call completed' } };
    } catch (error) {
      const message = this.safeError(error);
      return { success: false, error: message, log: { ...base, status: 'failure', responseTimeMs: Date.now() - started, resultSummary: 'Remote MCP tool call failed', error: message } };
    }
  }

  private safeError(error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown MCP error';
    return message.replace(/https?:\/\/[^\s]+/g, '[endpoint]').slice(0, 240);
  }
  private async closeQuietly() { try { await this.transport?.close(); } catch { /* best effort */ } this.client = undefined; this.transport = undefined; }
}
