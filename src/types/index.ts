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
    startTime: string;
    durationMinutes: number;
    intensity: 'low' | 'moderate' | 'high';
  };
  garminConnected?: boolean;
}

export interface ServingSize {
  amount: number;
  unit: string;
  description?: string;
}

export interface Micronutrients {
  potassiumMg?: number;
  calciumMg?: number;
  ironMg?: number;
  vitaminCMg?: number;
  cholesterolMg?: number;
  saturatedFatGrams?: number;
  sugarGrams?: number;
  [key: string]: number | undefined;
}

export interface FoodItem {
  foodId: string;
  name: string;
  localName?: string;
  description: string;
  category: 'singapore_dish' | 'hawker_item' | 'breakfast' | 'beverage' | 'ingredient' | 'snack';
  servingSize: ServingSize;
  calories: number;
  proteinGrams: number;
  carbohydrateGrams: number;
  fatGrams: number;
  fibreGrams?: number;
  sodiumMg?: number;
  micronutrients: Micronutrients;
  source: 'HPB SG FoodID' | 'USDA FoodData Central' | 'Calculated Component Estimate';
  sourceId: string;
  sourceUrl?: string;
  matchType: 'exact' | 'approximate' | 'component-estimate';
  confidence: 'high' | 'medium' | 'low';
  provenanceNotes?: string;
  isHealthierChoice?: boolean;
  containsAllergens?: string[];
  halalCertified?: boolean;
  vegetarianFriendly?: boolean;
  ingredients?: string[];
}

export interface PubMedArticle {
  pmid: string;
  title: string;
  authors: string[];
  journal: string;
  publicationDate: string;
  abstract: string;
  publicationType: string[];
  url: string;
  source: 'PubMed';
  keyFinding?: string;
  relevanceTopic?: string;
}

export interface EvidenceContext {
  evidenceQuery: string;
  topic: string;
  articles: PubMedArticle[];
  authoritativeGuidelineReference?: string;
  evidenceStrength: 'guideline' | 'systematic_review' | 'observational_study';
}

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
  dataSource: 'HPB Singapore Food Insights Database' | 'USDA FoodData Central' | 'Calculated from food components using USDA FoodData Central';
  matchType: 'exact' | 'approximate' | 'component-estimate';
  confidence: 'high' | 'medium' | 'low';
  sourceDetails: string;
  relevantEvidence?: EvidenceContext;
}

export interface WorkflowStep {
  stepId: string;
  name: string;
  component: string;
  status: 'pending' | 'running' | 'completed' | 'skipped' | 'failed';
  inputSummary?: string;
  outputSummary?: string;
  mcpServerCalled?: string;
  toolName?: string;
  durationMs: number;
  error?: string;
}

export interface MCPCallLog {
  id: string;
  timestamp: string;
  server: string;
  toolName: string;
  sanitizedArguments: Record<string, unknown>;
  status: 'success' | 'failure' | 'cached' | 'fallback';
  responseTimeMs: number;
  resultSummary: string;
  error?: string;
}

export interface OrchestrationTrace {
  requestId: string;
  startTime: string;
  totalDurationMs: number;
  steps: WorkflowStep[];
  mcpCalls: MCPCallLog[];
}

export interface RecommendationResponse {
  recommendations: MealRecommendation[];
  context: any;
  calculatedMetrics: CalculatedEnergyMetrics;
  disclaimer: string;
  timestamp: string;
}

export interface MCPServerStatusReport {
  id: string;
  name: string;
  category: 'Food Data' | 'Evidence' | 'Fitness';
  status: 'connected' | 'disconnected' | 'not_configured';
  transport: string;
  toolsDiscoveredCount: number;
  toolNames: string[];
  serverInfo?: { name: string; version: string };
  lastCheckTime: string;
}

export interface SystemStatusData {
  singaporeFoodData: {
    providerName: string;
    status: 'connected' | 'dataset_loaded' | 'not_configured' | 'disconnected';
    itemCount?: number;
    details: string;
    isFallback: boolean;
  };
  mcpServers: MCPServerStatusReport[];
  timestamp: string;
}
