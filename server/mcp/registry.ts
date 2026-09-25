import { MCPClient, MCPStatusReport } from './client';

export class MCPRegistry {
  private static instance: MCPRegistry;
  private readonly clients: Record<'food' | 'pubmed' | 'garmin', MCPClient>;
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
  async getStatusReports(): Promise<MCPStatusReport[]> {
    return Promise.all(Object.values(this.clients).map(async client => {
      await client.connect();
      const config = client.getServerConfig();
      return { id: config.serverId, name: config.serverName, configured: Boolean(config.endpointUrl), connected: client.isConnected(), status: client.getStatus(), toolsDiscovered: client.getDiscoveredTools().length, toolNames: client.getDiscoveredTools().map(tool => tool.name), serverInfo: client.getServerInfo(), transport: config.endpointUrl ? 'streamable_http' : 'not_configured', lastError: client.getLastError(), lastCheckTime: new Date().toISOString() };
    }));
  }
  async getHealth() {
    const reports = await this.getStatusReports();
    return { mcp: Object.fromEntries(reports.map(report => [report.id === 'food-mcp' ? 'food' : report.id === 'pubmed-mcp' ? 'pubmed' : 'garmin', { configured: report.configured, connected: report.connected, status: report.status, toolsDiscovered: report.toolsDiscovered, ...(report.lastError ? { lastError: report.lastError } : {}) }])) };
  }
}
