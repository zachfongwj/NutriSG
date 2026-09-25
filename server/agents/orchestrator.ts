import { UserProfile } from '../types/profile';
import { RecommendationResponse, MealRecommendation } from '../types/recommendation';
import { OrchestrationTrace, WorkflowStep, MCPCallLog } from '../types/orchestration';
import { ActivityAnalysisService } from '../services/activityAnalysis';
import { DeterministicCalculationsService } from '../services/calculations';
import { ConstraintEngineService } from '../services/constraintEngine';
import { EvidenceAgent } from './evidenceAgent';
import { MealPlanningAgent } from './mealPlanning';
import { SafetyValidationService } from '../services/validation';
import { RecommendationFormatterService } from '../services/recommendation';
import { MCPRegistry } from '../mcp/registry';
import { SingaporeFoodProvider } from '../providers/food/singaporeFoodProvider';
import { USDAFoodProvider } from '../providers/food/usdaFoodProvider';
import { USDANutritionMCPClient } from '../mcp/nutrition';
import { PubMedEvidenceMCPClient } from '../mcp/evidence';
import { GarminFitnessMCPClient } from '../mcp/fitness';
import { GarminActivityProvider } from '../providers/activity/garminProvider';
import { ManualActivityProvider } from '../providers/activity/manualActivityProvider';

export class CentralOrchestrator {
  private activityService: ActivityAnalysisService;
  private evidenceAgent: EvidenceAgent;
  private mealPlanningAgent: MealPlanningAgent;
  private singaporeProvider: SingaporeFoodProvider;
  private usdaProvider: USDAFoodProvider;

  constructor() {
    const registry = MCPRegistry.getInstance();

    const usdaClient = new USDANutritionMCPClient(registry.getUsdaClient());
    const pubmedClient = new PubMedEvidenceMCPClient(registry.getPubmedClient());
    const garminClient = new GarminFitnessMCPClient(registry.getGarminClient());

    this.singaporeProvider = new SingaporeFoodProvider();
    this.usdaProvider = new USDAFoodProvider(usdaClient);

    const garminProvider = new GarminActivityProvider(garminClient);
    const manualProvider = new ManualActivityProvider();
    this.activityService = new ActivityAnalysisService(garminProvider, manualProvider);

    this.evidenceAgent = new EvidenceAgent(pubmedClient);
    this.mealPlanningAgent = new MealPlanningAgent(this.singaporeProvider, this.usdaProvider);
  }

  /**
   * Execute the end-to-end orchestration workflow
   */
  public async orchestrate(
    profile: UserProfile
  ): Promise<{ response: RecommendationResponse; trace: OrchestrationTrace }> {
    const startTimeTotal = Date.now();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const steps: WorkflowStep[] = [];
    const allMcpLogs: MCPCallLog[] = [];

    // STEP 1: Parse and validate input request
    const step1Start = Date.now();
    const queryNotice = profile.queryText ? ` Query: "${profile.queryText}".` : '';
    const allConditions = [
      ...profile.healthConditions,
      ...(profile.customHealthConditions || []).map(c => `[Custom: ${c}]`)
    ];
    const parsedSummary = `Parsed request for ${profile.mealType || 'lunch'}.${queryNotice} Health conditions: ${allConditions.join(', ') || 'None'}. Allergies: ${profile.allergies.join(', ') || 'None'}.`;
    steps.push({
      stepId: 'step_1_orchestrator',
      name: 'User Request & Profile Parsing',
      component: 'Orchestrator',
      status: 'completed',
      inputSummary: `Meal: ${profile.mealType}, Goal: ${profile.goal}${profile.queryText ? `, Query: "${profile.queryText}"` : ''}`,
      outputSummary: parsedSummary,
      durationMs: Date.now() - step1Start
    });

    // STEP 2: Activity Analysis (Garmin MCP or Manual)
    const step2Start = Date.now();
    const hasActivity = profile.activityMode === 'garmin' || (profile.manualActivity && profile.manualActivity.durationMinutes > 0);
    const { context: activityContext, log: activityLog } = await this.activityService.analyze(profile);
    if (activityLog) allMcpLogs.push(activityLog);

    steps.push({
      stepId: 'step_2_activity',
      name: 'Activity Analysis',
      component: 'Activity Analysis',
      status: 'completed',
      mcpServerCalled: activityContext.source === 'Garmin' ? 'Garmin Connect MCP' : undefined,
      toolName: activityContext.source === 'Garmin' ? 'garmin_get_activities' : 'manual_activity_normalization',
      inputSummary: `Activity mode: ${profile.activityMode}, Timing: ${activityContext.startTime}`,
      outputSummary: `${activityContext.activity} (${activityContext.durationMinutes}m) -> ${activityContext.mealTimingContext}, ~${activityContext.estimatedCaloriesBurned} kcal.`,
      durationMs: Date.now() - step2Start
    });

    // STEP 3: Evidence Agent (PubMed MCP - Selective Querying)
    const step3Start = Date.now();
    const shouldQueryEvidence = profile.healthConditions.length > 0 || activityContext.durationMinutes >= 45;
    let evidenceContexts: any[] = [];

    if (shouldQueryEvidence) {
      const { contexts, logs: evidenceLogs } = await this.evidenceAgent.retrieveEvidence(profile, activityContext);
      evidenceContexts = contexts;
      allMcpLogs.push(...evidenceLogs);

      steps.push({
        stepId: 'step_3_evidence',
        name: 'Evidence Retrieval',
        component: 'Evidence Agent',
        status: 'completed',
        mcpServerCalled: 'PubMed MCP',
        toolName: 'search_pubmed',
        inputSummary: `Privacy-preserving search for: ${profile.healthConditions.join(', ') || 'Endurance nutrition'}`,
        outputSummary: `Retrieved ${evidenceContexts.reduce((acc, c) => acc + c.articles.length, 0)} peer-reviewed citations.`,
        durationMs: Date.now() - step3Start
      });
    } else {
      steps.push({
        stepId: 'step_3_evidence',
        name: 'Evidence Retrieval',
        component: 'Evidence Agent',
        status: 'skipped',
        inputSummary: 'General healthy eating without chronic conditions',
        outputSummary: 'PubMed query bypassed to prevent unnecessary external tool calls.',
        durationMs: Date.now() - step3Start
      });
    }

    // STEP 4: Deterministic Calculations
    const step4Start = Date.now();
    const calculatedMetrics = DeterministicCalculationsService.calculateEnergyMetrics(profile, activityContext);

    steps.push({
      stepId: 'step_4_calculations',
      name: 'Deterministic Energy Calculations',
      component: 'Constraint Engine',
      status: 'completed',
      inputSummary: `Weight: ${profile.weightKg || 68}kg, Activity: ${activityContext.estimatedCaloriesBurned} kcal`,
      outputSummary: `BMR: ${calculatedMetrics.bmrKcal} kcal, TEE: ${calculatedMetrics.teeKcal} kcal, Target meal: ~${calculatedMetrics.mealTargetKcal} kcal.`,
      durationMs: Date.now() - step4Start
    });

    // STEP 5: Requirements & Constraint Engine
    const step5Start = Date.now();
    const recommendationContext = ConstraintEngineService.buildContext({
      profile,
      activityContext,
      nutritionTargets: calculatedMetrics,
      evidence: evidenceContexts
    });

    steps.push({
      stepId: 'step_5_constraints',
      name: 'Recommendation Context Assembly',
      component: 'Constraint Engine',
      status: 'completed',
      inputSummary: `${recommendationContext.hardConstraints.allergies.length} allergies, ${recommendationContext.healthConsiderations.length} health considerations`,
      outputSummary: 'RecommendationContext successfully assembled with hard vs soft constraints separated.',
      durationMs: Date.now() - step5Start
    });

    // STEP 6: Meal Planning Agent & Food Data Layer (Singapore Food Provider -> USDA MCP Fallback)
    const step6Start = Date.now();
    const { candidates, logs: foodLogs } = await this.mealPlanningAgent.planCandidateMeals(recommendationContext);
    allMcpLogs.push(...foodLogs);

    steps.push({
      stepId: 'step_6_food_data',
      name: 'Food Data Retrieval (SG FoodID / USDA MCP)',
      component: 'Food Data Layer',
      status: 'completed',
      mcpServerCalled: candidates.some(c => c.source === 'USDA FoodData Central') ? 'USDA FoodData Central MCP' : 'SG FoodID Provider',
      toolName: 'usda_search_foods / singapore_food_search',
      inputSummary: `Searched Singapore food references first; USDA MCP fallback as needed.`,
      outputSummary: `Retrieved ${candidates.length} candidate meal options with real nutrition data.`,
      durationMs: Date.now() - step6Start
    });

    // STEP 7: Validation / Safety Layer
    const step7Start = Date.now();
    const validatedRecommendations: MealRecommendation[] = [];
    let eliminatedCount = 0;

    for (const food of candidates) {
      const validation = SafetyValidationService.validateCandidate(food, recommendationContext);
      if (validation.isValid) {
        const mealRec = RecommendationFormatterService.buildMealRecommendation(
          food,
          recommendationContext,
          validation
        );
        validatedRecommendations.push(mealRec);
      } else {
        eliminatedCount++;
      }
    }

    steps.push({
      stepId: 'step_7_validation',
      name: 'Validation & Safety Layer',
      component: 'Validation Safety Layer',
      status: 'completed',
      inputSummary: `Evaluated ${candidates.length} candidates against allergies, sodium thresholds, and diets`,
      outputSummary: `Approved ${validatedRecommendations.length} safe meals. Eliminated ${eliminatedCount} invalid candidates.`,
      durationMs: Date.now() - step7Start
    });

    // STEP 8: Recommendation Finalization (3 to 5 options)
    const finalRecs = validatedRecommendations.slice(0, 5);

    const totalDurationMs = Date.now() - startTimeTotal;
    const trace: OrchestrationTrace = {
      requestId,
      startTime: new Date(startTimeTotal).toISOString(),
      totalDurationMs,
      steps,
      mcpCalls: allMcpLogs
    };

    const response: RecommendationResponse = {
      recommendations: finalRecs,
      context: recommendationContext,
      calculatedMetrics,
      disclaimer: 'NutriSG provides nutrition and wellness decision-support information based on peer-reviewed evidence and reference food composition data. It does NOT diagnose medical conditions, prescribe clinical treatment, or substitute for personalized advice from a registered doctor, dietitian, or qualified healthcare professional.',
      timestamp: new Date().toISOString()
    };

    return { response, trace };
  }
}
