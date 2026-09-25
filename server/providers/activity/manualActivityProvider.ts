import { ActivityProvider } from './activityProvider';
import { ActivityContext } from '../../types/activity';
import { MCPCallLog } from '../../types/orchestration';

export class ManualActivityProvider implements ActivityProvider {
  public readonly providerName = 'Manual Activity Entry';

  public async getActivityContext(params: {
    mealTime?: string;
    manualData?: {
      activity: string;
      startTime: string;
      durationMinutes: number;
      intensity: 'low' | 'moderate' | 'high';
    };
    weightKg?: number;
  }): Promise<{ context: ActivityContext; log?: MCPCallLog }> {
    const startTimeNow = Date.now();
    const data = params.manualData;

    if (!data || !data.activity) {
      return {
        context: {
          activity: 'Sedentary / Light Routine',
          durationMinutes: 0,
          startTime: '00:00',
          intensity: 'low',
          estimatedCaloriesBurned: 0,
          source: 'Manual',
          mealTimingContext: 'general',
          confidence: 'estimated'
        }
      };
    }

    // Deterministic MET calculation for calorie estimate
    const weight = params.weightKg || 68; // standard adult baseline if unspecified
    const met = this.getMET(data.activity, data.intensity);
    const hours = data.durationMinutes / 60;
    // Calorie formula: Calories = MET * weight(kg) * hours
    const estimatedCalories = Math.round(met * weight * hours);

    const mealTimeStr = params.mealTime || '12:30';
    const timingContext = this.determineTiming(data.startTime, mealTimeStr);

    const log: MCPCallLog = {
      id: `manual_act_${Date.now()}`,
      timestamp: new Date().toISOString(),
      server: 'Garmin Connect MCP' as any,
      toolName: 'manual_activity_normalization',
      sanitizedArguments: { activity: data.activity, duration: data.durationMinutes, intensity: data.intensity },
      status: 'success',
      responseTimeMs: Date.now() - startTimeNow,
      resultSummary: `Calculated ${estimatedCalories} kcal using MET=${met} for ${data.durationMinutes} min ${data.activity}.`
    };

    return {
      context: {
        activity: data.activity,
        durationMinutes: data.durationMinutes,
        startTime: data.startTime,
        intensity: data.intensity,
        estimatedCaloriesBurned: estimatedCalories,
        source: 'Manual',
        mealTimingContext: timingContext.timing,
        hoursUntilOrSinceActivity: timingContext.diffHours,
        confidence: 'estimated'
      },
      log
    };
  }

  private getMET(activityName: string, intensity: 'low' | 'moderate' | 'high'): number {
    const act = activityName.toLowerCase();
    if (act.includes('run') || act.includes('jog')) {
      return intensity === 'high' ? 11.5 : intensity === 'moderate' ? 9.8 : 7.0;
    }
    if (act.includes('cycl') || act.includes('bike')) {
      return intensity === 'high' ? 10.0 : intensity === 'moderate' ? 7.5 : 5.0;
    }
    if (act.includes('swim')) {
      return intensity === 'high' ? 9.5 : intensity === 'moderate' ? 7.0 : 4.5;
    }
    if (act.includes('walk')) {
      return intensity === 'high' ? 4.5 : intensity === 'moderate' ? 3.5 : 2.5;
    }
    if (act.includes('gym') || act.includes('weight') || act.includes('strength')) {
      return intensity === 'high' ? 6.0 : intensity === 'moderate' ? 4.5 : 3.0;
    }
    if (act.includes('badminton') || act.includes('tennis')) {
      return intensity === 'high' ? 8.0 : intensity === 'moderate' ? 6.0 : 4.5;
    }
    return intensity === 'high' ? 7.0 : intensity === 'moderate' ? 5.0 : 3.0;
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
        return { timing: 'pre-exercise', diffHours };
      } else if (diffMinutes < 0 && Math.abs(diffMinutes) <= 180) {
        return { timing: 'post-exercise', diffHours };
      }
      return { timing: 'general', diffHours };
    } catch {
      return { timing: 'general', diffHours: 4 };
    }
  }
}
