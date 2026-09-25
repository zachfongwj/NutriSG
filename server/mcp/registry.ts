import { MCPClient } from './client';
import { USDAMcpServer } from './servers/usdaMcpServer';
import { PubMedMcpServer } from './servers/pubmedMcpServer';
import { GarminMcpServer } from './servers/garminMcpServer';

export interface MCPServerStatusReport {
  id: string;
  name: string;
  category: 'Food Data' | 'Evidence' | 'Fitness';
  status: 'connected' | 'disconnected' | 'not_configured';
  transport: string;
  toolsDiscoveredCount: number;
  toolNames: string[];
  serverInfo?: { name: string; version: string };
  lastCheckTime: string;
  error?: string;
}

export class MCPRegistry {
  private static instance: MCPRegistry;

  private usdaClient: MCPClient;
  private pubmedClient: MCPClient;
  private garminClient: MCPClient;

  private constructor() {
    // Initialize in-process standard MCP servers
    const usdaServer = new USDAMcpServer();
    const pubmedServer = new PubMedMcpServer();
    const garminServer = new GarminMcpServer();

    this.usdaClient = new MCPClient(
      {
        serverId: 'usda-fooddata-mcp',
        serverName: 'USDA FoodData Central MCP',
        transport: 'in_process'
      },
      usdaServer
    );

    this.pubmedClient = new MCPClient(
      {
        serverId: 'pubmed-mcp',
        serverName: 'PubMed MCP',
        transport: 'in_process'
      },
      pubmedServer
    );

    this.garminClient = new MCPClient(
      {
        serverId: 'garmin-connect-mcp',
        serverName: 'Garmin Connect MCP',
        transport: 'in_process'
      },
      garminServer
    );
  }

  public static getInstance(): MCPRegistry {
    if (!MCPRegistry.instance) {
      MCPRegistry.instance = new MCPRegistry();
    }
    return MCPRegistry.instance;
  }

  public getUsdaClient(): MCPClient {
    return this.usdaClient;
  }

  public getPubmedClient(): MCPClient {
    return this.pubmedClient;
  }

  public getGarminClient(): MCPClient {
    return this.garminClient;
  }

  public async getStatusReports(): Promise<MCPServerStatusReport[]> {
    // Ensure all clients have connected & discovered tools
    const clients = [
      { client: this.usdaClient, category: 'Food Data' as const },
      { client: this.pubmedClient, category: 'Evidence' as const },
      { client: this.garminClient, category: 'Fitness' as const }
    ];

    const reports: MCPServerStatusReport[] = [];

    for (const { client, category } of clients) {
      const config = client.getServerConfig();
      if (!client.isConnected()) {
        await client.connect();
      }

      const tools = client.getDiscoveredTools();
      const connected = client.isConnected();

      reports.push({
        id: config.serverId,
        name: config.serverName,
        category,
        status: connected ? 'connected' : 'disconnected',
        transport: config.transport,
        toolsDiscoveredCount: tools.length,
        toolNames: tools.map(t => t.name),
        serverInfo: client.getServerInfo(),
        lastCheckTime: new Date().toISOString()
      });
    }

    return reports;
  }
}
