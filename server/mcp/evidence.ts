import { MCPClient } from './client';
import { PubMedArticle } from '../types/evidence';
import { MCPCallLog } from '../types/orchestration';
export class PubMedEvidenceMCPClient {
  constructor(private readonly mcpClient: MCPClient) {}
  async searchPubMed(query: string, limit = 3): Promise<{ articles: PubMedArticle[]; log?: MCPCallLog; error?: string }> {
    const tool = this.mcpClient.getDiscoveredTools().map(t => t.name).find(name => /pubmed|search.*(article|literature)|literature.*search/i.test(name));
    if (!tool) return { articles: [], error: 'PubMed MCP has no discovered search tool' };
    const result = await this.mcpClient.invokeTool<any>(tool, { query, limit });
    if (!result.success) return { articles: [], log: result.log, error: result.error };
    const raw = Array.isArray(result.result) ? result.result : result.result?.articles || result.result?.results || result.result?.data || [];
    return { articles: raw.map((article: any) => this.normalize(article)).filter(article => article.pmid), log: result.log };
  }
  async getArticle(pmid: string) { const tool = this.mcpClient.getDiscoveredTools().map(t => t.name).find(name => /pubmed|get.*(article|abstract)|abstract/i.test(name)); if (!tool) return { error: 'PubMed MCP has no discovered article tool' }; const result = await this.mcpClient.invokeTool<any>(tool, { pmid }); return result.success ? { article: this.normalize(result.result), log: result.log } : { log: result.log, error: result.error }; }
  private normalize(raw: any): PubMedArticle { const pmid = String(raw?.pmid || raw?.PMID || raw?.id || ''); return { pmid, title: String(raw?.title || ''), authors: Array.isArray(raw?.authors) ? raw.authors.map((a: any) => typeof a === 'string' ? a : a.name).filter(Boolean) : [], journal: String(raw?.journal || raw?.source || ''), publicationDate: String(raw?.publicationDate || raw?.pubdate || raw?.publication_date || ''), abstract: String(raw?.abstract || ''), publicationType: Array.isArray(raw?.publicationType) ? raw.publicationType : Array.isArray(raw?.publication_type) ? raw.publication_type : [], url: raw?.url || `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`, source: 'PubMed', keyFinding: raw?.keyFinding, relevanceTopic: raw?.relevanceTopic }; }
}
