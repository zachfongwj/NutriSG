import { FoodItem } from './food';
import { ActivityContext } from './activity';
import { EvidenceContext } from './evidence';
import { HealthCondition, FoodAllergy, FoodIntolerance, DietaryRestriction, DietaryPreference, WellnessGoal, MealType } from './profile';

export interface CalculatedEnergyMetrics {
  bmrKcal: number;
  bmrFormula: string;
  teeKcal: number;
  activityEnergyKcal: number;
  activityFormula: string;
  mealTargetKcal: number;
  macronutrientTargets: {
    proteinGramsMin: number;
    proteinGramsMax: number;
    carbsGramsMin: number;
    carbsGramsMax: number;
    fatGramsMin: number;
    fatGramsMax: number;
  };
  assumptions: string[];
}

export interface RecommendationContext {
  hardConstraints: {
    allergies: FoodAllergy[];
    dietaryRestrictions: DietaryRestriction[];
    foodIntolerances: FoodIntolerance[];
    dislikedFoods: string[];
  };
  healthConsiderations: HealthCondition[];
  customHealthConditions?: string[];
  queryText?: string;
  preferences: DietaryPreference[];
  goal: WellnessGoal;
  mealType: MealType;
  activityContext: ActivityContext;
  nutritionTargets: CalculatedEnergyMetrics;
  evidence: EvidenceContext[];
}

export interface MealRecommendation {
  id: string;
  mealName: string;
  localName?: string;
  description: string;
  foodItems: FoodItem[];
  suggestedPortion: string;

  totalNutrition: {
    calories: number;
    proteinGrams: number;
    carbohydrateGrams: number;
    fatGrams: number;
    fibreGrams?: number;
    sodiumMg?: number;
    potassiumMg?: number;
  };

  whyThisSuitsYou: string;
  healthConsiderationsNote?: string;
  safetyValidationNotes: string[];

  // Provenance
  dataSource: 'HPB Singapore Food Insights Database' | 'USDA FoodData Central' | 'Calculated from food components using USDA FoodData Central';
  matchType: 'exact' | 'approximate' | 'component-estimate';
  confidence: 'high' | 'medium' | 'low';
  sourceDetails: string;
  relevantEvidence?: EvidenceContext;
}

export interface RecommendationResponse {
  recommendations: MealRecommendation[];
  context: RecommendationContext;
  calculatedMetrics: CalculatedEnergyMetrics;
  disclaimer: string;
  timestamp: string;
}
