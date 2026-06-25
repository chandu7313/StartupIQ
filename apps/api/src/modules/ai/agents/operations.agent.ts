import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';
import { OperationsAgentInput, OperationsAgentOutput } from '../ai.types';
import { GeminiProvider } from '../providers/gemini.provider';
import { getOperationsPrompt } from '../prompts/operations.prompt';

const SOPItemSchema = z.object({
  category: z.string(),
  title: z.string(),
  objective: z.string(),
  steps: z.array(z.object({
    stepNumber: z.number(),
    action: z.string(),
    responsible: z.string(),
  })),
});

const OperationsOutputSchema = z.object({
  infrastructure: z.object({
    officeRequirements: z.object({
      type: z.string(),
      sqFt: z.string(),
      locationRecommendation: z.string(),
      estimatedRent: z.string(),
    }),
    warehouseRequirements: z.object({
      sqFt: z.string(),
      type: z.string(),
      estimatedCost: z.string(),
    }).optional(),
    equipmentList: z.array(z.object({
      item: z.string(),
      estimatedCost: z.string(),
      priority: z.string(),
    })),
    utilityRequirements: z.array(z.object({
      utility: z.string(),
      specification: z.string(),
      estimatedCost: z.string(),
    })),
    totalInfrastructureCost: z.string(),
  }),
  teamPlan: z.object({
    orgStructure: z.string(),
    hiringRoadmap: z.array(z.object({
      year: z.number(),
      roles: z.array(z.object({
        title: z.string(),
        salaryRange: z.string(),
        recruitmentChannel: z.string(),
      })),
    })),
    statutoryRequirements: z.array(z.object({
      threshold: z.string(),
      requirement: z.string(),
    })),
  }),
  technologyStack: z.object({
    forTechBusiness: z.object({
      frontend: z.string(),
      backend: z.string(),
      database: z.string(),
      cloud: z.string(),
      devops: z.string(),
      thirdParty: z.array(z.string()),
      estimatedMonthlyCost: z.string(),
    }).optional(),
    forNonTechBusiness: z.object({
      crm: z.string(),
      erp: z.string(),
      billing: z.string(),
      inventory: z.string(),
      hrPayroll: z.string(),
      pos: z.string().optional(),
    }).optional(),
  }),
  suppliers: z.object({
    rawMaterials: z.array(z.object({
      item: z.string(),
      source: z.string(),
      estimatedCost: z.string(),
    })),
    vendorCategories: z.array(z.string()),
    procurementStrategy: z.string(),
    supplyChainRisks: z.array(z.string()),
  }),
  sops: z.array(SOPItemSchema).min(3),
  launchChecklist: z.array(z.object({
    step: z.number(),
    task: z.string(),
    category: z.string(),
    estimatedDuration: z.string(),
    dependencies: z.array(z.number()),
  })).min(5),
});

/**
 * OperationsAgent — Operations & Infrastructure powered by Gemini.
 */
@Injectable()
export class OperationsAgent {
  private readonly logger = new Logger(OperationsAgent.name);

  constructor(private readonly gemini: GeminiProvider) {}

  async run(input: OperationsAgentInput): Promise<OperationsAgentOutput> {
    this.logger.log(`[OperationsAgent] Generating operations plan for: ${input.industry}`);

    const prompt = getOperationsPrompt(input);

    const response = await this.gemini.generateStructuredJson(prompt, OperationsOutputSchema, {
      maxTokens: 8192,
      temperature: 0.5,
    });

    this.logger.log(`[OperationsAgent] SUCCESS. Generated ${response.data.sops.length} SOPs. Duration: ${response.durationMs}ms`);
    return response.data as OperationsAgentOutput;
  }
}
