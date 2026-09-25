import { FoodDataProvider } from './foodDataProvider';
import { FoodItem, FoodProviderStatus } from '../../types/food';
import { USDANutritionMCPClient } from '../../mcp/nutrition';
export class USDAFoodProvider implements FoodDataProvider {
  readonly providerName = 'Remote Food MCP';
  constructor(private readonly client: USDANutritionMCPClient) {}
  async getStatus(): Promise<FoodProviderStatus> { const configured = Boolean(this.client); return { providerName: this.providerName, status: configured ? 'connected' : 'not_configured', details: 'Food status is reported by the remote MCP registry.', isFallback: false }; }
  async searchFoods(query: string, limit = 5) { return this.client.searchFoods(query, limit); }
  async getFood(foodId: string) { const id = Number(foodId.replace(/\D/g, '')); return Number.isFinite(id) && id > 0 ? this.client.getFood(id) : {}; }
  async getFoodNutrients(foodId: string) { return this.getFood(foodId); }
  async compareFoods(foodIds: string[]) { return this.client.compareFoods(foodIds.map(id => Number(id.replace(/\D/g, ''))).filter(id => id > 0)); }
}
