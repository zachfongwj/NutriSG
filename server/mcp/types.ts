import { MCPClient } from './client';
export type MCPTransportType = 'streamable_http';
export interface MCPServerConnectionConfig { serverId: string; serverName: string; endpointUrl?: string; }
export type { MCPClient };
