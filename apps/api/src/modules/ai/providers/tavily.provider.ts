import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SearchProvider, SearchResult } from './ai-provider.interface';

/**
 * TavilyProvider — Real-time web search integration for VentureForge AI.
 *
 * Used to ground LLM outputs in real, current data. Prevents hallucination
 * of competitor names, regulations, market stats, and government schemes.
 *
 * Usage Rules:
 * - Competitor research → real companies, real funding data
 * - Compliance/Registration → real government portals, real requirements
 * - Market analysis → real statistics, real trends
 * - Never let Gemini invent real-time facts when Tavily is available
 */
@Injectable()
export class TavilyProvider implements SearchProvider {
  private readonly logger = new Logger(TavilyProvider.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.tavily.com';

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.get<string>('TAVILY_API_KEY') || '';
    if (!this.apiKey) {
      this.logger.warn('[TavilyProvider] TAVILY_API_KEY not configured — search will be disabled');
    } else {
      this.logger.log('[TavilyProvider] Initialized with Tavily Search API');
    }
  }

  /**
   * Generic search — query Tavily for any topic.
   */
  async search(
    query: string,
    options?: { maxResults?: number; searchDepth?: 'basic' | 'advanced'; topic?: 'general' | 'news' },
  ): Promise<SearchResult[]> {
    if (!this.apiKey) {
      this.logger.warn('[TavilyProvider] Search skipped — no API key');
      return [];
    }

    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: this.apiKey,
          query,
          max_results: options?.maxResults || 5,
          search_depth: options?.searchDepth || 'basic',
          topic: options?.topic || 'general',
          include_answer: false,
          include_raw_content: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Tavily API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();

      const results: SearchResult[] = (data.results || []).map((r: any) => ({
        title: r.title || '',
        url: r.url || '',
        content: r.content || '',
        score: r.score || 0,
        publishedDate: r.published_date,
      }));

      this.logger.debug(`[TavilyProvider] "${query}" → ${results.length} results`);
      return results;
    } catch (err) {
      this.logger.error(`[TavilyProvider] Search failed for "${query}": ${(err as Error).message}`);
      return [];
    }
  }

  // ─── Domain-Specific Search Helpers ───────────────────────────

  /**
   * Search for real competitors in a given industry and geography.
   */
  async searchCompetitors(industry: string, geography: string): Promise<SearchResult[]> {
    const query = `top companies startups in ${industry} industry ${geography} 2025 2026 funding revenue`;
    return this.search(query, { maxResults: 8, searchDepth: 'advanced' });
  }

  /**
   * Search for government regulations and business registration requirements.
   */
  async searchRegulations(country: string, businessType: string, industry: string): Promise<SearchResult[]> {
    const query = `${businessType} business registration requirements licenses ${industry} ${country} 2025 2026`;
    return this.search(query, { maxResults: 6, searchDepth: 'advanced' });
  }

  /**
   * Search for current market data, statistics, and trends.
   */
  async searchMarketData(industry: string, geography: string): Promise<SearchResult[]> {
    const query = `${industry} market size growth rate statistics ${geography} 2025 2026 TAM`;
    return this.search(query, { maxResults: 6, searchDepth: 'advanced' });
  }

  /**
   * Search for latest industry trends and news.
   */
  async searchTrends(industry: string): Promise<SearchResult[]> {
    const query = `${industry} industry trends innovation latest developments 2025 2026`;
    return this.search(query, { maxResults: 5, topic: 'news' });
  }

  /**
   * Search for tax and compliance information for a specific country.
   */
  async searchTaxInfo(country: string, businessType: string): Promise<SearchResult[]> {
    const query = `${businessType} business tax obligations compliance requirements ${country} 2025 2026`;
    return this.search(query, { maxResults: 5, searchDepth: 'advanced' });
  }

  /**
   * Search for government schemes and subsidies.
   */
  async searchGovernmentSchemes(country: string, industry: string): Promise<SearchResult[]> {
    const query = `government schemes subsidies grants for ${industry} business ${country} 2025 2026`;
    return this.search(query, { maxResults: 5, searchDepth: 'advanced' });
  }

  /**
   * Format search results into a string suitable for LLM prompt injection.
   */
  formatForPrompt(results: SearchResult[], label: string): string {
    if (!results.length) return '';

    const formatted = results
      .map((r, i) => `[${i + 1}] "${r.title}" (${r.url})\n${r.content}`)
      .join('\n\n');

    return `\n## ${label} (Live Search Results — sourced from Tavily)\n${formatted}\n`;
  }
}
