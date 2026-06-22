"use client";

import * as React from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { ReportTrendChart } from "@/components/features/ReportTrendChart";
import { IndustryDistChart } from "@/components/features/IndustryDistChart";

const mockReports = [
  {
    initials: "NX",
    name: "Nexus Quantum",
    sector: "DeepTech",
    evaluated: "2h ago",
    score: 92.5,
    scoreColor: "text-secondary",
  },
  {
    initials: "AL",
    name: "Altruist Health",
    sector: "MedTech",
    evaluated: "1d ago",
    score: 81.0,
    scoreColor: "text-on-surface",
  },
  {
    initials: "SY",
    name: "SynthOS",
    sector: "Enterprise AI",
    evaluated: "2d ago",
    score: 76.4,
    scoreColor: "text-on-surface",
  },
  {
    initials: "VE",
    name: "Veda Logistics",
    sector: "Supply Chain",
    evaluated: "4d ago",
    score: 64.2,
    scoreColor: "text-on-surface-variant",
  },
];

const sectorVectors = [
  {
    name: "Generative Infrastructure",
    width: "85%",
    color: "bg-secondary",
    confidence: "High confidence",
    count: 42,
    trending: "trending_up",
    trendColor: "text-secondary",
  },
  {
    name: "Climate Tech (Hardware)",
    width: "68%",
    color: "bg-secondary",
    confidence: "Medium confidence",
    count: 18,
    trending: "trending_up",
    trendColor: "text-secondary",
  },
  {
    name: "Consumer Fintech",
    width: "45%",
    color: "bg-tertiary-fixed-dim",
    confidence: "Neutral vector",
    count: 56,
    trending: "trending_flat",
    trendColor: "text-outline-variant",
  },
];

export default function DashboardPage() {
  const [reports, setReports] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const data = await apiClient("/api/v1/reports");
        setReports(data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen flex selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* ── SideNavBar ───────────────────────────────────────────── */}
      <nav className="bg-[#131b2e] text-on-primary font-headline text-sm font-medium tracking-wide h-screen w-64 fixed left-0 top-0 z-40 shadow-[4px_0_24px_rgba(0,0,0,0.1)] flex flex-col p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded bg-white/10 flex-shrink-0 flex items-center justify-center">
            <span
              className="material-symbols-outlined text-white text-xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              analytics
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black text-white uppercase tracking-widest leading-none">
              Sovereign Analyst
            </span>
            <span className="text-xs text-slate-400 mt-1">
              startupIQ
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 flex flex-col gap-2 mt-8">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 bg-white/10 text-white rounded-lg font-bold transition-transform duration-200"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
            Dashboard
          </Link>
          <Link
            href="/compare"
            className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300"
          >
            <span className="material-symbols-outlined">compare_arrows</span>
            Compare Ideas
          </Link>
          <Link
            href="/competitors"
            className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300"
          >
            <span className="material-symbols-outlined">query_stats</span>
            Competitors
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300"
          >
            <span className="material-symbols-outlined">settings</span>
            Settings
          </Link>
        </div>

        {/* Main CTA */}
        <div className="px-2 w-full">
          <Link
            href="/validate/new"
            className="w-full bg-gradient-to-b from-primary-container to-[#0b1222] text-on-primary py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:opacity-95 transition-opacity"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            New Validation
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-auto flex flex-col gap-1">
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300"
          >
            <span className="material-symbols-outlined text-sm">
              help_outline
            </span>
            Help Center
          </a>
        </div>
      </nav>

      {/* ── Main Workspace ───────────────────────────────────────── */}
      <main className="flex-1 ml-64 p-10 pl-16 flex flex-col gap-12 max-w-7xl">
        {/* Header */}
        <header className="flex justify-between items-end">
          <div className="flex flex-col gap-2">
            <span className="font-body text-sm font-medium text-on-surface-variant uppercase tracking-widest">
              Intelligence Overview
            </span>
            <h1 className="font-headline text-5xl font-extrabold tracking-tight text-on-surface">
              Good morning
            </h1>
          </div>
          <Link
            href="/validate/new"
            className="bg-primary-container text-on-primary px-6 py-3 rounded-xl font-headline font-semibold text-sm flex items-center gap-2 hover:bg-primary transition-colors institutional-transition shadow-sm"
          >
            <span className="material-symbols-outlined text-base">
              docs_add_on
            </span>
            Initiate Draft
          </Link>
        </header>

        {/* ── Metrics Row ────────────────────────────────────────── */}
        <section className="grid grid-cols-4 gap-6">
          <div className="bg-surface-container-lowest p-8 rounded-xl ambient-shadow hover:bg-surface-container-low institutional-transition flex flex-col gap-4">
            <span className="font-body text-sm text-on-surface-variant font-medium tracking-wide">
              Total Entities Validated
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-label text-4xl text-on-surface font-bold">
                {reports.length}
              </span>
              <span className="font-body text-xs text-secondary font-semibold">
                +12 this month
              </span>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-8 rounded-xl ambient-shadow hover:bg-surface-container-low institutional-transition flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-tertiary-fixed opacity-50 rounded-bl-full blur-xl" />
            <span className="font-body text-sm text-on-surface-variant font-medium tracking-wide">
              Mean Confidence Score
            </span>
            <div className="flex items-baseline gap-2 z-10">
              <span className="font-label text-4xl text-on-surface font-bold">
                78.4
              </span>
              <span className="font-label text-base text-on-surface-variant">
                /100
              </span>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-8 rounded-xl ambient-shadow hover:bg-surface-container-low institutional-transition flex flex-col gap-4">
            <span className="font-body text-sm text-on-surface-variant font-medium tracking-wide">
              Highest Indexed Tier
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-label text-4xl text-secondary font-bold">
                A+
              </span>
              <span className="font-body text-xs text-on-surface-variant font-medium">
                Top 5% bracket
              </span>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-8 rounded-xl ambient-shadow hover:bg-surface-container-low institutional-transition flex flex-col gap-4">
            <span className="font-body text-sm text-on-surface-variant font-medium tracking-wide">
              Active Synergies
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-label text-4xl text-on-surface font-bold">
                24
              </span>
              <span className="font-body text-xs text-on-surface-variant font-medium">
                Pending review
              </span>
            </div>
          </div>
        </section>

        {/* ── Main Content Grid ──────────────────────────────────── */}
        <div className="grid grid-cols-12 gap-12">
          {/* Left Column */}
          <div className="col-span-8 flex flex-col gap-12">
            {/* Recent Intelligence */}
            <section className="flex flex-col gap-6">
              <div className="flex justify-between items-baseline border-b border-outline-variant/15 pb-4">
                <h2 className="font-headline text-2xl font-bold tracking-tight text-on-surface">
                  Recent Intelligence
                </h2>
                <a
                  className="font-body text-sm text-secondary font-medium hover:underline decoration-secondary underline-offset-4"
                  href="#"
                >
                  View Full Archive
                </a>
              </div>
              <div className="flex flex-col gap-2">
                {loading ? (
                  <p className="text-on-surface-variant p-4">Loading intelligence...</p>
                ) : reports.length === 0 ? (
                  <p className="text-on-surface-variant p-4">No reports generated yet. Initiate a new validation.</p>
                ) : (
                reports.map((report: any) => (
                  <Link
                    key={report.id}
                    href={`/report/${report.id}`}
                    className="group flex items-center justify-between p-4 rounded-lg hover:bg-surface-container-lowest institutional-transition cursor-pointer"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded bg-surface-container-high flex items-center justify-center text-on-surface-variant font-headline font-bold uppercase">
                        {report.idea?.name ? report.idea.name.substring(0, 2) : "IQ"}
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-headline font-bold text-lg text-on-surface group-hover:text-primary-container institutional-transition">
                          {report.idea?.name || "Startup Idea"}
                        </span>
                        <span className="font-body text-xs text-on-surface-variant">
                          Sector: {report.idea?.industry || "N/A"} • Evaluated{" "}
                          {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="flex flex-col items-end">
                        <span
                          className={`font-label text-xl font-bold ${report.status === "COMPLETED" ? "text-secondary" : "text-on-surface-variant"}`}
                        >
                          {report.status === "COMPLETED" ? (report.data?.vcScore?.score || "N/A") : report.status}
                        </span>
                        <span className="font-body text-[10px] uppercase tracking-widest text-on-surface-variant">
                          Viability
                        </span>
                      </div>
                      <span className="material-symbols-outlined text-outline-variant group-hover:text-on-surface institutional-transition">
                        arrow_forward
                      </span>
                    </div>
                  </Link>
                )))}
              </div>
            </section>

            {/* Quick Validate Widget */}
            <section className="bg-surface-container-low p-8 rounded-xl flex flex-col gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-surface-container-lowest/40 to-transparent pointer-events-none" />
              <h3 className="font-headline text-xl font-bold tracking-tight text-on-surface z-10">
                Rapid Assessment
              </h3>
              <p className="font-body text-sm text-on-surface-variant z-10 max-w-md">
                Input a pitch deck URL or company domain for an instant
                preliminary thesis.
              </p>
              <div className="flex items-end gap-4 z-10">
                <div className="flex-1 flex flex-col gap-2">
                  <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant">
                    Target Asset
                  </label>
                  <input
                    className="w-full bg-transparent border-0 border-b border-outline-variant/30 px-0 py-2 focus:ring-0 focus:border-primary transition-colors text-on-surface font-body placeholder-on-surface-variant/40"
                    placeholder="e.g., synthos.ai"
                    type="text"
                  />
                </div>
                <Link
                  href="/validate/new"
                  className="bg-primary text-on-primary px-6 py-2 h-10 rounded text-sm font-medium hover:bg-primary-container transition-colors shadow-sm flex items-center gap-2"
                >
                  Execute
                  <span
                    className="material-symbols-outlined text-sm"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    bolt
                  </span>
                </Link>
              </div>
            </section>
          </div>

          {/* ── Right Column: Analytics ─────────────────────── */}
          <aside className="col-span-4 flex flex-col gap-8">
            <div className="bg-surface-container p-6 rounded-xl flex flex-col gap-6">
              <h3 className="font-headline text-lg font-bold tracking-tight text-on-surface border-b border-outline-variant/15 pb-3">
                Validation Velocity (30d)
              </h3>
              {!loading && reports.length > 0 ? (
                <ReportTrendChart reports={reports} />
              ) : (
                <div className="h-[180px] flex items-center justify-center text-on-surface-variant text-sm">Not enough data</div>
              )}
            </div>

            <div className="bg-surface-container p-6 rounded-xl flex flex-col gap-6">
              <h3 className="font-headline text-lg font-bold tracking-tight text-on-surface border-b border-outline-variant/15 pb-3">
                Industry Distribution
              </h3>
              {!loading && reports.length > 0 ? (
                <IndustryDistChart reports={reports} />
              ) : (
                <div className="h-[250px] flex items-center justify-center text-on-surface-variant text-sm">Not enough data</div>
              )}
            </div>

            {/* Analyst Note */}
            <div className="bg-surface-container-highest p-6 rounded-xl flex flex-col gap-4 border-l-4 border-primary-container">
              <div className="flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-primary-container"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  lightbulb
                </span>
                <h4 className="font-headline text-sm font-bold text-on-surface">
                  Analyst Note
                </h4>
              </div>
              <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                Validation models for Q3 have been updated to reflect increased
                weight on &ldquo;Path to Profitability&rdquo; metrics over raw
                user acquisition in the Consumer space.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
