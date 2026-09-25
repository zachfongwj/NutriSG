import type { VercelRequest, VercelResponse } from '@vercel/node';
import dotenv from 'dotenv';
import { createApp } from '../server/app';
dotenv.config();
let appPromise: ReturnType<typeof createApp> | undefined;
export default async function handler(req: VercelRequest, res: VercelResponse) { appPromise ||= createApp(false); return (await appPromise)(req, res); }
