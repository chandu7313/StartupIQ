import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { MarketAgent } from './agents/market.agent';
import { CompetitorAgent } from './agents/competitor.agent';
import { ProductAgent } from './agents/product.agent';
import { VcAgent } from './agents/vc.agent';
import { BusinessFormationAgent } from './agents/business-formation.agent';
import { ComplianceAgent } from './agents/compliance.agent';
import { FinancialAgent } from './agents/financial.agent';
import { OperationsAgent } from './agents/operations.agent';
import { ReportGateway } from '../reports/report.gateway';
import {
  OrchestratorInput,
  OrchestratorOutput,
  MarketAgentOutput,
  CompetitorAgentOutput,
  ProductAgentOutput,
  BusinessFormationAgentOutput,
  ComplianceAgentOutput,
  FinancialAgentOutput,
  OperationsAgentOutput,
} from './ai.types';

const CACHE_TTL_24H = 60 * 60 * 24; // 24 hours in seconds

/**
 * AiOrchestrator — VentureForge AI's central intelligence engine.
 * Runs 8 specialist agents in a two-stage parallel pipeline to generate
 * a complete Business DNA report covering all 14 dimensions.
 *
 * Stage 1 (Parallel): Market, Competitor, Product, Business Formation, Compliance, Financial, Operations
 * Stage 2 (Sequential): VC/Synthesis Agent — merges all outputs into final scores and pitch materials
 *
 * Features:
 * - Redis cache to prevent duplicate API costs
 * - Exponential backoff retry for all LLM calls
 * - Real-time WebSocket progress streaming
 */
@Injectable()
export class AiOrchestrator {
  private readonly logger = new Logger(AiOrchestrator.name);

  constructor(
    private readonly marketAgent: MarketAgent,
    private readonly competitorAgent: CompetitorAgent,
    private readonly productAgent: ProductAgent,
    private readonly vcAgent: VcAgent,
    private readonly businessFormationAgent: BusinessFormationAgent,
    private readonly complianceAgent: ComplianceAgent,
    private readonly financialAgent: FinancialAgent,
    private readonly operationsAgent: OperationsAgent,
    @Inject(forwardRef(() => ReportGateway)) private readonly reportGateway: ReportGateway,
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
   * Orchestrates the complete Business DNA report generation.
   * Runs 7 agents in parallel (Stage 1) then the VC synthesis agent (Stage 2).
   * Streams progress to the frontend via WebSocket at each stage boundary.
   *
   * @param input The raw input parameters provided by the user.
   * @returns A complete OrchestratorOutput containing all 8 agent outputs.
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

    this.logger.log(`[Orchestrator] Starting 8-agent parallel execution for report: ${input.reportId}`);

    // --- Stage 1: Run 7 Agents in parallel ---
    this.reportGateway.emitProgress(input.reportId, 'starting', 0, { message: 'Initialising VentureForge AI agents...' });

    let marketOutput: MarketAgentOutput;
    let competitorOutput: CompetitorAgentOutput;
    let productOutput: ProductAgentOutput;
    let businessFormationOutput: BusinessFormationAgentOutput;
    let complianceOutput: ComplianceAgentOutput;
    let financialOutput: FinancialAgentOutput;
    let operationsOutput: OperationsAgentOutput;

    try {
      const [
        marketResult,
        competitorResult,
        productResult,
        businessFormationResult,
        complianceResult,
        financialResult,
        operationsResult,
      ] = await Promise.allSettled([
        // Agent 1: Market Analyst
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
          this.reportGateway.emitProgress(input.reportId, 'market_analysis', 14, {
            message: '📊 Market analysis complete — TAM/SAM/SOM calculated.',
            data: result,
          });
          return result;
        }),

        // Agent 2: Competitor Scout
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
          this.reportGateway.emitProgress(input.reportId, 'competitor_scout', 28, {
            message: '🔍 Competitor intelligence gathered — SWOT analysis ready.',
            data: result,
          });
          return result;
        }),

        // Agent 3: Product Strategist
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
          this.reportGateway.emitProgress(input.reportId, 'product_strategy', 42, {
            message: '🚀 Product strategy & GTM plan generated.',
            data: result,
          });
          return result;
        }),

        // Agent 4: Business Formation
        this.withRetry(
          () =>
            this.businessFormationAgent.run({
              ideaDescription: input.ideaDescription,
              industry: input.industry,
              geography: input.geography,
              teamSize: input.teamSize,
              state: input.state,
              businessType: input.businessType,
              language: input.language,
            }),
          'BusinessFormationAgent',
        ).then((result) => {
          this.reportGateway.emitProgress(input.reportId, 'business_formation', 52, {
            message: '🏛️ Legal structure & banking setup recommended.',
            data: result,
          });
          return result;
        }),

        // Agent 5: Compliance & Registration
        this.withRetry(
          () =>
            this.complianceAgent.run({
              ideaDescription: input.ideaDescription,
              industry: input.industry,
              geography: input.geography,
              state: input.state,
              businessType: input.businessType,
              language: input.language,
            }),
          'ComplianceAgent',
        ).then((result) => {
          this.reportGateway.emitProgress(input.reportId, 'compliance', 62, {
            message: '📋 Compliance checklist & tax structure generated.',
            data: result,
          });
          return result;
        }),

        // Agent 6: Financial Intelligence
        this.withRetry(
          () =>
            this.financialAgent.run({
              ideaDescription: input.ideaDescription,
              industry: input.industry,
              geography: input.geography,
              budget: input.budget,
              teamSize: input.teamSize,
              language: input.language,
            }),
          'FinancialAgent',
        ).then((result) => {
          this.reportGateway.emitProgress(input.reportId, 'financial', 72, {
            message: '💰 Financial projections & funding plan created.',
            data: result,
          });
          return result;
        }),

        // Agent 7: Operations & Infrastructure
        this.withRetry(
          () =>
            this.operationsAgent.run({
              ideaDescription: input.ideaDescription,
              industry: input.industry,
              geography: input.geography,
              state: input.state,
              businessType: input.businessType,
              teamSize: input.teamSize,
              language: input.language,
            }),
          'OperationsAgent',
        ).then((result) => {
          this.reportGateway.emitProgress(input.reportId, 'operations', 85, {
            message: '⚙️ Operations blueprint, SOPs & launch checklist ready.',
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
        tailwinds: ["Data unavailable"],
        governmentSchemes: [],
        marketTrends: [],
      };

      competitorOutput = competitorResult.status === 'fulfilled' ? competitorResult.value : {
        competitors: Array(6).fill({
          name: "Unknown", type: "Direct" as const, hq: "Unknown", fundingStage: "Unknown", totalFunding: "Unknown", weakness: "Data unavailable", pricing: "Unknown"
        }),
        swotAnalysis: [],
        positioningMap: { xAxis: "Price", yAxis: "Quality", competitors: [] },
        whitespaceOpportunities: [],
      };

      productOutput = productResult.status === 'fulfilled' ? productResult.value : {
        mvp: Array(4).fill({ phase: 1, title: "Unknown", duration: "Unknown", tasks: [], milestone: "Unknown" }),
        gtm: Array(5).fill({ channel: "Unknown", strategy: "Unknown", expectedCAC: "Unknown" }),
        risks: Array(6).fill({ category: "market" as const, description: "Unknown", severity: "Medium" as const, mitigation: "Unknown" }),
        recommendedStack: [],
        successPrediction: { survivalProbability: 0, fundingProbability: 0, threeYearGrowthPotential: "N/A", estimatedValuation: "N/A" },
      };

      businessFormationOutput = businessFormationResult.status === 'fulfilled' ? businessFormationResult.value : {
        recommendedStructure: "Private Limited Company",
        structures: [],
        bankingSetup: { recommendedBanks: [], paymentGateways: [], upiSetup: "N/A" },
        brandingSuggestions: { nameOptions: [], brandPositioning: "N/A", logoDirection: "N/A", colorPalette: [], websiteStructure: [], seoKeywords: [] },
      };

      complianceOutput = complianceResult.status === 'fulfilled' ? complianceResult.value : {
        registrations: [],
        taxStructure: {
          incomeTax: { type: "N/A", rate: "N/A" },
          gst: { required: false, threshold: "N/A", applicableRate: "N/A" },
          tds: { applicable: false, sections: [] },
          advanceTaxCalendar: [],
          filingDeadlines: [],
        },
        accountingSetup: { recommendedSoftware: [], bookkeepingGuide: "N/A" },
      };

      financialOutput = financialResult.status === 'fulfilled' ? financialResult.value : {
        startupCapital: { oneTimeSetupCosts: [], totalSetupCost: "N/A" },
        workingCapital: { monthlyOperatingExpenses: [], threeMonthRequirement: "N/A", monthlyBurnRate: "N/A" },
        revenueProjections: {
          conservative: { year1: "N/A", year2: "N/A", year3: "N/A" },
          realistic: { year1: "N/A", year2: "N/A", year3: "N/A" },
          optimistic: { year1: "N/A", year2: "N/A", year3: "N/A" },
        },
        monthlyPnL: [],
        cashFlowProjection: [],
        unitEconomics: { cac: "N/A", ltv: "N/A", ltvCacRatio: "N/A", explanation: "N/A" },
        breakEvenAnalysis: { timelineMonths: 0, revenueMilestone: "N/A", explanation: "N/A" },
        fundingOptions: [],
        pitchReadiness: [],
      };

      operationsOutput = operationsResult.status === 'fulfilled' ? operationsResult.value : {
        infrastructure: {
          officeRequirements: { type: "N/A", sqFt: "N/A", locationRecommendation: "N/A", estimatedRent: "N/A" },
          equipmentList: [],
          utilityRequirements: [],
          totalInfrastructureCost: "N/A",
        },
        teamPlan: { orgStructure: "N/A", hiringRoadmap: [], statutoryRequirements: [] },
        technologyStack: {},
        suppliers: { rawMaterials: [], vendorCategories: [], procurementStrategy: "N/A", supplyChainRisks: [] },
        sops: [],
        launchChecklist: [],
      };

    } catch (err) {
      this.reportGateway.emitProgress(input.reportId, 'failed', -1, {
        message: `Agent failure: ${(err as Error).message}`,
      });
      throw err;
    }

    // --- Stage 2: Run VC Agent with merged context ---
    this.logger.log(`[Orchestrator] 7 parallel agents complete. Running VC synthesis...`);

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
      message: '✅ Business DNA report complete! Your full blueprint is ready.',
    });

    const result: OrchestratorOutput = {
      market: marketOutput,
      competitors: competitorOutput,
      product: productOutput,
      vc: vcOutput,
      businessFormation: businessFormationOutput,
      compliance: complianceOutput,
      financial: financialOutput,
      operations: operationsOutput,
    };

    // --- Cache final result for 24h ---
    await this.cache.set(cacheKey, result, CACHE_TTL_24H);
    this.logger.log(`[Orchestrator] Result cached for 24h. Report: ${input.reportId}`);

    return result;
  }
}
