export interface ServingSize {
  amount: number;
  unit: string; // e.g. "g", "bowl", "portion", "plate"
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

  // Provenance & matching
  matchType: 'exact' | 'approximate' | 'component-estimate';
  confidence: 'high' | 'medium' | 'low';
  provenanceNotes?: string;

  // Local Singapore traits
  isHealthierChoice?: boolean;
  containsAllergens?: string[];
  halalCertified?: boolean;
  vegetarianFriendly?: boolean;
  ingredients?: string[];
}

export type ProviderStatusType = 'connected' | 'dataset_loaded' | 'not_configured' | 'disconnected';

export interface FoodProviderStatus {
  providerName: string;
  status: ProviderStatusType;
  itemCount?: number;
  details: string;
  isFallback: boolean;
}
