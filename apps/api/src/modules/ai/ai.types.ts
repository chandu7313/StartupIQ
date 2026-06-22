// ============================================================
// SHARED AI TYPES — used across all agents and the orchestrator
// ============================================================

// --------- Market Agent ---------
export interface MarketAgentInput {
  language?: string;
  ideaDescription: string;
  industry: string;
  geography: string;
}

export interface MarketAgentOutput {
  tam: { inrCr: number; usdM: number; cagr: number };
  sam: { inrCr: number; usdM: number };
  som: { inrCr: number; usdM: number };
  analysis: string;
  icp: string;
  tailwinds: string[];
  governmentSchemes: string[];
}

// --------- Competitor Agent ---------
export interface CompetitorAgentInput {
  language?: string;
  geography: string;
  ideaDescription: string;
  industry: string;
}

export interface Competitor {
  name: string;
  type: 'Direct' | 'Indirect';
  hq: string;
  fundingStage: string;
  totalFunding: string;
  weakness: string;
  pricing: string;
}

export interface CompetitorAgentOutput {
  competitors: Competitor[];
}

// --------- Product Agent ---------
export interface ProductAgentInput {
  language?: string;
  geography: string;
  ideaDescription: string;
  stage: string;
  teamSize: number;
  budget: string;
}

export interface MvpPhase {
  phase: number;
  title: string;
  duration: string;
  tasks: string[];
  milestone: string;
}

export interface GtmChannel {
  channel: string;
  strategy: string;
  expectedCAC: string;
}

export interface RiskItem {
  category: string;
  description: string;
  severity: 'High' | 'Medium' | 'Low';
  mitigation: string;
}

export interface ProductAgentOutput {
  mvp: MvpPhase[];
  gtm: GtmChannel[];
  risks: RiskItem[];
  recommendedStack: string[];
}

// --------- VC Agent ---------
export interface VcAgentInput {
  language?: string;
  geography: string;
  ideaDescription: string;
  marketData: MarketAgentOutput;
  competitorData: CompetitorAgentOutput;
  productData: ProductAgentOutput;
}

export interface InvestorDimension {
  name: string;
  score: number; // 0–10
  reasoning: string;
}

export interface PitchSlide {
  title: string;
  content: string;
  dataPoints: string[];
}

export interface VcAgentOutput {
  investorScore: number; // 0–100 composite
  dimensions: InvestorDimension[];
  pitch: PitchSlide[];
  verdict: 'Fund' | 'Pass' | 'Watch';
  monetization: string;
  fundingRecommendation: string;
}

// --------- Orchestrator ---------
export interface OrchestratorInput extends
  MarketAgentInput,
  CompetitorAgentInput,
  ProductAgentInput {
  reportId: string;
}

export interface OrchestratorOutput {
  market: MarketAgentOutput;
  competitors: CompetitorAgentOutput;
  product: ProductAgentOutput;
  vc: VcAgentOutput;
}
