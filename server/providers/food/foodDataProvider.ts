import { FoodItem, FoodProviderStatus } from '../../types/food';
import { MCPCallLog } from '../../types/orchestration';

export interface FoodDataProvider {
  readonly providerName: string;
  getStatus(): Promise<FoodProviderStatus>;
  searchFoods(query: string, limit?: number): Promise<{ foods: FoodItem[]; log?: MCPCallLog }>;
  getFood(foodId: string): Promise<{ food?: FoodItem; log?: MCPCallLog }>;
  getFoodNutrients(foodId: string): Promise<{ food?: FoodItem; log?: MCPCallLog }>;
  compareFoods(foodIds: string[]): Promise<{ foods: FoodItem[]; log?: MCPCallLog }>;
}
