import { MCPHandler } from '../client';
import { JsonRpcRequest, JsonRpcResponse, MCPToolDefinition } from '../types';
import { USDA_VERIFIED_DATASET, USDAFoodRecord } from '../../providers/food/data/usdaFallbackFoods';

export class USDAMcpServer implements MCPHandler {
  private tools: MCPToolDefinition[] = [
    {
      name: 'usda_search_foods',
      description: 'Search foods and ingredients in USDA FoodData Central database by query keyword.',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search term or food keyword (e.g. chicken breast, brown rice)' },
          pageSize: { type: 'number', description: 'Number of results to return (default: 5)' },
          dataType: { type: 'string', description: 'Optional USDA data type filter: Foundation, SR Legacy, Survey' }
        },
        required: ['query']
      }
    },
    {
      name: 'usda_get_food',
      description: 'Retrieve detailed nutrient profile and composition for a specific food using its FDC ID.',
      inputSchema: {
        type: 'object',
        properties: {
          fdcId: { type: 'number', description: 'USDA FoodData Central unique food identifier (FDC ID)' }
        },
        required: ['fdcId']
      }
    },
    {
      name: 'usda_compare_foods',
      description: 'Compare macronutrient and calorie profiles of two or more USDA foods by FDC ID.',
      inputSchema: {
        type: 'object',
        properties: {
          fdcIds: { type: 'string', description: 'Comma-separated FDC IDs to compare' }
        },
        required: ['fdcIds']
      }
    },
    {
      name: 'usda_list_nutrients',
      description: 'List major macronutrient and micronutrient metrics tracked in the database.',
      inputSchema: {
        type: 'object',
        properties: {}
      }
    }
  ];

  public async handleRequest(req: JsonRpcRequest): Promise<JsonRpcResponse> {
    if (req.method === 'initialize') {
      return {
        jsonrpc: '2.0',
        id: req.id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: {
            name: 'usda-fooddata-central-mcp',
            version: '1.2.0'
          }
        }
      };
    }

    if (req.method === 'notifications/initialized') {
      return { jsonrpc: '2.0', id: req.id, result: { acknowledged: true } };
    }

    if (req.method === 'tools/list') {
      return {
        jsonrpc: '2.0',
        id: req.id,
        result: {
          tools: this.tools
        }
      };
    }

    if (req.method === 'tools/call') {
      const toolName = (req.params as any)?.name;
      const args = (req.params as any)?.arguments || {};

      switch (toolName) {
        case 'usda_search_foods': {
          const query = String(args.query || '').trim();
          const pageSize = Number(args.pageSize) || 5;

          const results = await this.searchUSDA(query, pageSize);
          return {
            jsonrpc: '2.0',
            id: req.id,
            result: {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  query,
                  totalHits: results.length,
                  foods: results
                }, null, 2)
              }]
            }
          };
        }

        case 'usda_get_food': {
          const fdcId = Number(args.fdcId);
          const food = await this.getFoodByFdcId(fdcId);
          if (!food) {
            return {
              jsonrpc: '2.0',
              id: req.id,
              result: {
                isError: true,
                content: [{ type: 'text', text: `Food with FDC ID ${fdcId} not found in USDA FoodData Central.` }]
              }
            };
          }

          return {
            jsonrpc: '2.0',
            id: req.id,
            result: {
              content: [{
                type: 'text',
                text: JSON.stringify(food, null, 2)
              }]
            }
          };
        }

        case 'usda_compare_foods': {
          const ids = String(args.fdcIds || '').split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
          const comparison = await Promise.all(ids.map(id => this.getFoodByFdcId(id)));
          const valid = comparison.filter((f): f is USDAFoodRecord => !!f);

          return {
            jsonrpc: '2.0',
            id: req.id,
            result: {
              content: [{
                type: 'text',
                text: JSON.stringify({ comparedCount: valid.length, foods: valid }, null, 2)
              }]
            }
          };
        }

        case 'usda_list_nutrients': {
          return {
            jsonrpc: '2.0',
            id: req.id,
            result: {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  nutrients: [
                    { name: 'Energy', unit: 'kcal', number: '208' },
                    { name: 'Protein', unit: 'g', number: '203' },
                    { name: 'Total lipid (fat)', unit: 'g', number: '204' },
                    { name: 'Carbohydrate, by difference', unit: 'g', number: '205' },
                    { name: 'Fiber, total dietary', unit: 'g', number: '291' },
                    { name: 'Sodium, Na', unit: 'mg', number: '307' },
                    { name: 'Potassium, K', unit: 'mg', number: '306' },
                    { name: 'Calcium, Ca', unit: 'mg', number: '301' }
                  ]
                }, null, 2)
              }]
            }
          };
        }

        default:
          return {
            jsonrpc: '2.0',
            id: req.id,
            error: {
              code: -32601,
              message: `Unknown tool: ${toolName}`
            }
          };
      }
    }

    return {
      jsonrpc: '2.0',
      id: req.id,
      error: { code: -32601, message: `Method not found: ${req.method}` }
    };
  }

  private async searchUSDA(query: string, pageSize: number): Promise<USDAFoodRecord[]> {
    // Attempt real USDA API call if network allows
    const apiKey = process.env.USDA_API_KEY || 'DEMO_KEY';
    try {
      const url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}&query=${encodeURIComponent(query)}&pageSize=${pageSize}&dataType=Foundation,SR%20Legacy`;
      const res = await fetch(url, { headers: { 'Accept': 'application/json' }, signal: AbortSignal.timeout(3500) });
      if (res.ok) {
        const data = await res.json();
        if (data.foods && Array.isArray(data.foods) && data.foods.length > 0) {
          return data.foods.map((f: any) => ({
            fdcId: f.fdcId,
            description: f.description,
            dataType: f.dataType || 'USDA FDC',
            foodCategory: f.foodCategory,
            servingSize: f.servingSize || 100,
            servingSizeUnit: f.servingSizeUnit || 'g',
            foodNutrients: (f.foodNutrients || []).map((n: any) => ({
              nutrientId: n.nutrientId,
              nutrientName: n.nutrientName,
              nutrientNumber: n.nutrientNumber,
              unitName: n.unitName?.toLowerCase(),
              value: n.value
            }))
          }));
        }
      }
    } catch {
      // Fall through to local verified USDA dataset
    }

    // Fallback: match from USDA_VERIFIED_DATASET
    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
    const matches = USDA_VERIFIED_DATASET.filter(item => {
      const desc = item.description.toLowerCase();
      const cat = (item.foodCategory || '').toLowerCase();
      return tokens.some(t => desc.includes(t) || cat.includes(t));
    });

    return (matches.length > 0 ? matches : USDA_VERIFIED_DATASET).slice(0, pageSize);
  }

  private async getFoodByFdcId(fdcId: number): Promise<USDAFoodRecord | undefined> {
    const local = USDA_VERIFIED_DATASET.find(f => f.fdcId === fdcId);
    if (local) return local;

    const apiKey = process.env.USDA_API_KEY || 'DEMO_KEY';
    try {
      const url = `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${apiKey}`;
      const res = await fetch(url, { headers: { 'Accept': 'application/json' }, signal: AbortSignal.timeout(3500) });
      if (res.ok) {
        const f = await res.json();
        return {
          fdcId: f.fdcId,
          description: f.description,
          dataType: f.dataType || 'USDA FDC',
          foodCategory: f.foodCategory,
          servingSize: f.servingSize || 100,
          servingSizeUnit: f.servingSizeUnit || 'g',
          foodNutrients: (f.foodNutrients || []).map((n: any) => ({
            nutrientName: n.nutrient?.name || n.nutrientName,
            unitName: n.nutrient?.unitName || n.unitName,
            value: n.amount !== undefined ? n.amount : n.value
          }))
        };
      }
    } catch {
      // Return undefined if not reachable
    }

    return undefined;
  }
}
