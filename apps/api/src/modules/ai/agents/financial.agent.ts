import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';
import { FinancialAgentInput, FinancialAgentOutput, FinancialAssumptionsFromLLM } from '../ai.types';
import { GeminiProvider } from '../providers/gemini.provider';
import { FinancialCalculatorService } from '../calculators/financial-calculator.service';
import { getFinancialPrompt } from '../prompts/financial.prompt';
import { getCountryCurrency } from '../prompts/country-context';

const AssumptionsSchema = z.object({
  initialMonthlyRevenue: z.number(),
  monthlyRevenueGrowthRate: z.number(),
  monthlyFixedCosts: z.number(),
  monthlyVariableCostRate: z.number(),
  initialInvestment: z.number(),
  pricePerUnit: z.number(),
  variableCostPerUnit: z.number(),
  cacPerCustomer: z.number(),
  avgRevenuePerCustomer: z.number(),
  avgCustomerLifetimeMonths: z.number(),
  monthlyChurnRate: z.number(),
  fundingOptions: z.array(z.object({
    option: z.string(),
    suitability: z.string(),
    amount: z.string(),
    details: z.string(),
  })),
  startupCosts: z.array(z.object({ item: z.string(), amount: z.number() })),
  pitchReadiness: z.array(z.string()),
});

/**
 * FinancialAgent — Hybrid AI + Deterministic Financial Engine.
 *
 * 1. Gemini generates realistic assumptions based on the business model.
 * 2. FinancialCalculatorService applies standard formulas to generate 3-year P&L,
 *    cash flow, unit economics, and break-even points.
 * This prevents the LLM from hallucinating bad math while keeping the creativity
 * in the assumptions and cost structures.
 */
@Injectable()
export class FinancialAgent {
  private readonly logger = new Logger(FinancialAgent.name);

  constructor(
    private readonly gemini: GeminiProvider,
    private readonly calculator: FinancialCalculatorService,
  ) {}

  async run(input: FinancialAgentInput): Promise<FinancialAgentOutput> {
    this.logger.log(`[FinancialAgent] Generating financial assumptions for: ${input.industry}`);

    const prompt = getFinancialPrompt(input);
    const { symbol: currencySymbol } = getCountryCurrency(input.country || input.geography);

    // Step 1: Gemini generates ONLY the assumptions
    const response = await this.gemini.generateStructuredJson(prompt, AssumptionsSchema, {
      maxTokens: 4096,
      temperature: 0.5,
    });

    const assumptions = response.data;

    const calcInput = {
      ...assumptions,
      currencySymbol,
    } as import('../ai.types').FinancialAssumptionsFromLLM;

    // Step 2: Deterministic Calculator generates the projections
    const monthlyProjections = this.calculator.calculateMonthlyProjections(calcInput);
    const yearlyProjections = this.calculator.calculateYearlyProjections(calcInput);
    const breakEven = this.calculator.calculateBreakEven(calcInput);
    const cashFlow = this.calculator.calculateCashFlow(calcInput);
    const unitEconomics = this.calculator.calculateUnitEconomics(calcInput);

    // Format currency helper
    const formatCurrency = (val: number) => `${currencySymbol}${val.toLocaleString('en-US')}`;

    // Step 3: Map to final output format
    const output: FinancialAgentOutput = {
      assumptions: calcInput,
      startupCapital: {
        oneTimeSetupCosts: assumptions.startupCosts.map((c) => ({
          item: c.item,
          amount: formatCurrency(c.amount),
        })),
        totalSetupCost: formatCurrency(assumptions.startupCosts.reduce((a, b) => a + b.amount, 0)),
      },
      workingCapital: {
        monthlyOperatingExpenses: [
          { item: 'Fixed Costs', amount: formatCurrency(assumptions.monthlyFixedCosts) },
          { item: 'Variable Costs (Est. Month 1)', amount: formatCurrency(assumptions.initialMonthlyRevenue * assumptions.monthlyVariableCostRate) },
        ],
        threeMonthRequirement: formatCurrency((assumptions.monthlyFixedCosts + (assumptions.initialMonthlyRevenue * assumptions.monthlyVariableCostRate)) * 3),
        monthlyBurnRate: formatCurrency(Math.max(0, assumptions.monthlyFixedCosts + (assumptions.initialMonthlyRevenue * assumptions.monthlyVariableCostRate) - assumptions.initialMonthlyRevenue)),
      },
      revenueProjections: {
        conservative: {
          year1: formatCurrency(yearlyProjections.conservative[0].revenue),
          year2: formatCurrency(yearlyProjections.conservative[1].revenue),
          year3: formatCurrency(yearlyProjections.conservative[2].revenue),
        },
        realistic: {
          year1: formatCurrency(yearlyProjections.realistic[0].revenue),
          year2: formatCurrency(yearlyProjections.realistic[1].revenue),
          year3: formatCurrency(yearlyProjections.realistic[2].revenue),
        },
        optimistic: {
          year1: formatCurrency(yearlyProjections.optimistic[0].revenue),
          year2: formatCurrency(yearlyProjections.optimistic[1].revenue),
          year3: formatCurrency(yearlyProjections.optimistic[2].revenue),
        },
      },
      monthlyPnL: [
        { month: 'Month 1', revenue: formatCurrency(monthlyProjections[0].revenue), expenses: formatCurrency(monthlyProjections[0].expenses), profit: formatCurrency(monthlyProjections[0].profit) },
        { month: 'Month 6', revenue: formatCurrency(monthlyProjections[5].revenue), expenses: formatCurrency(monthlyProjections[5].expenses), profit: formatCurrency(monthlyProjections[5].profit) },
        { month: 'Month 12', revenue: formatCurrency(monthlyProjections[11].revenue), expenses: formatCurrency(monthlyProjections[11].expenses), profit: formatCurrency(monthlyProjections[11].profit) },
      ],
      cashFlowProjection: [
        { month: 'Month 1', inflow: formatCurrency(cashFlow[0].inflow), outflow: formatCurrency(cashFlow[0].outflow), netCash: formatCurrency(cashFlow[0].netCash) },
        { month: 'Month 6', inflow: formatCurrency(cashFlow[5].inflow), outflow: formatCurrency(cashFlow[5].outflow), netCash: formatCurrency(cashFlow[5].netCash) },
        { month: 'Month 12', inflow: formatCurrency(cashFlow[11].inflow), outflow: formatCurrency(cashFlow[11].outflow), netCash: formatCurrency(cashFlow[11].netCash) },
      ],
      unitEconomics: {
        cac: formatCurrency(unitEconomics.cac),
        ltv: formatCurrency(unitEconomics.ltv),
        ltvCacRatio: `${unitEconomics.ltvCacRatio}:1`,
        explanation: unitEconomics.explanation,
      },
      breakEvenAnalysis: {
        timelineMonths: breakEven.breakEvenMonths,
        revenueMilestone: `${formatCurrency(breakEven.breakEvenRevenue)}/month`,
        explanation: `Break-even is projected at month ${breakEven.breakEvenMonths} assuming a contribution margin of ${formatCurrency(breakEven.contributionMarginPerUnit)} per unit against fixed costs of ${formatCurrency(breakEven.monthlyFixedCosts)}.`,
      },
      fundingOptions: assumptions.fundingOptions as { option: string; suitability: string; amount: string; details: string; }[],
      pitchReadiness: assumptions.pitchReadiness,
    };

    this.logger.log(`[FinancialAgent] Computed projections based on LLM assumptions. Duration: ${response.durationMs}ms`);
    return output;
  }
}
