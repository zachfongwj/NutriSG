import { FoodDataProvider } from './foodDataProvider';
import { FoodProviderStatus } from '../../types/food';
export class SingaporeFoodProvider implements FoodDataProvider {
  readonly providerName = 'HPB Singapore Food Insights Database (SG FoodID)';
  async getStatus(): Promise<FoodProviderStatus> { return { providerName: this.providerName, status: 'not_configured', itemCount: 0, details: 'No legitimate programmatic SG FoodID endpoint is configured.', isFallback: false }; }
  async searchFoods() { return { foods: [] }; }
  async getFood() { return {}; }
  async getFoodNutrients() { return {}; }
  async compareFoods() { return { foods: [] }; }
}
