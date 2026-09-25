import express, { Express } from 'express';
import { CentralOrchestrator } from './agents/orchestrator';
import { MCPRegistry } from './mcp/registry';
import { SingaporeFoodProvider } from './providers/food/singaporeFoodProvider';
import { USDAFoodProvider } from './providers/food/usdaFoodProvider';
import { USDANutritionMCPClient } from './mcp/nutrition';
export async function createApp(withFrontend = false): Promise<Express> {
  const app = express(); app.use(express.json());
  const registry = MCPRegistry.getInstance(); const orchestrator = new CentralOrchestrator();
  const singapore = new SingaporeFoodProvider(); const food = new USDAFoodProvider(new USDANutritionMCPClient(registry.getFoodClient()));
  app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'NutriSG Health & Wellness Recommendation Engine', timestamp: new Date().toISOString() }));
  app.get('/api/mcp/health', async (_req, res) => res.json(await registry.getHealth()));
  app.get('/api/mcp/status', async (_req, res) => res.json({ singaporeFoodData: await singapore.getStatus(), mcpServers: await registry.getStatusReports(), timestamp: new Date().toISOString() }));
  app.post('/api/recommend', async (req, res) => { try { if (!req.body) return res.status(400).json({ error: 'User profile payload is required' }); res.json(await orchestrator.orchestrate(req.body)); } catch { res.status(500).json({ error: 'Recommendation service failed' }); } });
  app.post('/api/food/search', async (req, res) => { try { if (!req.body?.query) return res.status(400).json({ error: 'Query parameter required' }); res.json(req.body.source === 'singapore' ? await singapore.searchFoods(req.body.query, 5) : await food.searchFoods(req.body.query, 5)); } catch { res.status(502).json({ error: 'Food MCP request failed' }); } });
  app.post('/api/mcp/call', async (req, res) => { const { serverId, toolName, args } = req.body || {}; const client = serverId === 'food-mcp' || serverId === 'usda-fooddata-mcp' ? registry.getFoodClient() : serverId === 'pubmed-mcp' ? registry.getPubmedClient() : serverId === 'garmin-connect-mcp' ? registry.getGarminClient() : undefined; if (!client || !toolName) return res.status(400).json({ error: 'Unknown MCP server or missing tool name' }); const result = await client.invokeTool(toolName, args || {}); return res.status(result.success ? 200 : 502).json(result); });
  if (withFrontend) { const isProd = process.env.NODE_ENV === 'production'; if (!isProd) { const { createServer } = await import('vite'); app.use((await createServer({ server: { middlewareMode: true }, appType: 'spa' })).middlewares); } else { const path = await import('path'); app.use(express.static(path.resolve(process.cwd(), 'dist'))); app.get('*', (_req, res) => res.sendFile(path.resolve(process.cwd(), 'dist/index.html'))); } }
  return app;
}
