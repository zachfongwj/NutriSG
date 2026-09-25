import { CalculatedEnergyMetrics } from '../types/recommendation';
import { UserProfile } from '../types/profile';
import { ActivityContext } from '../types/activity';

/**
 * Deterministic mathematical calculations for basal metabolic rate (BMR),
 * total energy expenditure (TEE), and target macronutrient distributions.
 *
 * All formulas and clinical assumptions are explicitly preserved and returned.
 */
export class DeterministicCalculationsService {
  /**
   * Calculates Basal Metabolic Rate using validated Mifflin-St Jeor formula.
   * Men: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
   * Women: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161
   */
  public static calculateEnergyMetrics(
    profile: UserProfile,
    activityContext: ActivityContext
  ): CalculatedEnergyMetrics {
    const assumptions: string[] = [];

    // Inputs with clinical standard defaults where unspecified
    const age = profile.age || 35;
    if (!profile.age) assumptions.push('Age unspecified: assumed adult baseline 35 years.');

    const weightKg = profile.weightKg || 68;
    if (!profile.weightKg) assumptions.push('Weight unspecified: assumed adult average 68 kg.');

    const heightCm = profile.heightCm || 168;
    if (!profile.heightCm) assumptions.push('Height unspecified: assumed adult average 168 cm.');

    const sex = profile.sex || 'unspecified';

    let bmr = 0;
    let bmrFormula = '';

    if (sex === 'male') {
      bmr = Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
      bmrFormula = 'Mifflin-St Jeor (Male): 10×W(kg) + 6.25×H(cm) - 5×Age + 5';
    } else if (sex === 'female') {
      bmr = Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
      bmrFormula = 'Mifflin-St Jeor (Female): 10×W(kg) + 6.25×H(cm) - 5×Age - 161';
    } else {
      // Neutral average of male & female equations: 10*W + 6.25*H - 5*Age - 78
      bmr = Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 78);
      bmrFormula = 'Mifflin-St Jeor (Gender-neutral median): 10×W(kg) + 6.25×H(cm) - 5×Age - 78';
      assumptions.push('Sex unspecified: computed gender-neutral median Mifflin-St Jeor BMR.');
    }

    // Physical Activity Level (PAL) multiplier baseline
    const basePAL = 1.35; // Sedentary to light baseline daily living
    const baselineTEE = Math.round(bmr * basePAL);

    // Exercise energy expenditure from activity analysis
    const activityEnergyKcal = Math.round(activityContext.estimatedCaloriesBurned || 0);
    const activityFormula = activityContext.source === 'Garmin'
      ? 'Garmin Connect Firstbeat aerobic expenditure measurement'
      : 'MET calculation: Calories = MET × Weight(kg) × Duration(hours)';

    const totalTEE = baselineTEE + activityEnergyKcal;
    assumptions.push(`Baseline daily living energy: ${baselineTEE} kcal (BMR × 1.35 PAL).`);
    if (activityEnergyKcal > 0) {
      assumptions.push(`Planned physical activity addition: ${activityEnergyKcal} kcal.`);
    }

    // Allocate energy to the target meal based on meal type
    let mealRatio = 0.30; // Default 30% for lunch or dinner
    if (profile.mealType === 'breakfast') mealRatio = 0.25;
    else if (profile.mealType === 'lunch') mealRatio = 0.35;
    else if (profile.mealType === 'dinner') mealRatio = 0.30;
    else if (profile.mealType === 'snack') mealRatio = 0.15;

    const mealTargetKcal = Math.round(totalTEE * mealRatio);

    // Macronutrient distribution based on activity timing and goals
    // Pre-exercise: carbs 55-65%, protein 15-20%, fat 15-25%
    // Post-exercise: carbs 45-55%, protein 25-30%, fat 20-25%
    // Standard: carbs 45-60%, protein 20-25%, fat 20-30%
    let carbPercentMin = 0.45;
    let carbPercentMax = 0.60;
    let proteinPercentMin = 0.18;
    let proteinPercentMax = 0.25;
    let fatPercentMin = 0.20;
    let fatPercentMax = 0.30;

    if (activityContext.mealTimingContext === 'pre-exercise') {
      carbPercentMin = 0.55;
      carbPercentMax = 0.65;
      proteinPercentMin = 0.15;
      proteinPercentMax = 0.20;
      fatPercentMin = 0.15;
      fatPercentMax = 0.22;
      assumptions.push('Meal timing is pre-exercise: higher carbohydrate target for endurance glycogen.');
    } else if (activityContext.mealTimingContext === 'post-exercise') {
      carbPercentMin = 0.45;
      carbPercentMax = 0.55;
      proteinPercentMin = 0.22;
      proteinPercentMax = 0.30;
      fatPercentMin = 0.18;
      fatPercentMax = 0.25;
      assumptions.push('Meal timing is post-exercise: elevated protein target for muscle tissue synthesis.');
    }

    const proteinGramsMin = Math.round((mealTargetKcal * proteinPercentMin) / 4);
    const proteinGramsMax = Math.round((mealTargetKcal * proteinPercentMax) / 4);
    const carbsGramsMin = Math.round((mealTargetKcal * carbPercentMin) / 4);
    const carbsGramsMax = Math.round((mealTargetKcal * carbPercentMax) / 4);
    const fatGramsMin = Math.round((mealTargetKcal * fatPercentMin) / 9);
    const fatGramsMax = Math.round((mealTargetKcal * fatPercentMax) / 9);

    return {
      bmrKcal: bmr,
      bmrFormula,
      teeKcal: totalTEE,
      activityEnergyKcal,
      activityFormula,
      mealTargetKcal,
      macronutrientTargets: {
        proteinGramsMin,
        proteinGramsMax,
        carbsGramsMin,
        carbsGramsMax,
        fatGramsMin,
        fatGramsMax
      },
      assumptions
    };
  }
}
