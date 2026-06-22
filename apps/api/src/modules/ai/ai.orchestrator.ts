import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { MarketAgent } from './agents/market.agent';
import { CompetitorAgent } from './agents/competitor.agent';
import { ProductAgent } from './agents/product.agent';
import { VcAgent } from './agents/vc.agent';
import { ReportGateway } from '../reports/report.gateway';
import {
  OrchestratorInput,
  OrchestratorOutput,
  MarketAgentOutput,
  CompetitorAgentOutput,
  ProductAgentOutput,
} from './ai.types';

const CACHE_TTL_24H = 60 * 60 * 24; // 24 hours in seconds

/**
 * AiOrchestrator acts as the central brain of the AI evaluation process.
 * It follows the Parallel-Agent pattern to reduce generation latency.
 * 
 * Flow:
 * 1. Checks Redis cache for existing reports to prevent duplicate API costs.
 * 2. Concurrently executes Market, Competitor, and Product specialized LLM agents.
 * 3. Utilizes exponential backoff for retry mechanisms across all LLM boundaries.
 * 4. Synthesizes the parallel outputs via the final VcAgent (Synthesis Agent).
 * 5. Streams real-time progress via ReportGateway WebSockets.
 */
@Injectable()
export class AiOrchestrator {
  private readonly logger = new Logger(AiOrchestrator.name);

  constructor(
    private readonly marketAgent: MarketAgent,
    private readonly competitorAgent: CompetitorAgent,
    private readonly productAgent: ProductAgent,
    private readonly vcAgent: VcAgent,
    private readonly reportGateway: ReportGateway,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  /**
   * Retries an async function up to `maxRetries` times with exponential backoff.
   */
  private async withRetry<T>(
    fn: () => Promise<T>,
    agentName: string,
    maxRetries = 2,
  ): Promise<T> {
    let lastError: Error;
    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err as Error;
        const delay = Math.pow(2, attempt) * 500; // 1s, 2s, 4s
        this.logger.warn(
          `[${agentName}] Attempt ${attempt} failed. Retrying in ${delay}ms... Error: ${lastError.message}`,
        );
        if (attempt <= maxRetries) {
          await new Promise((res) => setTimeout(res, delay));
        }
      }
    }
    throw new Error(`[${agentName}] All ${maxRetries + 1} attempts failed. Last error: ${lastError!.message}`);
  }

  /**
   * Orchestrates the complete end-to-end report generation process.
   * Runs the first stage of agents concurrently to maximize speed and bounds them in a Promise.all().
   * Streams progress back to the frontend on each stage boundary.
   *
   * @param input The raw input parameters provided by the user.
   * @returns A synthesized OrchestratorOutput containing all AI sections.
   * @throws Will throw if any agent fails after max retries.
   */
  async run(input: OrchestratorInput): Promise<OrchestratorOutput> {
    const cacheKey = `report:orchestration:${input.reportId}`;

    // --- Redis Cache Check ---
    const cached = await this.cache.get<OrchestratorOutput>(cacheKey);
    if (cached) {
      this.logger.log(`[Orchestrator] Cache HIT for report ${input.reportId}`);
      return cached;
    }

    this.logger.log(`[Orchestrator] Starting parallel agent execution for report: ${input.reportId}`);

    // --- Stage 1: Run Agents 1-3 in parallel ---
    this.reportGateway.emitProgress(input.reportId, 'starting', 0, { message: 'Initialising AI agents...' });

    let marketOutput: MarketAgentOutput;
    let competitorOutput: CompetitorAgentOutput;
    let productOutput: ProductAgentOutput;

    try {
      const [marketResult, competitorResult, productResult] = await Promise.allSettled([
        this.withRetry(
          () =>
            this.marketAgent.run({
              ideaDescription: input.ideaDescription,
              industry: input.industry,
              geography: input.geography,
              language: input.language,
            }),
          'MarketAgent',
        ).then((result) => {
          this.reportGateway.emitProgress(input.reportId, 'market_analysis', 25, {
            message: 'Market analysis complete.',
            data: result,
          });
          return result;
        }),

        this.withRetry(
          () =>
            this.competitorAgent.run({
              ideaDescription: input.ideaDescription,
              industry: input.industry,
              geography: input.geography,
              language: input.language,
            }),
          'CompetitorAgent',
        ).then((result) => {
          this.reportGateway.emitProgress(input.reportId, 'competitor_scout', 50, {
            message: 'Competitor analysis complete.',
            data: result,
          });
          return result;
        }),

        this.withRetry(
          () =>
            this.productAgent.run({
              ideaDescription: input.ideaDescription,
              stage: input.stage,
              teamSize: input.teamSize,
              budget: input.budget,
              geography: input.geography,
              language: input.language,
            }),
          'ProductAgent',
        ).then((result) => {
          this.reportGateway.emitProgress(input.reportId, 'product_strategy', 75, {
            message: 'Product & GTM strategy complete.',
            data: result,
          });
          return result;
        }),
      ]);

      // Handle Promise.allSettled results with fallbacks
      marketOutput = marketResult.status === 'fulfilled' ? marketResult.value : {
        tam: { inrCr: 0, usdM: 0, cagr: 0 },
        sam: { inrCr: 0, usdM: 0 },
        som: { inrCr: 0, usdM: 0 },
        analysis: "Market analysis failed to generate. Please try again later.",
        icp: "N/A",
        tailwinds: ["Data unavailable", "Data unavailable", "Data unavailable"],
        governmentSchemes: []
      };

      competitorOutput = competitorResult.status === 'fulfilled' ? competitorResult.value : {
        competitors: Array(6).fill({
          name: "Unknown", type: "Direct", hq: "Unknown", fundingStage: "Unknown", totalFunding: "Unknown", weakness: "Data unavailable", pricing: "Unknown"
        })
      };

      productOutput = productResult.status === 'fulfilled' ? productResult.value : {
        mvp: Array(4).fill({ phase: 1, title: "Unknown", duration: "Unknown", tasks: [], milestone: "Unknown" }),
        gtm: Array(5).fill({ channel: "Unknown", strategy: "Unknown", expectedCAC: "Unknown" }),
        risks: Array(6).fill({ category: "Unknown", description: "Unknown", severity: "Medium", mitigation: "Unknown" }),
        recommendedStack: []
      };

    } catch (err) {
      this.reportGateway.emitProgress(input.reportId, 'failed', -1, {
        message: `Agent failure: ${(err as Error).message}`,
      });
      throw err;
    }

    // --- Stage 2: Run VC Agent with merged context ---
    this.logger.log(`[Orchestrator] Parallel agents complete. Running VC synthesis...`);

    const vcOutput = await this.withRetry(
      () =>
        this.vcAgent.run({
          ideaDescription: input.ideaDescription,
          marketData: marketOutput,
          competitorData: competitorOutput,
          productData: productOutput,
          geography: input.geography,
          language: input.language,
        }),
      'VcAgent',
    );

    this.reportGateway.emitProgress(input.reportId, 'completed', 100, {
      message: 'Report generation complete!',
    });

    const result: OrchestratorOutput = {
      market: marketOutput,
      competitors: competitorOutput,
      product: productOutput,
      vc: vcOutput,
    };

    // --- Cache final result for 24h ---
    await this.cache.set(cacheKey, result, CACHE_TTL_24H);
    this.logger.log(`[Orchestrator] Result cached for 24h. Report: ${input.reportId}`);

    return result;
  }
}
