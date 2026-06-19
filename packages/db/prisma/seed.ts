import { PrismaClient, Plan, Industry, Geography, ReportStatus, Verdict } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const defaultPassword = await bcrypt.hash('password123', 10);

  // ── Users ──────────────────────────────────────────
  const [alice, bob, charlie] = await Promise.all([
    prisma.user.upsert({
      where: { email: 'alice@startupsaarthi.dev' },
      update: {},
      create: {
        email: 'alice@startupsaarthi.dev',
        password: defaultPassword,
        name: 'Alice Sharma',
        plan: Plan.PRO,
        reportsUsed: 4,
        reportsLimit: -1, // unlimited
      },
    }),
    prisma.user.upsert({
      where: { email: 'bob@startupsaarthi.dev' },
      update: {},
      create: {
        email: 'bob@startupsaarthi.dev',
        password: defaultPassword,
        name: 'Bob Patel',
        plan: Plan.FREE,
        reportsUsed: 1,
        reportsLimit: 1,
      },
    }),
    prisma.user.upsert({
      where: { email: 'charlie@startupsaarthi.dev' },
      update: {},
      create: {
        email: 'charlie@startupsaarthi.dev',
        password: defaultPassword,
        name: 'Charlie Nair',
        plan: Plan.PREMIUM,
        reportsUsed: 12,
        reportsLimit: -1,
      },
    }),
  ]);

  console.log('✅ Seeded 3 users.');

  // ── Ideas ──────────────────────────────────────────
  const idea1 = await prisma.idea.create({
    data: {
      userId: alice.id,
      name: 'AgriConnect',
      problem: 'Smallholder farmers in Tier-2/3 India lack direct market access and sell at 40% below MSP through middlemen.',
      targetUsers: 'Kisan farmers with < 5 acres landholding in UP, Bihar, MP',
      industry: Industry.AGRITECH,
      geography: Geography.INDIA_TIER2_3,
      stage: 'mvp',
      teamSize: 4,
      budget: '₹20L–₹50L',
      primarySkill: 'Engineering',
    },
  });

  const idea2 = await prisma.idea.create({
    data: {
      userId: alice.id,
      name: 'SkillBridge AI',
      problem: 'India produces 1.5M engineers annually but 70% are not job-ready. Existing bootcamps are expensive and generic.',
      targetUsers: 'Tier-3 college students and recent graduates in metros and Tier-2 cities',
      industry: Industry.EDTECH,
      geography: Geography.PAN_INDIA,
      stage: 'idea',
      teamSize: 2,
      budget: '< ₹5L',
      primarySkill: 'Product',
    },
  });

  const idea3 = await prisma.idea.create({
    data: {
      userId: bob.id,
      name: 'QuickVet',
      problem: 'India has 500M livestock animals but only 65,000 veterinarians. Rural farmers have zero access to quick vet care.',
      targetUsers: 'Dairy farmers and livestock owners in rural Maharashtra, Gujarat, Punjab',
      industry: Industry.HEALTHTECH,
      geography: Geography.INDIA_TIER2_3,
      stage: 'idea',
      teamSize: 3,
      budget: '₹5L–₹20L',
      primarySkill: 'Sales',
    },
  });

  const idea4 = await prisma.idea.create({
    data: {
      userId: charlie.id,
      name: 'ComplianceBot',
      problem: 'Indian MSMEs spend 200+ hours/year on GST, TDS, and ROC compliance with no affordable professional help.',
      targetUsers: 'MSME owners with ₹50L–₹10Cr annual turnover across all sectors',
      industry: Industry.LEGALTECH,
      geography: Geography.PAN_INDIA,
      stage: 'growth',
      teamSize: 8,
      budget: '> ₹1Cr',
      primarySkill: 'Engineering',
    },
  });

  const idea5 = await prisma.idea.create({
    data: {
      userId: charlie.id,
      name: 'NanoCredit',
      problem: 'Gig workers and blue-collar employees in India cannot access formal credit due to lack of payslips and credit history.',
      targetUsers: 'Delivery partners, domestic workers, and daily-wage earners in metro cities',
      industry: Industry.FINTECH,
      geography: Geography.INDIA_TIER1,
      stage: 'mvp',
      teamSize: 6,
      budget: '₹50L–₹1Cr',
      primarySkill: 'Engineering',
    },
  });

  console.log('✅ Seeded 5 ideas.');

  // ── Reports (5 with varied statuses) ──────────────
  const doneReport1 = await prisma.report.create({
    data: {
      ideaId: idea1.id,
      userId: alice.id,
      status: ReportStatus.DONE,
      ideaScore: 78,
      marketScore: 82,
      moatScore: 60,
      riskScore: 55,
      investorScore: 72,
      verdict: Verdict.WATCH,
      generationTimeMs: 18500,
      tokensUsed: 12400,
      marketData: {
        tam: { inrCr: 85000, usdM: 10200, cagr: 22.5 },
        sam: { inrCr: 12000, usdM: 1440 },
        som: { inrCr: 350, usdM: 42 },
        analysis: 'The Indian agritech market is at an inflection point driven by government push and smartphone penetration in rural areas.',
        icp: 'Male farmers aged 35–55 with 2–5 acres landholding, smartphone literate, in UP/MP/Bihar.',
        tailwinds: ['PM Kisan scheme awareness driving digital adoption', 'eNAM platform expansion', 'JioPhone penetration in rural India'],
        governmentSchemes: ['PM Kisan (₹6000/year direct benefit)', 'APMC bypass policy in 22 states'],
      },
      competitorData: {
        competitors: [
          { name: 'DeHaat', type: 'Direct', hq: 'Patna, India', fundingStage: 'Series D', totalFunding: '$169M', weakness: 'Operations limited to East India', pricing: 'Free for farmers, B2B2C model' },
          { name: 'AgroStar', type: 'Direct', hq: 'Pune, India', fundingStage: 'Series C', totalFunding: '$97M', weakness: 'Input-focused, lacks market linkage', pricing: 'E-commerce margin model' },
        ],
      },
      mvpData: {
        phases: [
          { phase: 1, title: 'Farmer Onboarding', duration: '6 weeks', tasks: ['WhatsApp-first registration flow', 'KYC via Aadhaar', 'Crop listing UI'], milestone: '500 registered farmers' },
        ],
      },
    },
  });

  await prisma.report.create({
    data: {
      ideaId: idea2.id,
      userId: alice.id,
      status: ReportStatus.DONE,
      ideaScore: 85,
      marketScore: 90,
      moatScore: 65,
      riskScore: 48,
      investorScore: 81,
      verdict: Verdict.FUND,
      generationTimeMs: 22100,
      tokensUsed: 15800,
      marketData: { tam: { inrCr: 420000, usdM: 50400, cagr: 18.2 } },
    },
  });

  await prisma.report.create({
    data: {
      ideaId: idea3.id,
      userId: bob.id,
      status: ReportStatus.DONE,
      ideaScore: 71,
      marketScore: 68,
      moatScore: 72,
      riskScore: 60,
      investorScore: 68,
      verdict: Verdict.WATCH,
      generationTimeMs: 19800,
      tokensUsed: 11200,
      marketData: { tam: { inrCr: 22000, usdM: 2640, cagr: 14.5 } },
    },
  });

  await prisma.report.create({
    data: {
      ideaId: idea4.id,
      userId: charlie.id,
      status: ReportStatus.PROCESSING,
      generationTimeMs: null,
      tokensUsed: 0,
    },
  });

  await prisma.report.create({
    data: {
      ideaId: idea5.id,
      userId: charlie.id,
      status: ReportStatus.FAILED,
      errorMessage: 'Anthropic API rate limit exceeded during VC agent call.',
      generationTimeMs: 5200,
      tokensUsed: 3100,
    },
  });

  console.log('✅ Seeded 5 reports.');

  // ── Usage Logs ──────────────────────────────────────
  await prisma.usageLog.createMany({
    data: [
      { userId: alice.id, action: 'report.generate', metadata: { reportId: doneReport1.id, ideaId: idea1.id } },
      { userId: bob.id, action: 'report.generate', metadata: { ideaId: idea3.id } },
      { userId: charlie.id, action: 'payment.success', metadata: { plan: 'PREMIUM', amount: 299900 } },
    ],
  });

  console.log('✅ Seeded usage logs.');
  console.log('\n🎉 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
