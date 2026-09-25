import { FoodItem } from '../types/food';
import { RecommendationContext, MealRecommendation } from '../types/recommendation';
import { ValidationResult } from './validation';

export class RecommendationFormatterService {
  public static buildMealRecommendation(
    food: FoodItem,
    context: RecommendationContext,
    validation: ValidationResult
  ): MealRecommendation {
    const { activityContext, healthConsiderations, goal, nutritionTargets } = context;

    // Build "Why this may suit you" explanation
    const reasons: string[] = [];

    // Timing & Activity reason
    if (activityContext.durationMinutes > 0 && activityContext.activity !== 'Sedentary / Light Routine') {
      if (activityContext.mealTimingContext === 'pre-exercise') {
        reasons.push(
          `Provides ${food.carbohydrateGrams}g carbohydrates to support glycogen stores for your upcoming ${activityContext.durationMinutes}-minute ${activityContext.activity.toLowerCase()} at ${activityContext.startTime}, with moderate fat (${food.fatGrams}g) for smooth digestion.`
        );
      } else if (activityContext.mealTimingContext === 'post-exercise') {
        reasons.push(
          `Supplies ${food.proteinGrams}g protein to kickstart myofibrillar muscle repair following your ${activityContext.durationMinutes}-minute ${activityContext.activity.toLowerCase()}.`
        );
      } else {
        reasons.push(
          `Balanced energy profile to sustain your planned ${activityContext.activity.toLowerCase()} session later today.`
        );
      }
    } else {
      reasons.push(
        `Nutritionally balanced meal providing ${food.calories} kcal, fitting within your target meal budget of ~${nutritionTargets.mealTargetKcal} kcal.`
      );
    }

    // Goal reason
    if (goal === 'blood_pressure_management' || healthConsiderations.includes('hypertension')) {
      if (food.sodiumMg !== undefined && food.sodiumMg <= 650) {
        reasons.push(`Contains controlled sodium (${food.sodiumMg}mg) and potassium (${food.micronutrients?.potassiumMg || 'abundant'}mg) aligned with DASH dietary approaches.`);
      }
    }
    if (food.isHealthierChoice) {
      reasons.push(`Complies with Singapore Healthier Dining Programme nutritional criteria.`);
    }

    const whyThisSuitsYou = reasons.join(' ');

    // Health considerations note
    let healthConsiderationsNote: string | undefined;
    if (healthConsiderations.length > 0) {
      const notes: string[] = [];
      if (healthConsiderations.includes('hypertension')) {
        notes.push(`Hypertension support: Sodium is ~${food.sodiumMg ?? 'unspecified'}mg. If hawker soup broth is served, leaving half the soup unconsumed further reduces sodium intake by ~30-40%.`);
      }
      if (healthConsiderations.includes('type_2_diabetes') || healthConsiderations.includes('prediabetes') || healthConsiderations.includes('insulin_resistance')) {
        notes.push(`Glycemic & insulin control: Pair with unrefined brown rice or whole greens to mitigate postprandial glycemic excursions.`);
      }
      if (healthConsiderations.includes('metabolic_syndrome') || healthConsiderations.includes('hypertriglyceridemia')) {
        notes.push(`Triglyceride & lipid management: Complex unrefined carbs and high-fiber legumes support hepatic VLDL attenuation.`);
      }
      if (healthConsiderations.includes('fatty_liver')) {
        notes.push(`Fatty liver (NAFLD) guidance: Emphasizes natural whole ingredients without added simple syrups or excessive saturated fats.`);
      }
      if (healthConsiderations.includes('high_cholesterol')) {
        notes.push(`Lipid balance: Low in saturated fat (~${food.micronutrients?.saturatedFatGrams ?? 2}g); rich in unsaturated sources and dietary fibre.`);
      }
      if (context.customHealthConditions && context.customHealthConditions.length > 0) {
        notes.push(`Custom health status noted: ${context.customHealthConditions.join(', ')}. Consult your healthcare provider to confirm suitability.`);
      }
      healthConsiderationsNote = notes.join(' ');
    }

    // Map source label
    let dataSourceLabel: 'HPB Singapore Food Insights Database' | 'USDA FoodData Central' | 'Calculated from food components using USDA FoodData Central';
    if (food.source === 'HPB SG FoodID') {
      dataSourceLabel = 'HPB Singapore Food Insights Database';
    } else if (food.source === 'USDA FoodData Central') {
      dataSourceLabel = 'USDA FoodData Central';
    } else {
      dataSourceLabel = 'Calculated from food components using USDA FoodData Central';
    }

    // Attach relevant evidence context
    let relevantEvidence: any = undefined;
    if (context.evidence && context.evidence.length > 0) {
      for (const ctx of context.evidence) {
        if (ctx.articles && ctx.articles.length > 0) {
          const art = ctx.articles[0];
          const yearMatch = art.publicationDate ? parseInt(art.publicationDate) : undefined;
          relevantEvidence = {
            pmid: art.pmid,
            title: art.title,
            journal: art.journal,
            publicationYear: !isNaN(yearMatch as number) ? yearMatch : undefined,
            keyFinding: art.keyFinding || art.abstract,
            source: 'PubMed',
            relevanceTopic: ctx.topic || art.relevanceTopic
          };
          break;
        }
      }
    }

    return {
      id: `rec_${food.foodId}_${Math.random().toString(36).substring(2, 6)}`,
      mealName: food.name,
      localName: food.localName,
      description: food.description,
      foodItems: [food],
      suggestedPortion: food.servingSize.description || `${food.servingSize.amount} ${food.servingSize.unit}`,
      totalNutrition: {
        calories: food.calories,
        proteinGrams: food.proteinGrams,
        carbohydrateGrams: food.carbohydrateGrams,
        fatGrams: food.fatGrams,
        fibreGrams: food.fibreGrams,
        sodiumMg: food.sodiumMg,
        potassiumMg: food.micronutrients.potassiumMg
      },
      whyThisSuitsYou,
      healthConsiderationsNote,
      safetyValidationNotes: validation.safetyNotes,
      dataSource: dataSourceLabel,
      matchType: food.matchType,
      confidence: food.confidence,
      sourceDetails: food.provenanceNotes || (food.source === 'HPB SG FoodID' ? 'Verified HPB Singapore Food Insights database reference' : 'Retrieved via USDA FoodData Central MCP'),
      relevantEvidence
    };
  }
}
