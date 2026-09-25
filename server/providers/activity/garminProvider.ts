import { ActivityContext } from '../../types/activity';
import { GarminFitnessMCPClient } from '../../mcp/fitness';
export class GarminActivityProvider {
  readonly providerName = 'Garmin Connect MCP';
  constructor(private readonly client: GarminFitnessMCPClient) {}
  async getActivityContext(params: { mealTime?: string; weightKg?: number }): Promise<{ context: ActivityContext; log?: any }> {
    const result = await this.client.getActivities(1);
    const activity = result.activities[0];
    if (!activity) throw new Error(result.error || 'No activity returned by Garmin MCP');
    return { context: { activity: activity.activityType, durationMinutes: activity.durationMinutes, startTime: activity.startTime, intensity: activity.intensity, estimatedCaloriesBurned: activity.estimatedCaloriesBurned, source: 'Garmin', mealTimingContext: 'general', confidence: 'measured' }, log: result.log };
  }
}
