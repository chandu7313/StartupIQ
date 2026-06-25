// ============================================================
// SHARED AI TYPES — VentureForge AI Business Operating System
// 8 specialist agents + orchestrator for Business DNA generation
// Expanded for 30-section multi-AI report
// ============================================================

import { EChartsOption } from './calculators/financial-calculator.service';
import { ReactFlowData } from './generators/diagram-generator.service';

// --------- Market Agent (Layer 1) ---------
export interface MarketAgentInput {
  language?: string;
  ideaDescription: string;
  industry: string;
  geography: string;
  country?: string;
}

export interface MarketAgentOutput {
  tam: { value: number; currency: string; cagr: number };
  sam: { value: number; currency: string };
  som: { value: number; currency: string };
  analysis: string;
  icp: string;
  tailwinds: string[];
  governmentSchemes: string[];
  marketTrends: string[];
  // New fields for expanded report
  pestleAnalysis?: PESTLEAnalysis;
  customerPersonas?: CustomerPersona[];
}

// --------- Competitor Agent (Layer 1) ---------
export interface CompetitorAgentInput {
  language?: string;
  geography: string;
  ideaDescription: string;
  industry: string;
  country?: string;
}

export interface Competitor {
  name: string;
  type: 'Direct' | 'Indirect';
  hq: string;
  fundingStage: string;
  totalFunding: string;
  weakness: string;
  pricing: string;
  features?: string[];
}

export interface CompetitorSWOT {
  name: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface CompetitorAgentOutput {
  competitors: Competitor[];
  swotAnalysis: CompetitorSWOT[];
  positioningMap: { xAxis: string; yAxis: string; competitors: { name: string; x: number; y: number }[] };
  whitespaceOpportunities: string[];
}

// --------- Product Agent (Layer 1 + Layer 2) ---------
export interface ProductAgentInput {
  language?: string;
  geography: string;
  ideaDescription: string;
  stage: string;
  teamSize: number;
  budget: string;
  country?: string;
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
  category: 'market' | 'financial' | 'regulatory' | 'technical' | 'operational';
  description: string;
  severity: 'High' | 'Medium' | 'Low';
  mitigation: string;
}

export interface ProductAgentOutput {
  mvp: MvpPhase[];
  gtm: GtmChannel[];
  risks: RiskItem[];
  recommendedStack: string[];
  successPrediction: {
    survivalProbability: number;
    fundingProbability: number;
    threeYearGrowthPotential: string;
    estimatedValuation: string;
  };
  // New fields
  pricingStrategy?: PricingStrategy;
  productsAndServices?: ProductService[];
  marketingStrategy?: MarketingStrategy;
}

// --------- VC Agent (Layer 1 + Layer 2) ---------
export interface VcAgentInput {
  language?: string;
  geography: string;
  ideaDescription: string;
  marketData: MarketAgentOutput;
  competitorData: CompetitorAgentOutput;
  productData: ProductAgentOutput;
  country?: string;
}

export interface InvestorDimension {
  name: string;
  score: number; // 0–100
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
  investorMatch: {
    vcFunds: { name: string; sector: string; stage: string; ticketSize: string }[];
    angelInvestors: { name: string; sector: string; portfolio: string }[];
    fundingProbabilityScore: number;
  };
  // New fields
  executiveSummary?: ExecutiveSummary;
}

// --------- Business Formation Agent (Layer 2) ---------
export interface BusinessFormationAgentInput {
  language?: string;
  ideaDescription: string;
  industry: string;
  geography: string;
  teamSize: number;
  state?: string;
  businessType?: string;
  country?: string;
}

export interface BusinessStructureOption {
  type: string;
  pros: string[];
  cons: string[];
  taxImplications: string;
  registrationCost: string;
  complianceBurden: string;
  isRecommended: boolean;
  reasoning: string;
}

export interface BusinessFormationAgentOutput {
  recommendedStructure: string;
  structures: BusinessStructureOption[];
  bankingSetup: {
    recommendedBanks: { name: string; accountType: string; features: string[]; monthlyFee: string }[];
    paymentGateways: { name: string; mdrRate: string; features: string[] }[];
    upiSetup: string;
  };
  brandingSuggestions: {
    nameOptions: { name: string; rationale: string; domainAvailable?: boolean }[];
    brandPositioning: string;
    logoDirection: string;
    colorPalette: string[];
    websiteStructure: string[];
    seoKeywords: string[];
  };
  // New field
  businessModelCanvas?: BusinessModelCanvas;
  leanCanvas?: LeanCanvas;
}

// --------- Compliance Agent (Layer 2) ---------
export interface ComplianceAgentInput {
  language?: string;
  ideaDescription: string;
  industry: string;
  geography: string;
  state?: string;
  businessType?: string;
  businessStructure?: string;
  country?: string;
}

export interface RegistrationItem {
  name: string;
  authority: string;
  estimatedCost: string;
  processingTime: string;
  documentsRequired: string[];
  portalLink?: string;
  isMandatory: boolean;
  priority: number; // 1 = highest priority
}

export interface ComplianceAgentOutput {
  registrations: RegistrationItem[];
  taxStructure: {
    incomeTax: { type: string; rate: string; slabs?: string[] };
    gst: { required: boolean; threshold: string; applicableRate: string; hsnSacCode?: string };
    tds: { applicable: boolean; sections: string[] };
    advanceTaxCalendar: { quarter: string; dueDate: string }[];
    filingDeadlines: { filing: string; dueDate: string; penalty: string }[];
  };
  accountingSetup: {
    recommendedSoftware: { name: string; pricing: string; features: string[] }[];
    bookkeepingGuide: string;
  };
}

// --------- Financial Agent (Layer 2) ---------
export interface FinancialAgentInput {
  language?: string;
  ideaDescription: string;
  industry: string;
  geography: string;
  budget: string;
  teamSize: number;
  marketData?: MarketAgentOutput;
  country?: string;
}

export interface FinancialAgentOutput {
  // Assumptions generated by LLM
  assumptions: FinancialAssumptionsFromLLM;
  // Computed values (filled by FinancialCalculatorService, not by LLM)
  startupCapital: {
    oneTimeSetupCosts: { item: string; amount: string }[];
    totalSetupCost: string;
  };
  workingCapital: {
    monthlyOperatingExpenses: { item: string; amount: string }[];
    threeMonthRequirement: string;
    monthlyBurnRate: string;
  };
  revenueProjections: {
    conservative: { year1: string; year2: string; year3: string };
    realistic: { year1: string; year2: string; year3: string };
    optimistic: { year1: string; year2: string; year3: string };
  };
  monthlyPnL: { month: string; revenue: string; expenses: string; profit: string }[];
  cashFlowProjection: { month: string; inflow: string; outflow: string; netCash: string }[];
  unitEconomics: {
    cac: string;
    ltv: string;
    ltvCacRatio: string;
    explanation: string;
  };
  breakEvenAnalysis: {
    timelineMonths: number;
    revenueMilestone: string;
    explanation: string;
  };
  fundingOptions: {
    option: string;
    suitability: string;
    amount: string;
    details: string;
  }[];
  pitchReadiness: string[];
}

/**
 * Financial assumptions generated by the LLM (Gemini).
 * These are fed into the deterministic FinancialCalculatorService.
 */
export interface FinancialAssumptionsFromLLM {
  initialMonthlyRevenue: number;
  monthlyRevenueGrowthRate: number;
  monthlyFixedCosts: number;
  monthlyVariableCostRate: number;
  initialInvestment: number;
  pricePerUnit: number;
  variableCostPerUnit: number;
  cacPerCustomer: number;
  avgRevenuePerCustomer: number;
  avgCustomerLifetimeMonths: number;
  monthlyChurnRate: number;
  currencySymbol: string;
}

// --------- Operations Agent (Layer 2) ---------
export interface OperationsAgentInput {
  language?: string;
  ideaDescription: string;
  industry: string;
  geography: string;
  state?: string;
  businessType?: string;
  teamSize: number;
  country?: string;
}

export interface SOPItem {
  category: string;
  title: string;
  objective: string;
  steps: { stepNumber: number; action: string; responsible: string }[];
}

export interface OperationsAgentOutput {
  infrastructure: {
    officeRequirements: { type: string; sqFt: string; locationRecommendation: string; estimatedRent: string };
    warehouseRequirements?: { sqFt: string; type: string; estimatedCost: string };
    equipmentList: { item: string; estimatedCost: string; priority: string }[];
    utilityRequirements: { utility: string; specification: string; estimatedCost: string }[];
    totalInfrastructureCost: string;
  };
  teamPlan: {
    orgStructure: string;
    hiringRoadmap: {
      year: number;
      roles: { title: string; salaryRange: string; recruitmentChannel: string }[];
    }[];
    statutoryRequirements: { threshold: string; requirement: string }[];
  };
  technologyStack: {
    forTechBusiness?: { frontend: string; backend: string; database: string; cloud: string; devops: string; thirdParty: string[]; estimatedMonthlyCost: string };
    forNonTechBusiness?: { crm: string; erp: string; billing: string; inventory: string; hrPayroll: string; pos?: string };
  };
  suppliers: {
    rawMaterials: { item: string; source: string; estimatedCost: string }[];
    vendorCategories: string[];
    procurementStrategy: string;
    supplyChainRisks: string[];
  };
  sops: SOPItem[];
  launchChecklist: {
    step: number;
    task: string;
    category: string;
    estimatedDuration: string;
    dependencies: number[];
  }[];
}

// ============================================================
// NEW TYPES — For Expanded 30-Section Report
// ============================================================

// --------- PESTLE Analysis ---------
export interface PESTLEAnalysis {
  political: string[];
  economic: string[];
  social: string[];
  technological: string[];
  legal: string[];
  environmental: string[];
}

// --------- Business Model Canvas ---------
export interface BusinessModelCanvas {
  keyPartners: string[];
  keyActivities: string[];
  valuePropositions: string[];
  customerRelationships: string[];
  customerSegments: string[];
  channels: string[];
  keyResources: string[];
  costStructure: string[];
  revenueStreams: string[];
}

// --------- Lean Canvas ---------
export interface LeanCanvas {
  problem: string[];
  solution: string[];
  keyMetrics: string[];
  uniqueValueProposition: string;
  unfairAdvantage: string;
  channels: string[];
  customerSegments: string[];
  costStructure: string[];
  revenueStreams: string[];
}

// --------- Customer Persona ---------
export interface CustomerPersona {
  name: string;
  age: string;
  occupation: string;
  income: string;
  goals: string[];
  painPoints: string[];
  buyingBehavior: string;
  channels: string[];
}

// --------- Executive Summary ---------
export interface ExecutiveSummary {
  overview: string;
  opportunity: string;
  solution: string;
  marketSize: string;
  competitiveAdvantage: string;
  financialHighlights: string;
  askAmount?: string;
}

// --------- Opportunity Score ---------
export interface OpportunityScore {
  score: number; // 0–100
  breakdown: { dimension: string; score: number; rationale: string }[];
}

// --------- Pricing Strategy ---------
export interface PricingStrategy {
  model: string; // e.g., "Freemium", "Subscription", "Cost-Plus"
  tiers: { name: string; price: string; features: string[]; target: string }[];
  rationale: string;
  competitiveBenchmark: string;
}

// --------- Product/Service ---------
export interface ProductService {
  name: string;
  description: string;
  category: string;
  revenueModel: string;
  targetSegment: string;
}

// --------- Marketing Strategy ---------
export interface MarketingStrategy {
  positioning: string;
  channels: { name: string; strategy: string; budget: string; expectedROI: string }[];
  contentPlan: string[];
  brandVoice: string;
  kpis: string[];
}

// --------- AI Recommendations ---------
export interface AIRecommendation {
  category: string; // "Growth", "Risk Mitigation", "Revenue", "Operations", "Product"
  priority: 'High' | 'Medium' | 'Low';
  recommendation: string;
  impact: string;
  effort: string;
  timeframe: string;
}

// --------- Diagram & Chart Data ---------
export interface DiagramData {
  mermaid: {
    businessWorkflow?: string;
    registrationProcess?: string;
    customerJourney?: string;
    supplyChain?: string;
    orgChart?: string;
    launchRoadmap?: string;
  };
  reactflow: {
    businessBlueprint?: ReactFlowData;
    businessEcosystem?: ReactFlowData;
    productLifecycle?: ReactFlowData;
  };
}

export interface ChartConfigs {
  revenueChart?: EChartsOption;
  cashFlowChart?: EChartsOption;
  breakEvenChart?: EChartsOption;
  marketSizeChart?: EChartsOption;
  riskHeatmap?: EChartsOption;
  kpiDashboard?: EChartsOption;
  profitChart?: EChartsOption;
}

// --------- Orchestrator ---------
export interface OrchestratorInput {
  reportId: string;
  ideaDescription: string;
  industry: string;
  geography: string;
  stage: string;
  teamSize: number;
  budget: string;
  language?: string;
  state?: string;
  businessType?: string;
  country?: string;
}

export interface OrchestratorOutput {
  market: MarketAgentOutput;
  competitors: CompetitorAgentOutput;
  product: ProductAgentOutput;
  vc: VcAgentOutput;
  businessFormation: BusinessFormationAgentOutput;
  compliance: ComplianceAgentOutput;
  financial: FinancialAgentOutput;
  operations: OperationsAgentOutput;
  // New fields from expanded report
  diagrams: DiagramData;
  charts: ChartConfigs;
  opportunityScore: OpportunityScore;
  aiRecommendations: AIRecommendation[];
}

// --------- AI Startup Score™ ---------
export interface StartupScore {
  marketPotential: number;
  revenueFeasibility: number;
  competitiveAdvantage: number;
  scalability: number;
  investorAttractiveness: number;
  overallSuccessProbability: number;
  improvements: { dimension: string; suggestion: string }[];
}
