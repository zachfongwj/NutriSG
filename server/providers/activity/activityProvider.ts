import { ActivityContext } from '../../types/activity';
import { MCPCallLog } from '../../types/orchestration';

export interface ActivityProvider {
  readonly providerName: string;
  getActivityContext(params: {
    mealTime?: string;
    manualData?: {
      activity: string;
      startTime: string;
      durationMinutes: number;
      intensity: 'low' | 'moderate' | 'high';
    };
    weightKg?: number;
  }): Promise<{ context: ActivityContext; log?: MCPCallLog }>;
}
