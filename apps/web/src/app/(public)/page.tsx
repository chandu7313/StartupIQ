import * as React from "react";
import Link from "next/link";
import { cookies } from "next/headers";

export const metadata = {
  title: "VentureForge AI — From Idea to Investor-Ready Business in Minutes",
  description:
    "AI-powered startup intelligence & business operating system for Indian founders. Transform any idea into a validated, legally structured, investor-grade business blueprint.",
};

const features = {
  layer1: [
    { icon: "psychology", title: "AI Idea Validation", desc: "Analyze market demand, problem-solution fit, and differentiation potential with an Idea Clarity Score." },
    { icon: "scoreboard", title: "AI Startup Score™", desc: "6-dimension proprietary scoring: market potential, revenue feasibility, competitive advantage, scalability, investor attractiveness." },
    { icon: "area_chart", title: "Market Size Analyzer", desc: "TAM/SAM/SOM with India-specific sizing in ₹ Crore and USD Million. Real CAGR data and growth tailwinds." },
    { icon: "groups", title: "Competitor Intelligence", desc: "Direct & indirect competitor mapping, pricing analysis, SWOT, and competitive positioning whitespace." },
    { icon: "shield", title: "Risk Intelligence", desc: "5-category risk matrix (market, financial, regulatory, technical, operational) with severity badges and mitigation strategies." },
    { icon: "trending_up", title: "Success Predictor", desc: "Survival probability, funding probability, 3-year growth potential, and valuation trajectory." },
  ],
  layer2: [
    { icon: "gavel", title: "Business Formation Guide", desc: "Optimal legal structure recommendation — Sole Prop, LLP, Pvt Ltd, OPC — with tax implications and costs." },
    { icon: "checklist", title: "Registration & Compliance", desc: "State & industry-specific compliance checklist. Every registration with cost, timeline, and portal links." },
    { icon: "receipt_long", title: "Tax & Accounting Planner", desc: "Income tax, GST, TDS, advance tax calendar, filing deadlines, and accounting software recommendations." },
    { icon: "account_balance", title: "Business Banking Setup", desc: "Current account recommendations, payment gateways, UPI setup, and POS system suggestions." },
    { icon: "engineering", title: "Infrastructure Planner", desc: "Office/factory/warehouse requirements, equipment lists, utility needs, and total infrastructure cost estimates." },
    { icon: "badge", title: "Team Builder AI", desc: "Org structure, year-wise hiring roadmap, salary ranges (city-adjusted), and statutory requirements." },
    { icon: "code", title: "Technology Stack", desc: "For tech: full stack recommendation. For non-tech: CRM, ERP, billing, inventory, HR software." },
    { icon: "local_shipping", title: "Supplier Intelligence", desc: "Raw material sourcing, vendor categories, procurement strategy, and supply chain risk assessment." },
    { icon: "description", title: "SOP Generator", desc: "Ready-to-use SOPs for operations, HR, customer service, safety, and finance." },
    { icon: "savings", title: "Funding & Capital Plan", desc: "Startup capital + working capital calculation. PMEGP, Mudra, Startup India, angel, VC options ranked." },
    { icon: "monitoring", title: "Financial Projections", desc: "3-year P&L, cash flow, CAC/LTV, unit economics, and break-even analysis with charts." },
    { icon: "campaign", title: "AI Go-To-Market", desc: "30/60/90-day acquisition roadmap, content plan, SEO strategy, social media calendar." },
    { icon: "slideshow", title: "Pitch Deck Generator", desc: "12-slide investor-ready pitch deck, investment memo, executive summary — exportable as PDF." },
    { icon: "hub", title: "Investor Match Engine", desc: "VC fund & angel investor matching by sector, stage, and ticket size. Outreach templates included." },
  ],
  layer3: [
    { icon: "smart_toy", title: "AI Co-Founder", desc: "Persistent AI chatbot that remembers your full business context. Ask anything — strategy, legal, hiring, fundraising." },
    { icon: "science", title: "Startup Digital Twin", desc: "Live simulation engine: model pricing changes, team expansion, market entry scenarios, and competitor threats." },
    { icon: "rocket_launch", title: "Launch Checklist", desc: "Step-by-step, dependency-ordered launch checklist tailored to your industry and state." },
  ],
};

const pricingPlans = [
  {
    name: "Free",
    price: "₹0",
    period: "",
    desc: "Try VentureForge AI with basic validation.",
    features: ["1 report/month", "8 core validation modules", "Idea Clarity Score", "Basic competitor list", "No PDF export"],
    cta: "Start Free",
    href: "/sign-up",
    highlighted: false,
  },
  {
    name: "Starter",
    price: "₹499",
    period: "/month",
    desc: "Full Business DNA for serious founders.",
    features: ["5 reports/month", "All 27 modules", "PDF export", "Business Formation Guide", "Compliance checklist", "Financial projections"],
    cta: "Get Starter",
    href: "/sign-up",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "₹1,999",
    period: "/month",
    desc: "Unlimited intelligence for growth-stage founders.",
    features: ["Unlimited reports", "Everything in Starter", "AI Co-Founder chat", "Startup Digital Twin", "Market monitoring", "Priority generation"],
    cta: "Go Pro",
    href: "/sign-up",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "₹9,999",
    period: "/month",
    desc: "For incubators, accelerators & angel networks.",
    features: ["Everything in Pro", "White-label reports", "API access", "Incubator dashboard", "Bulk report generation", "Dedicated support"],
    cta: "Contact Sales",
    href: "/sign-up",
    highlighted: false,
  },
];

export default function LandingPage() {
  const token = cookies().get("token")?.value;

  return (
    <div className="bg-background text-on-background font-body antialiased selection:bg-secondary-container selection:text-on-secondary-container">
      {/* ── TopNavBar ─────────────────────────────────────────────── */}
      <nav className="bg-white/80 backdrop-blur-md w-full sticky top-0 z-50 border-b border-outline-variant/15 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex justify-between items-center h-16 px-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
            </div>
            <Link href="/" className="text-xl font-extrabold tracking-tighter text-primary-container font-headline">
              VentureForge <span className="text-secondary font-medium text-sm">AI</span>
            </Link>
            <div className="hidden md:flex gap-6 font-headline font-semibold tracking-tight text-on-surface-variant ml-6">
              <Link href="/" className="text-secondary border-b-2 border-secondary pb-1 transition-colors">Home</Link>
              <Link href="#features" className="hover:text-secondary transition-colors duration-200">Features</Link>
              <Link href="#how-it-works" className="hover:text-secondary transition-colors duration-200">How it Works</Link>
              <Link href="#pricing" className="hover:text-secondary transition-colors duration-200">Pricing</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {!token ? (
              <>
                <Link href="/sign-in" className="text-on-surface-variant hover:text-secondary font-headline font-semibold tracking-tight transition-colors duration-200">Log In</Link>
                <Link href="/sign-up" className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-2.5 rounded-lg font-headline font-semibold text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:from-emerald-500 hover:to-teal-500 transition-all">
                  Get Started Free
                </Link>
              </>
            ) : (
              <Link href="/dashboard" className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-2.5 rounded-lg font-headline font-semibold text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all">
                Go to Dashboard →
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main>
        {/* ── Hero Section ───────────────────────────────────────── */}
        <section className="pt-24 pb-32 px-8 max-w-5xl mx-auto text-center relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50/60 via-background to-background" />
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full font-label text-sm font-semibold mb-8 border border-emerald-200">
            <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
            India&apos;s First AI Business Operating System
          </div>
          <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tight text-primary-container mb-6 leading-[1.1]">
            From idea to{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">investor-ready</span>
            <br className="hidden md:block" />
            business — in minutes
          </h1>
          <p className="font-body text-xl text-on-surface-variant max-w-2xl mx-auto mb-12">
            Transform any raw business idea into a fully validated, legally structured, operationally ready, and investor-grade blueprint — powered by 8 specialist AI agents.
          </p>
          <div className="max-w-2xl mx-auto bg-surface-container-lowest p-2 rounded-xl shadow-[0_8px_40px_rgba(27,27,29,0.06)] border border-outline-variant/15 flex flex-col md:flex-row gap-2 relative z-10">
            <div className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50">lightbulb</span>
              <input
                className="w-full bg-transparent border-none focus:ring-0 text-on-background font-body pl-12 py-4 placeholder:text-on-surface-variant/40"
                placeholder="Describe your startup idea in 1-2 sentences..."
                type="text"
              />
            </div>
            <Link
              href={token ? "/validate/new" : "/sign-in"}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-lg font-headline font-bold hover:from-emerald-500 hover:to-teal-500 transition-all whitespace-nowrap active:scale-[0.98] text-center shadow-lg shadow-emerald-500/20"
            >
              Generate Business DNA
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-on-surface-variant/70 font-body">
            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-emerald-500 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>27 AI modules</span>
            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-emerald-500 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>India-specific compliance</span>
            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-emerald-500 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>₹ INR projections</span>
          </div>
        </section>

        {/* ── Trust Logos ─────────────────────────────────────────── */}
        <section className="border-y border-outline-variant/15 bg-surface-container-low/50 py-12">
          <div className="max-w-7xl mx-auto px-8">
            <p className="text-center font-label text-sm text-on-surface-variant/60 uppercase tracking-widest mb-8">
              Built for the Indian Startup Ecosystem
            </p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              {["DPIIT", "Startup India", "MSME / Udyam", "NASSCOM", "FSSAI Compliant"].map((name) => (
                <div key={name} className="font-headline font-bold text-lg tracking-tighter text-on-background">{name}</div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ───────────────────────────────────────── */}
        <section id="how-it-works" className="py-32 px-8 max-w-7xl mx-auto">
          <div className="mb-20 text-center">
            <h2 className="font-headline text-4xl font-extrabold text-primary-container tracking-tight">
              3-Layer Intelligence Architecture
            </h2>
            <p className="font-body text-lg text-on-surface-variant mt-4 max-w-2xl mx-auto">
              Where most tools stop at idea validation, VentureForge AI goes all the way — from the first spark to a 12-month execution roadmap.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: "psychology", title: "Layer 1 — Validation Intelligence", desc: "Is this idea worth pursuing? AI analyzes market demand, competitors, risks, and success probability before any money is spent.", color: "from-blue-500 to-indigo-600" },
              { icon: "domain", title: "Layer 2 — Business Formation Engine", desc: "How do I legally and operationally start? Legal structure, compliance, tax, team, infrastructure, SOPs, funding, and financials.", color: "from-emerald-500 to-teal-600" },
              { icon: "rocket_launch", title: "Layer 3 — Growth & Monitoring", desc: "How do I scale and stay updated? AI Co-Founder, Digital Twin simulation, launch checklist, and live market monitoring.", color: "from-orange-500 to-amber-600" },
            ].map((layer) => (
              <div key={layer.title} className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_4px_24px_rgba(27,27,29,0.04)] border border-outline-variant/15 group hover:shadow-[0_8px_40px_rgba(27,27,29,0.08)] transition-all duration-300">
                <div className={`w-12 h-12 bg-gradient-to-br ${layer.color} rounded-lg flex items-center justify-center mb-8`}>
                  <span className="material-symbols-outlined text-white">{layer.icon}</span>
                </div>
                <h3 className="font-headline text-xl font-bold text-primary-container mb-3">{layer.title}</h3>
                <p className="font-body text-on-surface-variant leading-relaxed">{layer.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Feature Modules (Layer 1) ──────────────────────────── */}
        <section id="features" className="py-24 px-8 bg-surface-container/30">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16 text-center">
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full font-label text-sm font-semibold mb-4 border border-blue-200">Layer 1</div>
              <h2 className="font-headline text-4xl font-extrabold text-primary-container tracking-tight">Validation Intelligence</h2>
              <p className="font-body text-lg text-on-surface-variant mt-4">6 AI modules to determine if your idea is worth pursuing.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.layer1.map((f) => (
                <div key={f.title} className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_4px_24px_rgba(27,27,29,0.04)] border border-outline-variant/15 hover:shadow-[0_8px_40px_rgba(27,27,29,0.08)] transition-all duration-300 group">
                  <span className="material-symbols-outlined text-secondary text-2xl mb-4 block">{f.icon}</span>
                  <h4 className="font-headline font-bold text-primary-container mb-2">{f.title}</h4>
                  <p className="font-body text-sm text-on-surface-variant">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Feature Modules (Layer 2) ──────────────────────────── */}
        <section className="py-24 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16 text-center">
              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full font-label text-sm font-semibold mb-4 border border-emerald-200">Layer 2</div>
              <h2 className="font-headline text-4xl font-extrabold text-primary-container tracking-tight">Business Formation Engine</h2>
              <p className="font-body text-lg text-on-surface-variant mt-4">14 AI modules to legally structure, operationally build, and financially plan your business.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {features.layer2.map((f) => (
                <div key={f.title} className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_4px_24px_rgba(27,27,29,0.04)] border border-outline-variant/15 hover:shadow-[0_8px_40px_rgba(27,27,29,0.08)] transition-all duration-300">
                  <span className="material-symbols-outlined text-emerald-600 text-xl mb-3 block">{f.icon}</span>
                  <h4 className="font-headline font-bold text-sm text-primary-container mb-1.5">{f.title}</h4>
                  <p className="font-body text-xs text-on-surface-variant leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Feature Modules (Layer 3) ──────────────────────────── */}
        <section className="py-24 px-8 bg-surface-container/30">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16 text-center">
              <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-1.5 rounded-full font-label text-sm font-semibold mb-4 border border-orange-200">Layer 3</div>
              <h2 className="font-headline text-4xl font-extrabold text-primary-container tracking-tight">Growth & Monitoring System</h2>
              <p className="font-body text-lg text-on-surface-variant mt-4">AI Co-Founder, Digital Twin simulation, and launch execution tools.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.layer3.map((f) => (
                <div key={f.title} className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_4px_24px_rgba(27,27,29,0.04)] border border-outline-variant/15 hover:shadow-[0_8px_40px_rgba(27,27,29,0.08)] transition-all duration-300 group">
                  <span className="material-symbols-outlined text-orange-500 text-3xl mb-4 block">{f.icon}</span>
                  <h4 className="font-headline text-xl font-bold text-primary-container mb-2">{f.title}</h4>
                  <p className="font-body text-on-surface-variant">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Business DNA Output ──────────────────────────────────── */}
        <section className="py-24 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16 text-center">
              <h2 className="font-headline text-4xl font-extrabold text-primary-container tracking-tight">The Business DNA Output</h2>
              <p className="font-body text-lg text-on-surface-variant mt-4">A living document organized into 14 dimensions — your complete startup blueprint.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {[
                "Business Model", "Legal Setup", "Compliance", "Tax Structure",
                "Products/Services", "Team & HR", "Infrastructure", "Technology",
                "Marketing & GTM", "Funding Plan", "Operations & SOPs",
                "Supplier Strategy", "Financial Projections", "Growth Roadmap",
              ].map((dim) => (
                <div key={dim} className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/50 rounded-lg px-3 py-4 text-center">
                  <span className="font-headline text-xs font-bold text-emerald-800 leading-tight">{dim}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing Section ────────────────────────────────────── */}
        <section id="pricing" className="py-32 px-8 bg-surface-container/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="font-headline text-4xl font-extrabold text-primary-container tracking-tight">Simple, Transparent Pricing</h2>
              <p className="font-body text-lg text-on-surface-variant mt-4">Start free. Upgrade when you&apos;re ready to build.</p>
            </div>
            <div className="grid md:grid-cols-4 gap-6 items-end">
              {pricingPlans.map((plan) => (
                <div key={plan.name} className={`p-8 rounded-xl flex flex-col relative ${plan.highlighted ? "bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-[0_12px_48px_rgba(16,185,129,0.25)] transform md:-translate-y-4" : "bg-surface-container-lowest shadow-[0_4px_24px_rgba(27,27,29,0.04)] border border-outline-variant/15"}`}>
                  {plan.highlighted && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-400 text-amber-900 px-3 py-1 rounded-full font-label text-xs font-bold uppercase tracking-wider">Most Popular</div>
                  )}
                  <h3 className={`font-headline text-xl font-bold mb-2 ${plan.highlighted ? "text-white" : "text-on-surface-variant"}`}>{plan.name}</h3>
                  <div className="mb-6 flex items-end gap-1">
                    <span className={`font-label text-4xl font-bold ${plan.highlighted ? "text-white" : "text-primary-container"}`}>{plan.price}</span>
                    {plan.period && <span className={`font-body text-sm mb-1 ${plan.highlighted ? "text-white/60" : "text-on-surface-variant/60"}`}>{plan.period}</span>}
                  </div>
                  <p className={`font-body text-sm mb-8 border-b pb-8 ${plan.highlighted ? "text-white/80 border-white/10" : "text-on-surface-variant border-outline-variant/15"}`}>{plan.desc}</p>
                  <ul className={`space-y-3 mb-8 flex-1 font-body text-sm ${plan.highlighted ? "text-white/90" : "text-on-surface-variant"}`}>
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-3">
                        <span className={`material-symbols-outlined text-[18px] ${plan.highlighted ? "text-amber-300" : "text-secondary"}`}>check</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.href} className={`w-full py-3 rounded-lg font-headline font-bold text-center block transition-all active:scale-[0.98] ${plan.highlighted ? "bg-white text-emerald-700 hover:bg-white/90 shadow-lg" : "bg-surface-container-high text-on-background hover:bg-surface-variant"}`}>
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Real Output Example ──────────────────────────────────── */}
        <section className="py-24 px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-headline text-4xl font-extrabold text-primary-container tracking-tight">Real Output Example</h2>
              <p className="font-body text-lg text-on-surface-variant mt-4">Input: &ldquo;Organic Tomato Sauce Manufacturing Business in Punjab&rdquo;</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: "Idea Score", value: "74/100", icon: "psychology" },
                { label: "Market Size", value: "₹8,400 Cr", icon: "area_chart" },
                { label: "CAGR", value: "14%", icon: "trending_up" },
                { label: "Legal Structure", value: "Pvt Ltd", icon: "gavel" },
                { label: "Registrations", value: "9 required", icon: "checklist" },
                { label: "Machinery Cost", value: "₹18-25L", icon: "precision_manufacturing" },
                { label: "Factory Space", value: "3,000 sq ft", icon: "factory" },
                { label: "Break-even", value: "Month 14", icon: "monitoring" },
                { label: "Year 2 Revenue", value: "₹2.1 Cr", icon: "payments" },
                { label: "Startup Capital", value: "₹35L", icon: "savings" },
                { label: "SOPs Generated", value: "19", icon: "description" },
                { label: "Launch Steps", value: "15", icon: "rocket_launch" },
              ].map((item) => (
                <div key={item.label} className="bg-surface-container-lowest rounded-lg p-4 border border-outline-variant/15 flex items-center gap-4">
                  <span className="material-symbols-outlined text-emerald-600 text-xl">{item.icon}</span>
                  <div>
                    <p className="font-label text-xs text-on-surface-variant uppercase tracking-wider">{item.label}</p>
                    <p className="font-label text-lg font-bold text-on-surface">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Section ──────────────────────────────────────────── */}
        <section className="py-24 px-8 bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-headline text-4xl font-extrabold tracking-tight mb-6">Ready to forge your venture?</h2>
            <p className="font-body text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              Stop spending ₹2-5 lakhs on CAs, lawyers, and consultants. Get your complete Business DNA in minutes.
            </p>
            <Link href="/sign-up" className="inline-block bg-white text-emerald-700 px-10 py-4 rounded-lg font-headline font-bold text-lg shadow-lg hover:bg-white/90 transition-all active:scale-[0.98]">
              Start Building for Free →
            </Link>
          </div>
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="bg-surface-container-low w-full py-12 px-8 border-t border-outline-variant/15">
        <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto">
          <div className="mb-4 md:mb-0">
            <span className="font-headline font-bold text-on-background">VentureForge AI</span>
            <p className="font-body text-xs text-on-surface-variant mt-2">
              © 2025 VentureForge AI. The Complete AI Business Operating System for Indian Entrepreneurs.
            </p>
          </div>
          <div className="flex gap-6 font-body text-xs uppercase tracking-widest text-on-surface-variant">
            <a className="hover:text-on-background hover:underline decoration-secondary underline-offset-4 transition-opacity" href="#">Privacy Policy</a>
            <a className="hover:text-on-background hover:underline decoration-secondary underline-offset-4 transition-opacity" href="#">Terms of Service</a>
            <a className="hover:text-on-background hover:underline decoration-secondary underline-offset-4 transition-opacity" href="#">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
