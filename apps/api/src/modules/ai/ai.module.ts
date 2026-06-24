import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiOrchestrator } from './ai.orchestrator';
import { MarketAgent } from './agents/market.agent';
import { CompetitorAgent } from './agents/competitor.agent';
import { ProductAgent } from './agents/product.agent';
import { VcAgent } from './agents/vc.agent';
import { BusinessFormationAgent } from './agents/business-formation.agent';
import { ComplianceAgent } from './agents/compliance.agent';
import { FinancialAgent } from './agents/financial.agent';
import { OperationsAgent } from './agents/operations.agent';
import { ReportsModule } from '../reports/reports.module';

@Module({
  imports: [ConfigModule, forwardRef(() => ReportsModule)],
  providers: [
    AiOrchestrator,
    // Layer 1 — Validation Intelligence
    MarketAgent,
    CompetitorAgent,
    ProductAgent,
    // Layer 2 — Business Formation Engine
    BusinessFormationAgent,
    ComplianceAgent,
    FinancialAgent,
    OperationsAgent,
    // Synthesis
    VcAgent,
  ],
  exports: [AiOrchestrator],
})
export class AiModule {}
