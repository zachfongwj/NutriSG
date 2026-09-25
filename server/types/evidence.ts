export interface PubMedArticle {
  pmid: string;
  title: string;
  authors: string[];
  journal: string;
  publicationDate: string;
  abstract: string;
  publicationType: string[];
  url: string;
  source: 'PubMed';
  keyFinding?: string;
  relevanceTopic?: string;
}

export interface EvidenceContext {
  evidenceQuery: string;
  topic: string;
  articles: PubMedArticle[];
  authoritativeGuidelineReference?: string;
  evidenceStrength: 'guideline' | 'systematic_review' | 'observational_study';
}
