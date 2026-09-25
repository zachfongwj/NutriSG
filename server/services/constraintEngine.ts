import { UserProfile } from '../types/profile';
import { ActivityContext } from '../types/activity';
import { CalculatedEnergyMetrics, RecommendationContext } from '../types/recommendation';
import { EvidenceContext } from '../types/evidence';

export class ConstraintEngineService {
  public static buildContext(params: {
    profile: UserProfile;
    activityContext: ActivityContext;
    nutritionTargets: CalculatedEnergyMetrics;
    evidence: EvidenceContext[];
  }): RecommendationContext {
    const { profile, activityContext, nutritionTargets, evidence } = params;

    return {
      hardConstraints: {
        allergies: profile.allergies || [],
        dietaryRestrictions: profile.dietaryRestrictions || [],
        foodIntolerances: profile.foodIntolerances || [],
        dislikedFoods: profile.dislikedFoods || []
      },
      healthConsiderations: profile.healthConditions || [],
      customHealthConditions: profile.customHealthConditions || [],
      queryText: profile.queryText,
      preferences: profile.dietaryPreferences || [],
      goal: profile.goal,
      mealType: profile.mealType,
      activityContext,
      nutritionTargets,
      evidence
    };
  }
}
