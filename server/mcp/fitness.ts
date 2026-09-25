import { MCPClient } from './client';
import { GarminActivityRaw } from '../types/activity';
import { MCPCallLog } from '../types/orchestration';

export class GarminFitnessMCPClient {
  private mcpClient: MCPClient;

  constructor(client: MCPClient) {
    this.mcpClient = client;
  }

  private findTool(candidates: string[]): string | undefined {
    const discovered = this.mcpClient.getDiscoveredTools().map(t => t.name);
    return candidates.find(c => discovered.includes(c));
  }

  public async getDailyActivity(
    date?: string
  ): Promise<{ data?: any; log?: MCPCallLog; error?: string }> {
    const tool = this.findTool(['garmin_get_daily_activity', 'get_daily_activity']) || 'garmin_get_daily_activity';
    const res = await this.mcpClient.invokeTool<any>(tool, { date });
    return { data: res.result, log: res.log, error: res.error };
  }

  public async getActivities(
    limit = 3
  ): Promise<{ activities: GarminActivityRaw[]; log?: MCPCallLog; error?: string }> {
    const tool = this.findTool(['garmin_get_activities', 'get_activities']) || 'garmin_get_activities';
    const res = await this.mcpClient.invokeTool<any>(tool, { limit });

    if (!res.success || !res.result) {
      return { activities: [], log: res.log, error: res.error };
    }

    const rawActivities = res.result.activities || [];
    const normalized: GarminActivityRaw[] = rawActivities.map((a: any) => ({
      activityId: a.activityId,
      activityType: a.activityType || 'Activity',
      startTime: a.startTime || '18:00',
      durationMinutes: Number(a.durationMinutes) || 30,
      intensity: a.intensity || 'moderate',
      estimatedCaloriesBurned: Number(a.estimatedCaloriesBurned) || 250,
      averageHeartRate: a.averageHeartRate ? Number(a.averageHeartRate) : undefined,
      source: 'Garmin'
    }));

    return { activities: normalized, log: res.log };
  }

  public async getActivityMetrics(
    activityId: string
  ): Promise<{ metrics?: any; log?: MCPCallLog; error?: string }> {
    const tool = this.findTool(['garmin_get_activity_metrics', 'get_activity_metrics']) || 'garmin_get_activity_metrics';
    const res = await this.mcpClient.invokeTool<any>(tool, { activityId });
    return { metrics: res.result, log: res.log, error: res.error };
  }
}
