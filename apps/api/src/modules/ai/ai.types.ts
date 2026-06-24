// ============================================================
// SHARED AI TYPES — VentureForge AI Business Operating System
// 8 specialist agents + orchestrator for Business DNA generation
// ============================================================

// --------- Market Agent (Layer 1) ---------
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
  marketTrends: string[];
}

// --------- Competitor Agent (Layer 1) ---------
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
}

// --------- VC Agent (Layer 1 + Layer 2) ---------
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
}

export interface BusinessStructureOption {
  type: string; // e.g., "Private Limited Company"
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
}

export interface FinancialAgentOutput {
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

// --------- Operations Agent (Layer 2) ---------
export interface OperationsAgentInput {
  language?: string;
  ideaDescription: string;
  industry: string;
  geography: string;
  state?: string;
  businessType?: string;
  teamSize: number;
}

export interface SOPItem {
  category: string; // Operations, HR, Customer Service, Safety, Finance
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
    orgStructure: string; // Text description of org chart
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
    dependencies: number[]; // step numbers this depends on
  }[];
}

// --------- Orchestrator ---------
export interface OrchestratorInput extends
  MarketAgentInput,
  CompetitorAgentInput,
  ProductAgentInput {
  reportId: string;
  state?: string;
  businessType?: string;
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
}

// --------- AI Startup Score™ ---------
export interface StartupScore {
  marketPotential: number;      // 0–100
  revenueFeasibility: number;   // 0–100
  competitiveAdvantage: number; // 0–100
  scalability: number;          // 0–100
  investorAttractiveness: number; // 0–100
  overallSuccessProbability: number; // 0–100
  improvements: { dimension: string; suggestion: string }[];
}
