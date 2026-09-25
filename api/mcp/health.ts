import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MCPRegistry } from '../../server/mcp/registry';

export default async function healthHandler(_req: VercelRequest, res: VercelResponse) {
  console.log('[MCP Health] handler started');
  try {
    const registry = MCPRegistry.getInstance();
    const result = await registry.getHealth();
    return res.status(200).json(result);
  } catch (error) {
    const safeError = error instanceof Error ? error.message.replace(/https?:\/\/[^\s]+/g, '[endpoint]').slice(0, 240) : 'Unknown health-check error';
    console.error(`[MCP Health] health check failed: ${safeError}`);
    return res.status(200).json({ mcp: {}, status: 'health_check_failed', error: safeError });
  }
}
