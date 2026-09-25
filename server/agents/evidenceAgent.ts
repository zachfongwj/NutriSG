import { UserProfile } from '../types/profile';
import { ActivityContext } from '../types/activity';
import { EvidenceContext } from '../types/evidence';
import { PubMedEvidenceMCPClient } from '../mcp/evidence';
import { MCPCallLog } from '../types/orchestration';

export class EvidenceAgent {
  private pubmedClient: PubMedEvidenceMCPClient;

  constructor(pubmedClient: PubMedEvidenceMCPClient) {
    this.pubmedClient = pubmedClient;
  }

  /**
   * Evaluates whether medical/scientific literature retrieval is required
   * and crafts a minimal, privacy-preserving search query.
   */
  public async retrieveEvidence(
    profile: UserProfile,
    activityContext: ActivityContext
  ): Promise<{ contexts: EvidenceContext[]; logs: MCPCallLog[] }> {
    const logs: MCPCallLog[] = [];
    const contexts: EvidenceContext[] = [];

    // Formulate privacy-preserving queries based on condition or activity
    const queriesToRun: Array<{ query: string; topic: string; strength: 'guideline' | 'systematic_review' | 'observational_study' }> = [];

    if (profile.healthConditions.includes('hypertension')) {
      queriesToRun.push({
        query: 'hypertension dietary sodium potassium DASH',
        topic: 'Hypertension and Dietary Sodium Management',
        strength: 'systematic_review'
      });
    }

    if (profile.healthConditions.includes('type_2_diabetes')) {
      queriesToRun.push({
        query: 'type 2 diabetes glycemic index dietary fiber postprandial',
        topic: 'Type 2 Diabetes Glycemic Control & High-Fiber Diets',
        strength: 'guideline'
      });
    }

    if (profile.healthConditions.includes('high_cholesterol')) {
      queriesToRun.push({
        query: 'soluble fiber LDL cholesterol cardiovascular dietary',
        topic: 'Lipid Management via Soluble Dietary Fiber',
        strength: 'systematic_review'
      });
    }

    if (profile.healthConditions.includes('chronic_kidney_disease')) {
      queriesToRun.push({
        query: 'chronic kidney disease dietary protein restriction',
        topic: 'Renal Function and Controlled Protein Intake',
        strength: 'systematic_review'
      });
    }

    if (profile.healthConditions.includes('fatty_liver')) {
      queriesToRun.push({
        query: 'fatty liver NAFLD Mediterranean diet fructose hepatic steatosis',
        topic: 'Non-Alcoholic Fatty Liver Disease (NAFLD) & Dietary Fructose Restriction',
        strength: 'systematic_review'
      });
    }

    if (
      profile.healthConditions.includes('metabolic_syndrome') ||
      profile.healthConditions.includes('insulin_resistance') ||
      profile.healthConditions.includes('prediabetes') ||
      profile.healthConditions.includes('hypertriglyceridemia')
    ) {
      queriesToRun.push({
        query: 'metabolic syndrome hypertriglyceridemia insulin resistance dietary fiber legumes',
        topic: 'Metabolic Syndrome, Insulin Sensitivity & Triglyceride Reduction',
        strength: 'guideline'
      });
    }

    // Custom health conditions (open entry) - strip personal identifiers and generate clinical query
    if (profile.customHealthConditions && profile.customHealthConditions.length > 0) {
      for (const custom of profile.customHealthConditions) {
        const clean = custom.replace(/[^a-zA-Z0-9\s]/g, '').trim();
        if (clean.length > 2) {
          queriesToRun.push({
            query: `${clean} dietary clinical nutrition evidence`,
            topic: `Clinical Nutrition Considerations: ${clean}`,
            strength: 'systematic_review'
          });
        }
      }
    }

    // If no clinical condition but active endurance exercise
    if (queriesToRun.length === 0 && activityContext.durationMinutes >= 45) {
      queriesToRun.push({
        query: 'carbohydrate protein timing endurance exercise ACSM',
        topic: 'Nutrient Timing for Endurance Exercise Performance & Recovery',
        strength: 'guideline'
      });
    }

    // If general wellness without specific queries, do not call PubMed unnecessarily!
    // As per instruction: "Do NOT call every MCP for every request. Only invoke tools that are relevant."
    if (queriesToRun.length === 0) {
      return { contexts: [], logs: [] };
    }

    // Execute queries through PubMed MCP
    for (const q of queriesToRun) {
      const res = await this.pubmedClient.searchPubMed(q.query, 2);
      if (res.log) logs.push(res.log);

      if (res.articles.length > 0) {
        contexts.push({
          evidenceQuery: q.query,
          topic: q.topic,
          articles: res.articles,
          evidenceStrength: q.strength,
          authoritativeGuidelineReference: res.articles[0].journal
        });
      }
    }

    return { contexts, logs };
  }
}
