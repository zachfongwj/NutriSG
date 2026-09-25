import { ActivityContext } from '../types/activity';
import { UserProfile } from '../types/profile';
import { GarminActivityProvider } from '../providers/activity/garminProvider';
import { ManualActivityProvider } from '../providers/activity/manualActivityProvider';
import { MCPCallLog } from '../types/orchestration';

export class ActivityAnalysisService {
  private garminProvider: GarminActivityProvider;
  private manualProvider: ManualActivityProvider;

  constructor(garminProvider: GarminActivityProvider, manualProvider: ManualActivityProvider) {
    this.garminProvider = garminProvider;
    this.manualProvider = manualProvider;
  }

  public async analyze(profile: UserProfile): Promise<{ context: ActivityContext; log?: MCPCallLog }> {
    // If Garmin is chosen and connected
    if (profile.activityMode === 'garmin' && profile.garminConnected) {
      return await this.garminProvider.getActivityContext({
        mealTime: profile.mealType === 'lunch' ? '12:30' : profile.mealType === 'dinner' ? '19:30' : '08:00',
        weightKg: profile.weightKg
      });
    }

    // Otherwise use manual entry
    return await this.manualProvider.getActivityContext({
      mealTime: profile.mealType === 'lunch' ? '12:30' : profile.mealType === 'dinner' ? '19:30' : '08:00',
      manualData: profile.manualActivity,
      weightKg: profile.weightKg
    });
  }
}
