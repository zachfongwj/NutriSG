import { UserProfile } from '../types/profile';
import { ActivityContext } from '../types/activity';
import { GarminActivityProvider } from '../providers/activity/garminProvider';
import { ManualActivityProvider } from '../providers/activity/manualActivityProvider';
export class ActivityAnalysisService {
  constructor(private readonly garminProvider: GarminActivityProvider, private readonly manualProvider: ManualActivityProvider) {}
  async analyze(profile: UserProfile): Promise<{ context: ActivityContext; log?: any }> {
    if (profile.activityMode === 'garmin' && profile.garminConnected) {
      try { return await this.garminProvider.getActivityContext({ mealTime: profile.mealType === 'lunch' ? '12:30' : profile.mealType === 'dinner' ? '19:30' : '08:00', weightKg: profile.weightKg }); } catch { /* manual input remains the safe fallback */ }
    }
    return this.manualProvider.getActivityContext({ mealTime: profile.mealType === 'lunch' ? '12:30' : profile.mealType === 'dinner' ? '19:30' : '08:00', manualData: profile.manualActivity, weightKg: profile.weightKg });
  }
}
