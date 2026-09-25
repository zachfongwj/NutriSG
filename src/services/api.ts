import { UserProfile, RecommendationResponse, OrchestrationTrace, SystemStatusData } from '../types';

export async function fetchSystemStatus(): Promise<SystemStatusData> {
  const res = await fetch('/api/mcp/status');
  if (!res.ok) {
    throw new Error(`Failed to fetch MCP status: HTTP ${res.status}`);
  }
  return await res.json();
}

export async function requestRecommendations(profile: UserProfile): Promise<{
  response: RecommendationResponse;
  trace: OrchestrationTrace;
}> {
  const res = await fetch('/api/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Recommendation request failed with HTTP ${res.status}`);
  }

  return await res.json();
}

export async function executeMcpToolDirect(
  serverId: string,
  toolName: string,
  args: Record<string, unknown>
): Promise<any> {
  const res = await fetch('/api/mcp/call', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ serverId, toolName, args })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Direct MCP call failed with HTTP ${res.status}`);
  }

  return await res.json();
}
