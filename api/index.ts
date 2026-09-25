import type { VercelRequest, VercelResponse } from '@vercel/node';
import dotenv from 'dotenv';
import { createApp } from '../server/app';
import healthHandler from './mcp/health';
dotenv.config();
let appPromise: ReturnType<typeof createApp> | undefined;
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const pathname = new URL(req.url || '/', 'http://localhost').pathname;
  if (pathname === '/api/mcp/health' || pathname === '/mcp/health') return healthHandler(req, res);
  try {
    appPromise ||= createApp(false);
    return (await appPromise)(req, res);
  } catch (error) {
    console.error('API handler failure', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
