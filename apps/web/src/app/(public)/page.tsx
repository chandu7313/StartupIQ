import * as React from "react";
import Link from "next/link";
import { cookies } from "next/headers";

export const metadata = {
  title: "StartupSaarthi AI - Validate your startup before you build it",
  description:
    "Editorial-First Intelligence trained on YC patterns and Indian institutional rigor. Enter your idea, get an actionable viability score.",
};

export default function LandingPage() {
  const token = cookies().get("token")?.value;

  return (
    <div className="bg-background text-on-background font-body antialiased selection:bg-secondary-container selection:text-on-secondary-container">
      {/* ── TopNavBar ─────────────────────────────────────────────── */}
      <nav className="bg-white/80 backdrop-blur-md w-full sticky top-0 z-50 border-b border-outline-variant/15 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex justify-between items-center h-16 px-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-xl font-extrabold tracking-tighter text-primary-container font-headline"
            >
              StartupSaarthi AI
            </Link>
            <div className="hidden md:flex gap-6 font-headline font-semibold tracking-tight text-on-surface-variant">
              <Link
                href="/"
                className="text-secondary border-b-2 border-secondary pb-1 transition-colors"
              >
                Home
              </Link>
              <Link
                href="#pricing"
                className="hover:text-secondary transition-colors duration-200"
              >
                Pricing
              </Link>
              <Link
                href="#how-it-works"
                className="hover:text-secondary transition-colors duration-200"
              >
                How it Works
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {!token ? (
              <>
                <Link
                  href="/sign-in"
                  className="text-on-surface-variant hover:text-secondary font-headline font-semibold tracking-tight transition-colors duration-200"
                >
                  Log In
                </Link>
                <Link
                  href="/sign-up"
                  className="bg-primary-container text-on-primary px-5 py-2.5 rounded-md font-headline font-semibold text-sm shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:bg-on-primary-fixed-variant transition-colors"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <Link
                href="/dashboard"
                className="bg-primary-container text-on-primary px-5 py-2.5 rounded-md font-headline font-semibold text-sm shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:bg-on-primary-fixed-variant transition-colors"
              >
                Go to Dashboard →
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main>
        {/* ── Hero Section ───────────────────────────────────────── */}
        <section className="pt-24 pb-32 px-8 max-w-5xl mx-auto text-center relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-surface-container-high/50 via-background to-background" />
          <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tight text-primary-container mb-6 leading-[1.1]">
            Validate your startup{" "}
            <br className="hidden md:block" />
            <span className="text-secondary">before you build it</span>
          </h1>
          <p className="font-body text-xl text-on-surface-variant max-w-2xl mx-auto mb-12">
            Editorial-First Intelligence trained on YC patterns and Indian
            institutional rigor. Enter your idea, get an actionable viability
            score.
          </p>
          <div className="max-w-2xl mx-auto bg-surface-container-lowest p-2 rounded-xl shadow-[0_8px_40px_rgba(27,27,29,0.06)] border border-outline-variant/15 flex flex-col md:flex-row gap-2 relative z-10">
            <div className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50">
                lightbulb
              </span>
              <input
                className="w-full bg-transparent border-none focus:ring-0 text-on-background font-body pl-12 py-4 placeholder:text-on-surface-variant/40"
                placeholder="Describe your startup idea in 1-2 sentences..."
                type="text"
              />
            </div>
            <Link
              href={token ? "/validate/new" : "/sign-in"}
              className="bg-primary-container text-on-primary px-8 py-4 rounded-lg font-headline font-bold hover:bg-on-primary-fixed-variant transition-colors whitespace-nowrap active:scale-[0.98] text-center"
            >
              Validate now
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-on-surface-variant/70 font-body">
            <span className="material-symbols-outlined text-[18px]">
              verified
            </span>
            <span>Powered by real-world founder data</span>
          </div>
        </section>

        {/* ── Trust Logos ─────────────────────────────────────────── */}
        <section className="border-y border-outline-variant/15 bg-surface-container-low/50 py-12">
          <div className="max-w-7xl mx-auto px-8">
            <p className="text-center font-label text-sm text-on-surface-variant/60 uppercase tracking-widest mb-8">
              Trusted Validation Methodology
            </p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="font-headline font-bold text-xl tracking-tighter text-on-background">
                IIT <span className="font-light">Alumni Base</span>
              </div>
              <div className="font-headline font-bold text-xl tracking-tighter text-on-background">
                IIM <span className="font-light">Case Studies</span>
              </div>
              <div className="font-headline font-bold text-xl tracking-tighter text-on-background">
                YC <span className="font-light">India Framework</span>
              </div>
              <div className="font-headline font-bold text-xl tracking-tighter text-on-background">
                NASSCOM <span className="font-light">Data</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── How It Works ───────────────────────────────────────── */}
        <section id="how-it-works" className="py-32 px-8 max-w-7xl mx-auto">
          <div className="mb-20 text-center md:text-left">
            <h2 className="font-headline text-4xl font-extrabold text-primary-container tracking-tight">
              The Validation Pipeline
            </h2>
            <p className="font-body text-lg text-on-surface-variant mt-4 max-w-xl">
              A rigorous, three-step analytical process to stress-test your
              thesis before committing capital or code.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "data_exploration",
                title: "1. Thesis Ingestion",
                desc: "Submit your core concept. Our models parse the problem space, proposed solution, and initial target market definitions.",
                color: "bg-primary-container text-on-primary",
              },
              {
                icon: "model_training",
                title: "2. Pattern Matching",
                desc: "Your thesis is cross-referenced against thousands of successful and failed startups to identify structural vulnerabilities.",
                color: "bg-secondary text-on-secondary",
              },
              {
                icon: "analytics",
                title: "3. Sovereign Report",
                desc: "Receive a comprehensive, brutally honest dossier detailing probability of success, critical risks, and necessary pivots.",
                color: "bg-surface-container-high text-on-background",
              },
            ].map((step) => (
              <div
                key={step.title}
                className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_4px_24px_rgba(27,27,29,0.04)] border border-outline-variant/15 group hover:bg-surface-container-low transition-colors duration-300"
              >
                <div
                  className={`w-12 h-12 ${step.color} rounded-lg flex items-center justify-center mb-8`}
                >
                  <span className="material-symbols-outlined">
                    {step.icon}
                  </span>
                </div>
                <h3 className="font-headline text-2xl font-bold text-primary-container mb-3">
                  {step.title}
                </h3>
                <p className="font-body text-on-surface-variant leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Intelligence Modules (Bento Grid) ──────────────────── */}
        <section className="py-24 px-8 bg-surface-container/30">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16">
              <h2 className="font-headline text-4xl font-extrabold text-primary-container tracking-tight">
                Intelligence Modules
              </h2>
              <p className="font-body text-lg text-on-surface-variant mt-4">
                Deep analytical tools designed for founders who demand rigor.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[240px]">
              {/* Large Feature */}
              <div className="md:col-span-2 md:row-span-2 bg-surface-container-lowest rounded-xl p-8 shadow-[0_4px_24px_rgba(27,27,29,0.04)] border border-outline-variant/15 flex flex-col justify-between group hover:bg-surface-container-low transition-colors">
                <div>
                  <span className="material-symbols-outlined text-secondary text-3xl mb-4">
                    radar
                  </span>
                  <h3 className="font-headline text-2xl font-bold text-primary-container mb-2">
                    Market Sentiment Radar
                  </h3>
                  <p className="font-body text-on-surface-variant">
                    Real-time analysis of target audience pain points to
                    validate actual need, not perceived need.
                  </p>
                </div>
                <div className="mt-8 bg-surface-container rounded-lg p-4 flex items-center justify-between">
                  <span className="font-label text-sm text-on-surface-variant">
                    Validation Score
                  </span>
                  <span className="font-label font-bold text-secondary text-xl">
                    84/100
                  </span>
                </div>
              </div>
              {/* Dark Feature */}
              <div className="md:col-span-2 bg-primary-container text-on-primary rounded-xl p-8 shadow-[0_8px_32px_rgba(19,27,46,0.15)] flex flex-col justify-center relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-10 translate-x-1/4 -translate-y-1/4">
                  <span className="material-symbols-outlined text-[120px]">
                    account_tree
                  </span>
                </div>
                <h3 className="font-headline text-xl font-bold mb-2 relative z-10">
                  Competitor Mapping Matrix
                </h3>
                <p className="font-body text-on-primary/80 relative z-10 text-sm">
                  Visualize your exact positioning against established
                  incumbents and stealth competitors in a four-quadrant
                  analysis.
                </p>
              </div>
              {/* Small Features */}
              <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_4px_24px_rgba(27,27,29,0.04)] border border-outline-variant/15 flex flex-col justify-between hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant mb-2">
                  request_quote
                </span>
                <div>
                  <h4 className="font-headline font-bold text-primary-container">
                    Pricing Elasticity
                  </h4>
                  <p className="font-body text-xs text-on-surface-variant mt-1">
                    Determine optimal MRR targets.
                  </p>
                </div>
              </div>
              <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_4px_24px_rgba(27,27,29,0.04)] border border-outline-variant/15 flex flex-col justify-between hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant mb-2">
                  group_add
                </span>
                <div>
                  <h4 className="font-headline font-bold text-primary-container">
                    CAC Projections
                  </h4>
                  <p className="font-body text-xs text-on-surface-variant mt-1">
                    Realistic acquisition costs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Pricing Section ────────────────────────────────────── */}
        <section id="pricing" className="py-32 px-8 max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-headline text-4xl font-extrabold text-primary-container tracking-tight">
              Invest in Certainty
            </h2>
            <p className="font-body text-lg text-on-surface-variant mt-4">
              Transparent pricing for institutional-grade intelligence.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 items-end">
            {/* Scout (Free) */}
            <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_4px_24px_rgba(27,27,29,0.04)] border border-outline-variant/15 flex flex-col">
              <h3 className="font-headline text-xl font-bold text-on-surface-variant mb-2">
                Scout
              </h3>
              <div className="mb-6">
                <span className="font-label text-4xl font-bold text-primary-container">
                  Free
                </span>
              </div>
              <p className="font-body text-sm text-on-surface-variant mb-8 border-b border-outline-variant/15 pb-8">
                Basic validation for early-stage conceptualization.
              </p>
              <ul className="space-y-4 mb-8 flex-1 font-body text-sm text-on-surface-variant">
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[18px] text-secondary">
                    check
                  </span>
                  1 Idea Validation/month
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[18px] text-secondary">
                    check
                  </span>
                  High-level Viability Score
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[18px] text-secondary">
                    check
                  </span>
                  Basic Competitor List
                </li>
              </ul>
              <Link
                href="/sign-up"
                className="w-full bg-surface-container-high text-on-background py-3 rounded-md font-headline font-bold hover:bg-surface-variant transition-colors text-center block"
              >
                Start Free
              </Link>
            </div>

            {/* Analyst (Pro — highlighted) */}
            <div className="bg-primary-container p-8 rounded-xl shadow-[0_12px_48px_rgba(19,27,46,0.2)] flex flex-col relative transform md:-translate-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-secondary text-on-secondary px-3 py-1 rounded-full font-label text-xs font-bold uppercase tracking-wider">
                Most Rigorous
              </div>
              <h3 className="font-headline text-xl font-bold text-on-primary mb-2">
                Analyst
              </h3>
              <div className="mb-6 flex items-end gap-1">
                <span className="font-label text-5xl font-bold text-on-primary">
                  $49
                </span>
                <span className="font-body text-on-primary/60 text-sm mb-1">
                  /mo
                </span>
              </div>
              <p className="font-body text-sm text-on-primary/80 mb-8 border-b border-on-primary/10 pb-8">
                Deep diligence for committed founders.
              </p>
              <ul className="space-y-4 mb-8 flex-1 font-body text-sm text-on-primary/90">
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[18px] text-secondary-container">
                    check
                  </span>
                  Unlimited Validations
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[18px] text-secondary-container">
                    check
                  </span>
                  Full Sovereign Report
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[18px] text-secondary-container">
                    check
                  </span>
                  Financial Projections
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[18px] text-secondary-container">
                    check
                  </span>
                  Pitch Deck Generator
                </li>
              </ul>
              <button className="w-full bg-secondary text-on-secondary py-3 rounded-md font-headline font-bold hover:bg-on-secondary-container transition-colors shadow-lg shadow-secondary/20 active:scale-[0.98]">
                Subscribe to Analyst
              </button>
            </div>

            {/* Institution (Premium) */}
            <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_4px_24px_rgba(27,27,29,0.04)] border border-outline-variant/15 flex flex-col">
              <h3 className="font-headline text-xl font-bold text-on-surface-variant mb-2">
                Institution
              </h3>
              <div className="mb-6 flex items-end gap-1">
                <span className="font-label text-4xl font-bold text-primary-container">
                  $199
                </span>
                <span className="font-body text-on-surface-variant/60 text-sm mb-1">
                  /mo
                </span>
              </div>
              <p className="font-body text-sm text-on-surface-variant mb-8 border-b border-outline-variant/15 pb-8">
                API access for incubators &amp; VCs.
              </p>
              <ul className="space-y-4 mb-8 flex-1 font-body text-sm text-on-surface-variant">
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[18px] text-secondary">
                    check
                  </span>
                  Everything in Analyst
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[18px] text-secondary">
                    check
                  </span>
                  API Access
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[18px] text-secondary">
                    check
                  </span>
                  Custom AI Model Tuning
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[18px] text-secondary">
                    check
                  </span>
                  Dedicated Analyst Support
                </li>
              </ul>
              <button className="w-full bg-surface-container-high text-on-background py-3 rounded-md font-headline font-bold hover:bg-surface-variant transition-colors">
                Contact Sales
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="bg-surface-container-low w-full py-12 px-8 border-t border-outline-variant/15">
        <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto">
          <div className="mb-4 md:mb-0">
            <span className="font-headline font-bold text-on-background">
              StartupSaarthi AI
            </span>
            <p className="font-body text-xs uppercase tracking-widest text-on-surface-variant mt-2">
              © 2024 StartupSaarthi AI. Editorial-First Intelligence.
            </p>
          </div>
          <div className="flex gap-6 font-body text-xs uppercase tracking-widest text-on-surface-variant">
            <a
              className="hover:text-on-background hover:underline decoration-secondary underline-offset-4 transition-opacity"
              href="#"
            >
              Privacy Policy
            </a>
            <a
              className="hover:text-on-background hover:underline decoration-secondary underline-offset-4 transition-opacity"
              href="#"
            >
              Terms of Service
            </a>
            <a
              className="hover:text-on-background hover:underline decoration-secondary underline-offset-4 transition-opacity"
              href="#"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
