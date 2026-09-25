import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { CentralOrchestrator } from './server/agents/orchestrator';
import { MCPRegistry } from './server/mcp/registry';
import { SingaporeFoodProvider } from './server/providers/food/singaporeFoodProvider';
import { USDAFoodProvider } from './server/providers/food/usdaFoodProvider';
import { USDANutritionMCPClient } from './server/mcp/nutrition';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json());

  const orchestrator = new CentralOrchestrator();
  const registry = MCPRegistry.getInstance();
  const singaporeFoodProvider = new SingaporeFoodProvider();
  const usdaMcpClient = new USDANutritionMCPClient(registry.getUsdaClient());
  const usdaFoodProvider = new USDAFoodProvider(usdaMcpClient);

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'NutriSG Health & Wellness Recommendation Engine',
      environment: isProd ? 'production' : 'development',
      timestamp: new Date().toISOString()
    });
  });

  // MCP Server Statuses & Tool Discovery Report
  app.get('/api/mcp/status', async (_req, res) => {
    try {
      const mcpReports = await registry.getStatusReports();
      const sgStatus = await singaporeFoodProvider.getStatus();

      res.json({
        singaporeFoodData: sgStatus,
        mcpServers: mcpReports,
        timestamp: new Date().toISOString()
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: msg });
    }
  });

  // End-to-end Orchestrated Recommendation
  app.post('/api/recommend', async (req, res) => {
    try {
      const profile = req.body;
      if (!profile) {
        return res.status(400).json({ error: 'User profile payload is required' });
      }

      const result = await orchestrator.orchestrate(profile);
      res.json(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Orchestration error:', err);
      res.status(500).json({ error: msg });
    }
  });

  // Direct Food Search
  app.post('/api/food/search', async (req, res) => {
    try {
      const { query, source } = req.body;
      if (!query) {
        return res.status(400).json({ error: 'Query parameter required' });
      }

      if (source === 'usda') {
        const result = await usdaFoodProvider.searchFoods(query, 5);
        return res.json(result);
      } else {
        const result = await singaporeFoodProvider.searchFoods(query, 5);
        return res.json(result);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: msg });
    }
  });

  // Direct MCP Tool Calling for Interactive Dev Panel
  app.post('/api/mcp/call', async (req, res) => {
    try {
      const { serverId, toolName, args } = req.body;
      if (!serverId || !toolName) {
        return res.status(400).json({ error: 'serverId and toolName are required' });
      }

      let client;
      if (serverId === 'usda-fooddata-mcp') {
        client = registry.getUsdaClient();
      } else if (serverId === 'pubmed-mcp') {
        client = registry.getPubmedClient();
      } else if (serverId === 'garmin-connect-mcp') {
        client = registry.getGarminClient();
      } else {
        return res.status(404).json({ error: `Unknown MCP serverId: ${serverId}` });
      }

      const callResult = await client.invokeTool(toolName, args || {});
      res.json(callResult);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: msg });
    }
  });

  // Frontend integration (Vite dev middleware vs static production files)
  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`NutriSG Server running on port ${PORT} [${isProd ? 'PROD' : 'DEV'}]`);
  });
}

startServer().catch(err => {
  console.error('Fatal server startup failure:', err);
  process.exit(1);
});
