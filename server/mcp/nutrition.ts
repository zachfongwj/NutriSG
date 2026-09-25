import { MCPClient } from './client';
import { FoodItem } from '../types/food';
import { MCPCallLog } from '../types/orchestration';

export class USDANutritionMCPClient {
  private mcpClient: MCPClient;

  constructor(client: MCPClient) {
    this.mcpClient = client;
  }

  /**
   * Discovers tools and identifies the tool for food search
   */
  private findTool(candidates: string[]): string | undefined {
    const discovered = this.mcpClient.getDiscoveredTools().map(t => t.name);
    return candidates.find(c => discovered.includes(c));
  }

  /**
   * Search foods via USDA MCP with tool discovery
   */
  public async searchFoods(
    query: string,
    limit = 5
  ): Promise<{ foods: FoodItem[]; log?: MCPCallLog; error?: string }> {
    // Check discovered tools dynamically
    const searchTool = this.findTool(['usda_search_foods', 'search_foods', 'searchFoods']) || 'usda_search_foods';

    const invokeRes = await this.mcpClient.invokeTool<any>(searchTool, {
      query,
      pageSize: limit
    });

    if (!invokeRes.success || !invokeRes.result) {
      return { foods: [], log: invokeRes.log, error: invokeRes.error || 'Failed to search foods' };
    }

    const rawFoods = invokeRes.result.foods || [];
    const normalized: FoodItem[] = rawFoods.map((f: any) => this.normalizeUSDAFood(f));

    return { foods: normalized, log: invokeRes.log };
  }

  /**
   * Retrieve food by FDC ID via USDA MCP
   */
  public async getFood(
    fdcId: number
  ): Promise<{ food?: FoodItem; log?: MCPCallLog; error?: string }> {
    const getTool = this.findTool(['usda_get_food', 'get_food', 'getFood']) || 'usda_get_food';

    const invokeRes = await this.mcpClient.invokeTool<any>(getTool, { fdcId });
    if (!invokeRes.success || !invokeRes.result) {
      return { log: invokeRes.log, error: invokeRes.error };
    }

    return { food: this.normalizeUSDAFood(invokeRes.result), log: invokeRes.log };
  }

  /**
   * Compare foods via USDA MCP
   */
  public async compareFoods(
    fdcIds: number[]
  ): Promise<{ foods: FoodItem[]; log?: MCPCallLog; error?: string }> {
    const compareTool = this.findTool(['usda_compare_foods', 'compare_foods', 'compareFoods']) || 'usda_compare_foods';

    const invokeRes = await this.mcpClient.invokeTool<any>(compareTool, {
      fdcIds: fdcIds.join(',')
    });

    if (!invokeRes.success || !invokeRes.result) {
      return { foods: [], log: invokeRes.log, error: invokeRes.error };
    }

    const rawFoods = invokeRes.result.foods || [];
    return {
      foods: rawFoods.map((f: any) => this.normalizeUSDAFood(f)),
      log: invokeRes.log
    };
  }

  /**
   * Normalizes USDA raw food record into shared TypeScript FoodItem.
   * NOTE: Missing nutrient values remain undefined. NEVER converted to zero!
   */
  private normalizeUSDAFood(raw: any): FoodItem {
    const nutrients = raw.foodNutrients || [];

    const getNutrientVal = (names: string[]): number | undefined => {
      const match = nutrients.find((n: any) => {
        const name = (n.nutrientName || n.name || '').toLowerCase();
        return names.some(target => name.includes(target.toLowerCase()));
      });
      return match && match.value !== undefined ? Number(match.value) : undefined;
    };

    const calories = getNutrientVal(['Energy']) ?? 0;
    const proteinGrams = getNutrientVal(['Protein']) ?? 0;
    const fatGrams = getNutrientVal(['Total lipid', 'fat']) ?? 0;
    const carbohydrateGrams = getNutrientVal(['Carbohydrate', 'carb']) ?? 0;
    const fibreGrams = getNutrientVal(['Fiber', 'fibre']);
    const sodiumMg = getNutrientVal(['Sodium', 'Na']);
    const potassiumMg = getNutrientVal(['Potassium', 'K']);
    const calciumMg = getNutrientVal(['Calcium', 'Ca']);
    const ironMg = getNutrientVal(['Iron', 'Fe']);

    const fdcId = String(raw.fdcId || raw.id || 'USDA');

    return {
      foodId: `USDA-${fdcId}`,
      name: raw.description || 'USDA Food Item',
      description: `USDA FoodData Central item (${raw.dataType || 'Foundation'}). Note: international nutrition profile.`,
      category: 'ingredient',
      servingSize: {
        amount: Number(raw.servingSize) || 100,
        unit: raw.servingSizeUnit || 'g',
        description: `100g standard reference portion`
      },
      calories,
      proteinGrams,
      carbohydrateGrams,
      fatGrams,
      fibreGrams,
      sodiumMg,
      micronutrients: {
        potassiumMg,
        calciumMg,
        ironMg
      },
      source: 'USDA FoodData Central',
      sourceId: fdcId,
      sourceUrl: `https://fdc.nal.usda.gov/fdc-app.html#/food-details/${fdcId}/nutrients`,
      matchType: 'approximate',
      confidence: 'medium',
      provenanceNotes: 'Retrieved via USDA FoodData Central MCP fallback.'
    };
  }
}
