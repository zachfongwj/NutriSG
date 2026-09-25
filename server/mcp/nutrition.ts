import { MCPClient } from './client';
import { FoodItem } from '../types/food';
import { MCPCallLog } from '../types/orchestration';

export class USDANutritionMCPClient {
  constructor(private readonly mcpClient: MCPClient) {}
  private findTool(candidates: string[]) { return candidates.find(name => this.mcpClient.getDiscoveredTools().some(tool => tool.name === name)); }
  async searchFoods(query: string, limit = 5): Promise<{ foods: FoodItem[]; log?: MCPCallLog; error?: string }> {
    const tool = this.findTool(['search_foods', 'food_search', 'usda_search_foods', 'searchFoods']);
    if (!tool) return { foods: [], error: 'Food MCP has no discovered search tool' };
    const result = await this.mcpClient.invokeTool<any>(tool, { query, pageSize: limit, limit });
    if (!result.success) return { foods: [], log: result.log, error: result.error };
    const raw = Array.isArray(result.result) ? result.result : result.result?.foods || result.result?.data || [];
    return { foods: raw.map((item: any) => this.normalize(item)).filter(Boolean) as FoodItem[], log: result.log };
  }
  async getFood(fdcId: number) { const tool = this.findTool(['get_food', 'food_get', 'usda_get_food', 'getFood']); if (!tool) return { error: 'Food MCP has no discovered get tool' }; const result = await this.mcpClient.invokeTool<any>(tool, { fdcId, id: fdcId }); return result.success ? { food: this.normalize(result.result), log: result.log } : { log: result.log, error: result.error }; }
  async compareFoods(fdcIds: number[]) { const tool = this.findTool(['compare_foods', 'usda_compare_foods', 'compareFoods']); if (!tool) return { foods: [], error: 'Food MCP has no discovered comparison tool' }; const result = await this.mcpClient.invokeTool<any>(tool, { fdcIds: fdcIds.join(','), ids: fdcIds }); const raw = result.result?.foods || []; return { foods: result.success ? raw.map((item: any) => this.normalize(item)).filter(Boolean) as FoodItem[] : [], log: result.log, error: result.error }; }
  private normalize(raw: any): FoodItem | undefined {
    if (!raw || typeof raw !== 'object') return undefined;
    const nutrients = Array.isArray(raw.foodNutrients) ? raw.foodNutrients : Array.isArray(raw.nutrients) ? raw.nutrients : [];
    const value = (terms: string[]) => { const n = nutrients.find((item: any) => terms.some(term => String(item.nutrientName || item.name || item.nutrient?.name || '').toLowerCase().includes(term))); const v = n?.value ?? n?.amount; return v === undefined || v === null || Number.isNaN(Number(v)) ? undefined : Number(v); };
    const calories = value(['energy', 'calorie']), protein = value(['protein']), carbs = value(['carbohydrate', 'carb']), fat = value(['total lipid', 'fat']);
    if ([calories, protein, carbs, fat].some(v => v === undefined)) return undefined;
    const id = String(raw.fdcId || raw.id || raw.foodId || ''); if (!id) return undefined;
    return { foodId: `FOOD-${id}`, name: String(raw.description || raw.name || 'Food'), description: String(raw.description || raw.name || 'Remote food composition record'), category: 'ingredient', servingSize: { amount: Number(raw.servingSize) || 100, unit: raw.servingSizeUnit || 'g' }, calories, proteinGrams: protein, carbohydrateGrams: carbs, fatGrams: fat, fibreGrams: value(['fiber', 'fibre']), sodiumMg: value(['sodium']), micronutrients: { potassiumMg: value(['potassium']), calciumMg: value(['calcium']), ironMg: value(['iron']) }, source: 'USDA FoodData Central', sourceId: id, sourceUrl: `https://fdc.nal.usda.gov/fdc-app.html#/food-details/${id}/nutrients`, matchType: 'approximate', confidence: 'medium', provenanceNotes: 'Retrieved from a configured remote Food MCP.' };
  }
}
