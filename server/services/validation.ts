import { FoodItem } from '../types/food';
import { RecommendationContext } from '../types/recommendation';

export interface ValidationResult {
  isValid: boolean;
  rejectedReasons: string[];
  safetyNotes: string[];
  healthWarnings: string[];
  completenessScore: number;
}

export class SafetyValidationService {
  /**
   * Validates a candidate food item or meal against the recommendation context.
   * Enforces strict elimination on hard constraints (allergies, dietary exclusions).
   */
  public static validateCandidate(
    food: FoodItem,
    context: RecommendationContext
  ): ValidationResult {
    const rejectedReasons: string[] = [];
    const safetyNotes: string[] = [];
    const healthWarnings: string[] = [];

    const { hardConstraints, healthConsiderations } = context;

    // 1. HARD CONSTRAINT: Allergies
    const allergensInFood = (food.containsAllergens || []).map(a => a.toLowerCase());
    const foodIngredients = (food.ingredients || []).map(i => i.toLowerCase());
    const foodNameLower = food.name.toLowerCase();

    for (const allergy of hardConstraints.allergies) {
      const allergyKey = allergy.toLowerCase();
      const containsDirect = allergensInFood.includes(allergyKey);
      const containsIngredient = foodIngredients.some(i => i.includes(allergyKey));
      const containsInName = foodNameLower.includes(allergyKey);

      if (containsDirect || containsIngredient || containsInName) {
        rejectedReasons.push(`Eliminated due to hard allergy constraint: contains '${allergy}'.`);
      }
    }

    // Peanut & tree nut specific deep check
    if (hardConstraints.allergies.includes('peanuts')) {
      if (foodIngredients.some(i => i.includes('peanut') || i.includes('groundnut'))) {
        rejectedReasons.push('Eliminated: contains peanuts.');
      }
    }
    if (hardConstraints.allergies.includes('shellfish')) {
      if (
        allergensInFood.includes('crustaceans') ||
        foodIngredients.some(i => i.includes('shrimp') || i.includes('prawn') || i.includes('crab') || i.includes('clam'))
      ) {
        rejectedReasons.push('Eliminated: contains shellfish/crustaceans.');
      }
    }

    // 2. HARD CONSTRAINT: Explicit dietary restrictions
    if (hardConstraints.dietaryRestrictions.includes('halal')) {
      if (food.halalCertified === false) {
        rejectedReasons.push('Eliminated: does not meet Halal requirement (contains non-halal ingredients or pork).');
      }
    }
    if (hardConstraints.dietaryRestrictions.includes('vegetarian') || hardConstraints.dietaryRestrictions.includes('vegan')) {
      if (!food.vegetarianFriendly) {
        rejectedReasons.push('Eliminated: does not meet vegetarian requirement.');
      }
    }

    // 3. HARD CONSTRAINT: Disliked foods
    for (const disliked of hardConstraints.dislikedFoods) {
      const dLower = disliked.toLowerCase().trim();
      if (dLower && (foodNameLower.includes(dLower) || foodIngredients.some(i => i.includes(dLower)))) {
        rejectedReasons.push(`Eliminated: user specified dislike for '${disliked}'.`);
      }
    }

    // If any hard constraints failed, return immediately as invalid (NEVER let LLM override)
    if (rejectedReasons.length > 0) {
      return {
        isValid: false,
        rejectedReasons,
        safetyNotes: [],
        healthWarnings: [],
        completenessScore: 0
      };
    }

    // 4. HEALTH-RELATED CONSIDERATIONS
    // Hypertension: Flag sodium levels
    if (healthConsiderations.includes('hypertension')) {
      const sodium = food.sodiumMg ?? 9999;
      if (sodium > 900) {
        // High sodium dish like full-broth laksa (>900mg) should be excluded or severely flagged
        rejectedReasons.push(`Sodium content (${sodium}mg) exceeds conservative single-meal threshold (<800mg) for hypertension.`);
      } else if (sodium > 600) {
        safetyNotes.push(`Moderate sodium (${sodium}mg). Recommended: consume broth sparingly.`);
      } else {
        safetyNotes.push(`Sodium content (${sodium}mg) is well-aligned with DASH guidelines (<600mg per meal).`);
      }
    }

    // Type 2 Diabetes: Low GI / lower refined carbs
    if (
      healthConsiderations.includes('type_2_diabetes') ||
      healthConsiderations.includes('prediabetes') ||
      healthConsiderations.includes('insulin_resistance') ||
      healthConsiderations.includes('metabolic_syndrome')
    ) {
      if (food.fibreGrams !== undefined && food.fibreGrams >= 4.0) {
        safetyNotes.push(`High fibre content (${food.fibreGrams}g) supports blunted postprandial glucose & insulin response.`);
      }
      if (food.carbohydrateGrams > 80) {
        healthWarnings.push(`Carbohydrate content (${food.carbohydrateGrams}g) is high; consider reducing rice/noodle portion.`);
      }
    }

    // Fatty Liver (NAFLD) / Hypertriglyceridemia: Flag high saturated fat & simple sugars
    if (healthConsiderations.includes('fatty_liver') || healthConsiderations.includes('hypertriglyceridemia')) {
      const satFat = food.micronutrients?.saturatedFatGrams ?? 0;
      if (satFat > 10) {
        healthWarnings.push(`Saturated fat is elevated (~${satFat}g); Mediterranean-style unsaturated fats preferred.`);
      } else {
        safetyNotes.push(`Low to moderate saturated fat (~${satFat}g), well suited for hepatic metabolic management.`);
      }
    }

    // 5. Data completeness check
    let completenessScore = 1.0;
    if (food.calories === undefined || food.calories === 0) completenessScore -= 0.3;
    if (food.proteinGrams === undefined) completenessScore -= 0.2;
    if (food.carbohydrateGrams === undefined) completenessScore -= 0.2;
    if (food.fatGrams === undefined) completenessScore -= 0.2;

    const isValid = rejectedReasons.length === 0;

    return {
      isValid,
      rejectedReasons,
      safetyNotes,
      healthWarnings,
      completenessScore
    };
  }
}
