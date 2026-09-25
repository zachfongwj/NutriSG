import { FoodDataProvider } from './foodDataProvider';
import { FoodItem, FoodProviderStatus } from '../../types/food';
import { USDANutritionMCPClient } from '../../mcp/nutrition';
import { MCPCallLog } from '../../types/orchestration';

export class USDAFoodProvider implements FoodDataProvider {
  public readonly providerName = 'USDA FoodData Central MCP';
  private usdaClient: USDANutritionMCPClient;

  constructor(usdaClient: USDANutritionMCPClient) {
    this.usdaClient = usdaClient;
  }

  public async getStatus(): Promise<FoodProviderStatus> {
    return {
      providerName: this.providerName,
      status: 'connected',
      itemCount: 11, // Base verified Foundation/SR Legacy foods + dynamic FDC API
      details: 'Connected via Model Context Protocol (MCP) stream. Standard FDC tools active.',
      isFallback: true
    };
  }

  public async searchFoods(
    query: string,
    limit = 5
  ): Promise<{ foods: FoodItem[]; log?: MCPCallLog }> {
    const res = await this.usdaClient.searchFoods(query, limit);
    return {
      foods: res.foods,
      log: res.log
    };
  }

  public async getFood(foodId: string): Promise<{ food?: FoodItem; log?: MCPCallLog }> {
    const numericId = Number(foodId.replace(/[^0-9]/g, ''));
    if (isNaN(numericId)) return {};
    const res = await this.usdaClient.getFood(numericId);
    return { food: res.food, log: res.log };
  }

  public async getFoodNutrients(foodId: string): Promise<{ food?: FoodItem; log?: MCPCallLog }> {
    return this.getFood(foodId);
  }

  public async compareFoods(foodIds: string[]): Promise<{ foods: FoodItem[]; log?: MCPCallLog }> {
    const numericIds = foodIds.map(id => Number(id.replace(/[^0-9]/g, ''))).filter(n => !isNaN(n));
    const res = await this.usdaClient.compareFoods(numericIds);
    return { foods: res.foods, log: res.log };
  }
}
