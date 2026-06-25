import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';
import { BusinessFormationAgentInput, BusinessFormationAgentOutput } from '../ai.types';
import { GeminiProvider } from '../providers/gemini.provider';
import { TavilyProvider } from '../providers/tavily.provider';
import { getBusinessFormationPrompt } from '../prompts/business-formation.prompt';

const StructureOptionSchema = z.object({
  type: z.string(),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  taxImplications: z.string(),
  registrationCost: z.string(),
  complianceBurden: z.string(),
  isRecommended: z.boolean(),
  reasoning: z.string(),
});

const FormationOutputSchema = z.object({
  recommendedStructure: z.string(),
  structures: z.array(StructureOptionSchema).min(2),
  bankingSetup: z.object({
    recommendedBanks: z.array(z.object({
      name: z.string(),
      accountType: z.string(),
      features: z.array(z.string()),
      monthlyFee: z.string(),
    })),
    paymentGateways: z.array(z.object({
      name: z.string(),
      mdrRate: z.string(),
      features: z.array(z.string()),
    })),
    upiSetup: z.string(),
  }),
  brandingSuggestions: z.object({
    nameOptions: z.array(z.object({
      name: z.string(),
      rationale: z.string(),
      domainAvailable: z.boolean().optional(),
    })),
    brandPositioning: z.string(),
    logoDirection: z.string(),
    colorPalette: z.array(z.string()),
    websiteStructure: z.array(z.string()),
    seoKeywords: z.array(z.string()),
  }),
  businessModelCanvas: z.object({
    keyPartners: z.array(z.string()),
    keyActivities: z.array(z.string()),
    valuePropositions: z.array(z.string()),
    customerRelationships: z.array(z.string()),
    customerSegments: z.array(z.string()),
    channels: z.array(z.string()),
    keyResources: z.array(z.string()),
    costStructure: z.array(z.string()),
    revenueStreams: z.array(z.string()),
  }).optional(),
  leanCanvas: z.object({
    problem: z.array(z.string()),
    solution: z.array(z.string()),
    keyMetrics: z.array(z.string()),
    uniqueValueProposition: z.string(),
    unfairAdvantage: z.string(),
    channels: z.array(z.string()),
    customerSegments: z.array(z.string()),
    costStructure: z.array(z.string()),
    revenueStreams: z.array(z.string()),
  }).optional(),
});

/**
 * BusinessFormationAgent — Recommends legal structures, banking, branding, and BMC/Lean Canvas.
 */
@Injectable()
export class BusinessFormationAgent {
  private readonly logger = new Logger(BusinessFormationAgent.name);

  constructor(
    private readonly gemini: GeminiProvider,
    private readonly tavily: TavilyProvider,
  ) {}

  async run(input: BusinessFormationAgentInput): Promise<BusinessFormationAgentOutput> {
    this.logger.log(`[BusinessFormationAgent] Generating formation recommendations for: ${input.industry}`);

    // Fetch real-time regulations
    const searchResults = await this.tavily.searchRegulations(
      input.country || input.geography,
      input.businessType || 'business',
      input.industry,
    );
    const searchContext = this.tavily.formatForPrompt(searchResults, 'Business Regulations & Incorporation Data');

    const prompt = getBusinessFormationPrompt(input, searchContext);

    const response = await this.gemini.generateStructuredJson(prompt, FormationOutputSchema, {
      maxTokens: 8192,
      temperature: 0.6,
    });

    this.logger.log(`[BusinessFormationAgent] Recommended structure: ${response.data.recommendedStructure}`);
    return response.data as BusinessFormationAgentOutput;
  }
}
