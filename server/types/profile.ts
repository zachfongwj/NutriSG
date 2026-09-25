export type HealthCondition = 
  | 'hypertension'
  | 'type_2_diabetes'
  | 'prediabetes'
  | 'metabolic_syndrome'
  | 'insulin_resistance'
  | 'fatty_liver'
  | 'high_cholesterol'
  | 'hypertriglyceridemia'
  | 'obesity_weight_management'
  | 'chronic_kidney_disease'
  | 'gout'
  | 'gerd';

export type FoodAllergy = 
  | 'peanuts'
  | 'tree_nuts'
  | 'shellfish'
  | 'dairy'
  | 'soy'
  | 'gluten'
  | 'eggs'
  | 'fish';

export type FoodIntolerance = 
  | 'lactose'
  | 'fructose'
  | 'fodmap'
  | 'histamine';

export type DietaryRestriction = 
  | 'halal'
  | 'vegetarian'
  | 'vegan'
  | 'low_sodium'
  | 'low_gi'
  | 'kosher';

export type DietaryPreference = 
  | 'singaporean_local'
  | 'chinese'
  | 'malay'
  | 'indian'
  | 'western'
  | 'high_protein'
  | 'light_meal';

export type WellnessGoal = 
  | 'general_healthy_eating'
  | 'pre_exercise_fuel'
  | 'post_exercise_recovery'
  | 'weight_maintenance'
  | 'blood_pressure_management'
  | 'glycemic_control';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface UserProfile {
  age?: number;
  sex?: 'male' | 'female' | 'unspecified';
  heightCm?: number;
  weightKg?: number;
  healthConditions: HealthCondition[];
  allergies: FoodAllergy[];
  foodIntolerances: FoodIntolerance[];
  dietaryRestrictions: DietaryRestriction[];
  dietaryPreferences: DietaryPreference[];
  dislikedFoods: string[];
  customHealthConditions?: string[];
  queryText?: string;
  goal: WellnessGoal;
  mealType: MealType;
  activityMode: 'manual' | 'garmin' | 'none';
  manualActivity?: {
    activity: string;
    startTime: string; // e.g. "18:30"
    durationMinutes: number;
    intensity: 'low' | 'moderate' | 'high';
  };
  garminConnected?: boolean;
}
