import { MCPClient } from './client';
import { PubMedArticle, EvidenceContext } from '../types/evidence';
import { MCPCallLog } from '../types/orchestration';

export class PubMedEvidenceMCPClient {
  private mcpClient: MCPClient;

  constructor(client: MCPClient) {
    this.mcpClient = client;
  }

  private findTool(candidates: string[]): string | undefined {
    const discovered = this.mcpClient.getDiscoveredTools().map(t => t.name);
    return candidates.find(c => discovered.includes(c));
  }

  /**
   * Search PubMed peer-reviewed literature using privacy-preserving query keywords
   */
  public async searchPubMed(
    query: string,
    limit = 3
  ): Promise<{ articles: PubMedArticle[]; log?: MCPCallLog; error?: string }> {
    const searchTool = this.findTool(['search_pubmed', 'pubmed_search', 'query_pubmed']) || 'search_pubmed';

    const invokeRes = await this.mcpClient.invokeTool<any>(searchTool, {
      query,
      limit
    });

    if (!invokeRes.success || !invokeRes.result) {
      return { articles: [], log: invokeRes.log, error: invokeRes.error || 'Failed to search PubMed' };
    }

    const rawList = invokeRes.result.articles || [];
    const normalized: PubMedArticle[] = rawList.map((a: any) => this.normalizeArticle(a));

    return { articles: normalized, log: invokeRes.log };
  }

  /**
   * Retrieve article abstract by PMID
   */
  public async getArticle(
    pmid: string
  ): Promise<{ article?: PubMedArticle; log?: MCPCallLog; error?: string }> {
    const getTool = this.findTool(['get_article_abstract', 'get_article_summary', 'pubmed_get_article']) || 'get_article_abstract';

    const invokeRes = await this.mcpClient.invokeTool<any>(getTool, { pmid });
    if (!invokeRes.success || !invokeRes.result) {
      return { log: invokeRes.log, error: invokeRes.error };
    }

    return { article: this.normalizeArticle(invokeRes.result), log: invokeRes.log };
  }

  private normalizeArticle(raw: any): PubMedArticle {
    const pmid = String(raw.pmid || raw.id || '');
    return {
      pmid,
      title: raw.title || 'Biomedical Investigation',
      authors: Array.isArray(raw.authors) ? raw.authors : [],
      journal: raw.journal || raw.source || 'Medical Journal',
      publicationDate: raw.publicationDate || raw.pubdate || '',
      abstract: raw.abstract || '',
      publicationType: Array.isArray(raw.publicationType) ? raw.publicationType : ['Journal Article'],
      url: raw.url || `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      source: 'PubMed',
      keyFinding: raw.keyFinding,
      relevanceTopic: raw.relevanceTopic
    };
  }
}
