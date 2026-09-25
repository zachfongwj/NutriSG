import { ActivityProvider } from './activityProvider';
import { ActivityContext } from '../../types/activity';
import { GarminFitnessMCPClient } from '../../mcp/fitness';
import { MCPCallLog } from '../../types/orchestration';

export class GarminActivityProvider implements ActivityProvider {
  public readonly providerName = 'Garmin Connect MCP';
  private garminClient: GarminFitnessMCPClient;

  constructor(garminClient: GarminFitnessMCPClient) {
    this.garminClient = garminClient;
  }

  public async getActivityContext(params: {
    mealTime?: string;
    weightKg?: number;
  }): Promise<{ context: ActivityContext; log?: MCPCallLog }> {
    const res = await this.garminClient.getActivities(1);
    const topActivity = res.activities[0];

    if (!topActivity) {
      // Default rest/light baseline
      return {
        context: {
          activity: 'Daily Walking / Resting',
          durationMinutes: 30,
          startTime: '12:00',
          intensity: 'low',
          estimatedCaloriesBurned: 120,
          source: 'Garmin',
          mealTimingContext: 'general',
          confidence: 'estimated'
        },
        log: res.log
      };
    }

    // Determine timing relation (pre-exercise vs post-exercise)
    const mealTimeStr = params.mealTime || '12:30';
    const timingContext = this.determineTiming(topActivity.startTime, mealTimeStr);

    return {
      context: {
        activity: topActivity.activityType,
        durationMinutes: topActivity.durationMinutes,
        startTime: topActivity.startTime,
        intensity: topActivity.intensity,
        estimatedCaloriesBurned: topActivity.estimatedCaloriesBurned,
        source: 'Garmin',
        mealTimingContext: timingContext.timing,
        hoursUntilOrSinceActivity: timingContext.diffHours,
        confidence: 'estimated'
      },
      log: res.log
    };
  }

  private determineTiming(
    activityTimeStr: string,
    mealTimeStr: string
  ): { timing: 'pre-exercise' | 'post-exercise' | 'general'; diffHours: number } {
    try {
      const [actH, actM] = activityTimeStr.split(':').map(Number);
      const [mealH, mealM] = mealTimeStr.split(':').map(Number);

      const actTotal = actH * 60 + actM;
      const mealTotal = mealH * 60 + mealM;
      const diffMinutes = actTotal - mealTotal;
      const diffHours = Math.abs(diffMinutes) / 60;

      if (diffMinutes > 0 && diffMinutes <= 180) {
        // Meal is 0-3 hours BEFORE exercise
        return { timing: 'pre-exercise', diffHours };
      } else if (diffMinutes < 0 && Math.abs(diffMinutes) <= 180) {
        // Meal is 0-3 hours AFTER exercise
        return { timing: 'post-exercise', diffHours };
      }
      return { timing: 'general', diffHours };
    } catch {
      return { timing: 'general', diffHours: 4 };
    }
  }
}
