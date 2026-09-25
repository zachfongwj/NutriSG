import { MCPClient, MCPStatusReport } from './client';

type MCPName = 'food' | 'pubmed' | 'garmin';

export class MCPRegistry {
  private static instance: MCPRegistry | undefined;
  private readonly clients: Record<MCPName, MCPClient>;

  private constructor() {
    const foodUrl = process.env.FOOD_MCP_URL || process.env.USDA_MCP_URL;
    this.clients = {
      food: new MCPClient({ serverId: 'food-mcp', serverName: 'Food MCP', endpointUrl: foodUrl }),
      pubmed: new MCPClient({ serverId: 'pubmed-mcp', serverName: 'PubMed MCP', endpointUrl: process.env.PUBMED_MCP_URL }),
      garmin: new MCPClient({ serverId: 'garmin-connect-mcp', serverName: 'Garmin Connect MCP', endpointUrl: process.env.GARMIN_MCP_URL })
    };
  }

  static getInstance() { return this.instance || (this.instance = new MCPRegistry()); }
  getFoodClient() { return this.clients.food; }
  getUsdaClient() { return this.clients.food; }
  getPubmedClient() { return this.clients.pubmed; }
  getGarminClient() { return this.clients.garmin; }

  async getStatusReports(logger: (message: string) => void = message => console.log(message)): Promise<MCPStatusReport[]> {
    return Promise.all((Object.entries(this.clients) as Array<[MCPName, MCPClient]>).map(async ([name, client]) => {
      logger(`[MCP Health] checking ${name}`);
      const config = client.getServerConfig();
      if (!config.endpointUrl) {
        logger(`[MCP Health] ${name} not configured`);
        return this.report(client);
      }
      try {
        await client.connect();
      } catch (error) {
        logger(`[MCP Health] ${name} connection failed: ${this.safeError(error)}`);
      }
      const report = this.report(client);
      if (!report.connected) logger(`[MCP Health] ${name} connection failed: ${report.lastError || report.status}`);
      return report;
    }));
  }

  async getHealth(logger?: (message: string) => void) {
    const reports = await this.getStatusReports(logger);
    return { mcp: Object.fromEntries(reports.map(report => [this.healthName(report.id), {
      configured: report.configured,
      connected: report.connected,
      status: report.status,
      toolsDiscovered: report.toolsDiscovered,
      ...(report.lastError ? { error: report.lastError } : {})
    }])) };
  }

  private report(client: MCPClient): MCPStatusReport {
    const config = client.getServerConfig();
    return {
      id: config.serverId,
      name: config.serverName,
      configured: Boolean(config.endpointUrl),
      connected: client.isConnected(),
      status: client.getStatus(),
      toolsDiscovered: client.getDiscoveredTools().length,
      toolNames: client.getDiscoveredTools().map(tool => tool.name),
      serverInfo: client.getServerInfo(),
      transport: config.endpointUrl ? 'streamable_http' : 'not_configured',
      ...(client.getLastError() ? { lastError: client.getLastError() } : {}),
      lastCheckTime: new Date().toISOString()
    };
  }

  private healthName(id: string) { return id === 'food-mcp' ? 'food' : id === 'pubmed-mcp' ? 'pubmed' : 'garmin'; }
  private safeError(error: unknown) { return error instanceof Error ? error.message.replace(/https?:\/\/[^\s]+/g, '[endpoint]').slice(0, 240) : 'Unknown MCP error'; }
}
