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
import { DiagramGeneratorService } from './generators/diagram-generator.service';
import { FinancialCalculatorService } from './calculators/financial-calculator.service';
import { GeminiProvider } from './providers/gemini.provider';
import { getCountryCurrency } from './prompts/country-context';
import { z } from 'zod';
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
  VcAgentOutput,
} from './ai.types';

const CACHE_TTL_24H = 60 * 60 * 24;

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
    private readonly diagramGenerator: DiagramGeneratorService,
    private readonly calculator: FinancialCalculatorService,
    private readonly gemini: GeminiProvider,
    @Inject(forwardRef(() => ReportGateway)) private readonly reportGateway: ReportGateway,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  private async withRetry<T>(fn: () => Promise<T>, agentName: string, maxRetries = 2): Promise<T> {
    let lastError: Error;
    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err as Error;
        const delay = Math.pow(2, attempt) * 500;
        this.logger.warn(`[${agentName}] Attempt ${attempt} failed. Retrying in ${delay}ms... Error: ${lastError.message}`);
        if (attempt <= maxRetries) {
          await new Promise((res) => setTimeout(res, delay));
        }
      }
    }
    throw new Error(`[${agentName}] All ${maxRetries + 1} attempts failed. Last error: ${lastError!.message}`);
  }

  async run(input: OrchestratorInput): Promise<OrchestratorOutput> {
    const cacheKey = `report:orchestration:${input.reportId}`;

    const cached = await this.cache.get<OrchestratorOutput>(cacheKey);
    if (cached) {
      this.logger.log(`[Orchestrator] Cache HIT for report ${input.reportId}`);
      return cached;
    }

    this.logger.log(`[Orchestrator] Starting multi-AI parallel execution for report: ${input.reportId}`);

    // --- Stage 1: Run 7 Validation & Strategy Agents ---
    this.reportGateway.emitProgress(input.reportId, 'starting', 0, { message: 'Initialising VentureForge AI agents...' });

    const [
      marketResult,
      competitorResult,
      productResult,
      businessFormationResult,
      complianceResult,
      financialResult,
      operationsResult,
    ] = await Promise.allSettled([
      this.withRetry(() => this.marketAgent.run(input), 'MarketAgent')
        .then(res => { this.reportGateway.emitProgress(input.reportId, 'market_analysis', 14, { message: '📊 Market analysis complete.', data: res }); return res; }),
      this.withRetry(() => this.competitorAgent.run(input), 'CompetitorAgent')
        .then(res => { this.reportGateway.emitProgress(input.reportId, 'competitor_scout', 28, { message: '🔍 Competitor intelligence gathered.', data: res }); return res; }),
      this.withRetry(() => this.productAgent.run(input), 'ProductAgent')
        .then(res => { this.reportGateway.emitProgress(input.reportId, 'product_strategy', 42, { message: '🚀 Product strategy & GTM plan generated.', data: res }); return res; }),
      this.withRetry(() => this.businessFormationAgent.run(input), 'BusinessFormationAgent')
        .then(res => { this.reportGateway.emitProgress(input.reportId, 'business_formation', 56, { message: '🏛️ Legal structure & BMC created.', data: res }); return res; }),
      this.withRetry(() => this.complianceAgent.run(input), 'ComplianceAgent')
        .then(res => { this.reportGateway.emitProgress(input.reportId, 'compliance', 70, { message: '📋 Tax & compliance checklist ready.', data: res }); return res; }),
      this.withRetry(() => this.financialAgent.run(input), 'FinancialAgent')
        .then(res => { this.reportGateway.emitProgress(input.reportId, 'financial', 84, { message: '💰 Financial projections & unit economics computed.', data: res }); return res; }),
      this.withRetry(() => this.operationsAgent.run(input), 'OperationsAgent')
        .then(res => { this.reportGateway.emitProgress(input.reportId, 'operations', 90, { message: '⚙️ Operations blueprint & SOPs built.', data: res }); return res; }),
    ]);

    // Error handling & fallback defaults omitted for brevity in this rewritten version,
    // assuming they succeed or we bubble up the error to BullMQ for retry.
    if (marketResult.status === 'rejected') throw marketResult.reason;
    if (competitorResult.status === 'rejected') throw competitorResult.reason;
    if (productResult.status === 'rejected') throw productResult.reason;
    if (businessFormationResult.status === 'rejected') throw businessFormationResult.reason;
    if (complianceResult.status === 'rejected') throw complianceResult.reason;
    if (financialResult.status === 'rejected') throw financialResult.reason;
    if (operationsResult.status === 'rejected') throw operationsResult.reason;

    const marketOutput = marketResult.value;
    const competitorOutput = competitorResult.value;
    const productOutput = productResult.value;
    const businessFormationOutput = businessFormationResult.value;
    const complianceOutput = complianceResult.value;
    const financialOutput = financialResult.value;
    const operationsOutput = operationsResult.value;

    // --- Stage 2: Synthesis, Charts, Diagrams & Final Scoring ---
    this.logger.log(`[Orchestrator] Stage 1 complete. Running Synthesis, Visualizations & AI Scoring...`);
    this.reportGateway.emitProgress(input.reportId, 'synthesis', 95, { message: '🧠 Synthesizing final report, charts and diagrams...' });

    const vcInput = { ...input, marketData: marketOutput, competitorData: competitorOutput, productData: productOutput };
    
    // Run Stage 2 tasks in parallel
    const [vcOutput, diagrams, charts, synthesisResult] = await Promise.all([
      // 1. VC Agent
      this.withRetry(() => this.vcAgent.run(vcInput), 'VcAgent'),
      
      // 2. Diagrams
      this.generateDiagrams(input, marketOutput, operationsOutput, complianceOutput, productOutput),
      
      // 3. Charts
      this.generateCharts(input, financialOutput, marketOutput, productOutput),

      // 4. Opportunity Score & Recommendations
      this.generateSynthesis(input, marketOutput, financialOutput, productOutput, competitorOutput)
    ]);

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
      diagrams,
      charts,
      opportunityScore: synthesisResult.opportunityScore as any,
      aiRecommendations: synthesisResult.aiRecommendations as any,
    };

    await this.cache.set(cacheKey, result, CACHE_TTL_24H);
    this.logger.log(`[Orchestrator] Result cached for 24h. Report: ${input.reportId}`);

    return result;
  }

  private async generateDiagrams(
    input: OrchestratorInput,
    market: MarketAgentOutput,
    ops: OperationsAgentOutput,
    comp: ComplianceAgentOutput,
    prod: ProductAgentOutput
  ) {
    const ctx = { ideaDescription: input.ideaDescription, industry: input.industry, businessType: input.businessType };
    
    const [workflow, journey, supply, ecosystem] = await Promise.all([
      this.diagramGenerator.generateBusinessWorkflow(ctx),
      this.diagramGenerator.generateCustomerJourney(ctx),
      this.diagramGenerator.generateSupplyChain({ ...ctx, suppliers: ops.suppliers }),
      this.diagramGenerator.generateBusinessEcosystem(ctx),
    ]);

    return {
      mermaid: {
        businessWorkflow: workflow,
        registrationProcess: this.diagramGenerator.generateRegistrationProcess(comp.registrations),
        customerJourney: journey,
        supplyChain: supply,
        orgChart: this.diagramGenerator.generateOrgChart(ops.teamPlan),
        launchRoadmap: this.diagramGenerator.generateLaunchRoadmap(ops.launchChecklist),
      },
      reactflow: {
        businessBlueprint: this.diagramGenerator.generateBusinessBlueprint({ ...ctx, hasMarket: true, hasCompetitors: true, hasFinancial: true, hasOperations: true, hasCompliance: true }),
        businessEcosystem: ecosystem,
        productLifecycle: this.diagramGenerator.generateProductLifecycle(prod.mvp),
      }
    };
  }

  private async generateCharts(
    input: OrchestratorInput,
    fin: FinancialAgentOutput,
    market: MarketAgentOutput,
    prod: ProductAgentOutput
  ) {
    const { symbol } = getCountryCurrency(input.country || input.geography);
    
    // We need to recalculate the raw arrays for the charts since the agent returned formatted strings
    const calcInput = { ...fin.assumptions, currencySymbol: symbol };
    const monthlyProj = this.calculator.calculateMonthlyProjections(calcInput);
    const yearlyProj = this.calculator.calculateYearlyProjections(calcInput);
    const breakEven = this.calculator.calculateBreakEven(calcInput);
    const cashFlow = this.calculator.calculateCashFlow(calcInput);

    return {
      revenueChart: this.calculator.generateRevenueChartConfig(yearlyProj, symbol),
      cashFlowChart: this.calculator.generateCashFlowChartConfig(cashFlow, symbol),
      breakEvenChart: this.calculator.generateBreakEvenChartConfig(breakEven, monthlyProj, symbol),
      marketSizeChart: this.calculator.generateMarketSizeChartConfig(market.tam.value, market.sam.value, market.som.value, symbol),
      riskHeatmap: this.calculator.generateRiskHeatmapConfig(prod.risks),
      profitChart: this.calculator.generateProfitChartConfig(yearlyProj, symbol),
    };
  }

  private async generateSynthesis(
    input: OrchestratorInput,
    market: MarketAgentOutput,
    fin: FinancialAgentOutput,
    prod: ProductAgentOutput,
    comp: CompetitorAgentOutput
  ) {
    const schema = z.object({
      opportunityScore: z.object({
        score: z.number(),
        breakdown: z.array(z.object({ dimension: z.string(), score: z.number(), rationale: z.string() }))
      }),
      aiRecommendations: z.array(z.object({
        category: z.string(),
        priority: z.enum(['High', 'Medium', 'Low']),
        recommendation: z.string(),
        impact: z.string(),
        effort: z.string(),
        timeframe: z.string(),
      }))
    });

    const prompt = `Synthesize a final Opportunity Score and top actionable AI Recommendations for this business.
Idea: ${input.ideaDescription}
Industry: ${input.industry}
Market TAM: ${market.tam.currency}${market.tam.value}
Competitors: ${comp.competitors.length}
Risks: ${prod.risks.map(r => r.description).join(', ')}`;

    const response = await this.gemini.generateStructuredJson(prompt, schema);
    return response.data;
  }
}
