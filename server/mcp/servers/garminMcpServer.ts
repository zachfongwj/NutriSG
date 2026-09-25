import { MCPHandler } from '../client';
import { JsonRpcRequest, JsonRpcResponse, MCPToolDefinition } from '../types';
import { GarminActivityRaw } from '../../types/activity';

export class GarminMcpServer implements MCPHandler {
  private isConfigured = true; // Enabled for simulation / test sync
  private tools: MCPToolDefinition[] = [
    {
      name: 'garmin_get_daily_activity',
      description: 'Retrieve daily activity summary from Garmin Connect for a specific date (steps, active calories, distance).',
      inputSchema: {
        type: 'object',
        properties: {
          date: { type: 'string', description: 'ISO date string (YYYY-MM-DD)' }
        }
      }
    },
    {
      name: 'garmin_get_activities',
      description: 'Retrieve recently logged workouts and activities from Garmin Connect device sync.',
      inputSchema: {
        type: 'object',
        properties: {
          limit: { type: 'number', description: 'Max number of activities to return (default: 3)' }
        }
      }
    },
    {
      name: 'garmin_get_workout',
      description: 'Retrieve structured details of a planned or completed Garmin workout.',
      inputSchema: {
        type: 'object',
        properties: {
          workoutId: { type: 'string', description: 'Garmin Workout identifier' }
        },
        required: ['workoutId']
      }
    },
    {
      name: 'garmin_get_activity_metrics',
      description: 'Retrieve heart rate zones, cadence, and estimated calorie burn metrics for an activity.',
      inputSchema: {
        type: 'object',
        properties: {
          activityId: { type: 'string', description: 'Garmin Activity ID' }
        },
        required: ['activityId']
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
            name: 'garmin-connect-mcp',
            version: '0.9.4'
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
        result: { tools: this.tools }
      };
    }

    if (req.method === 'tools/call') {
      const toolName = (req.params as any)?.name;
      const args = (req.params as any)?.arguments || {};

      switch (toolName) {
        case 'garmin_get_daily_activity': {
          const today = new Date().toISOString().split('T')[0];
          return {
            jsonrpc: '2.0',
            id: req.id,
            result: {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  date: args.date || today,
                  totalSteps: 8420,
                  stepGoal: 10000,
                  activeCalories: 485,
                  restingCalories: 1620,
                  floorsClimbed: 12,
                  moderateIntensityMinutes: 35,
                  vigorousIntensityMinutes: 25,
                  source: 'Garmin Connect MCP'
                }, null, 2)
              }]
            }
          };
        }

        case 'garmin_get_activities': {
          const sampleActivities: GarminActivityRaw[] = [
            {
              activityId: 'garmin_act_9812',
              activityType: 'Running',
              startTime: '18:30',
              durationMinutes: 60,
              intensity: 'moderate',
              estimatedCaloriesBurned: 580,
              averageHeartRate: 148,
              source: 'Garmin'
            },
            {
              activityId: 'garmin_act_9744',
              activityType: 'Cycling (Commute)',
              startTime: '08:15',
              durationMinutes: 30,
              intensity: 'low',
              estimatedCaloriesBurned: 180,
              averageHeartRate: 118,
              source: 'Garmin'
            }
          ];

          return {
            jsonrpc: '2.0',
            id: req.id,
            result: {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  totalFound: sampleActivities.length,
                  activities: sampleActivities
                }, null, 2)
              }]
            }
          };
        }

        case 'garmin_get_workout':
        case 'garmin_get_activity_metrics': {
          return {
            jsonrpc: '2.0',
            id: req.id,
            result: {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  activityId: args.activityId || args.workoutId || 'garmin_act_9812',
                  activityType: 'Running',
                  durationMinutes: 60,
                  intensity: 'moderate',
                  avgHeartRateBpm: 148,
                  maxHeartRateBpm: 168,
                  aerobicTrainingEffect: 3.4,
                  estimatedCaloriesBurned: 580,
                  estimatedCaloriesBurnedNote: 'Estimated by Garmin Firstbeat algorithm; not a direct physiological measurement.',
                  source: 'Garmin'
                }, null, 2)
              }]
            }
          };
        }

        default:
          return {
            jsonrpc: '2.0',
            id: req.id,
            error: { code: -32601, message: `Tool not found: ${toolName}` }
          };
      }
    }

    return {
      jsonrpc: '2.0',
      id: req.id,
      error: { code: -32601, message: `Method not found: ${req.method}` }
    };
  }
}
