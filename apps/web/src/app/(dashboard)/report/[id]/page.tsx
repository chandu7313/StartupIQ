"use client";

import * as React from "react";
import Link from "next/link";
import { useReportSocket } from "@/hooks/useReportSocket";
import { apiClient } from "@/lib/api-client";
import { ReportProgressBar } from "@/components/features/ReportProgressBar";
import { DownloadReportBtn } from "@/components/features/DownloadReportBtn";
import { ShareReportBtn } from "@/components/features/ShareReportBtn";
import { NameGeneratorWidget } from "@/components/features/NameGeneratorWidget";

const gauges = [
  { label: "Market Potential", score: 85, offset: 37.68, color: "text-secondary" },
  { label: "Tech Moat", score: 70, offset: 75.36, color: "text-primary-container" },
  { label: "Team Execution", score: 90, offset: 25.12, color: "text-secondary" },
  { label: "Financial Health", score: 60, offset: 100.48, color: "text-tertiary-fixed-dim" },
];

const tabs = ["Market Analysis", "Product", "Competitors", "Financials", "Team", "Risks", "Cap Table", "ESG Impact"];

export default function ReportPage({ params }: { params: { id: string } }) {
  const [report, setReport] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const { status, percent, stage, message, position, estimatedWait, error } = useReportSocket(params.id);

  React.useEffect(() => {
    async function loadReport() {
      try {
        const data = await apiClient(`/api/v1/reports/${params.id}`);
        setReport(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [params.id, percent]); // Re-fetch when progress updates

  // If WebSocket says DONE, or DB report says DONE, we show the full UI.
  const isFinished = status === 'DONE' || report?.status === "DONE";
  
  if (loading || (!isFinished && status !== 'DISCONNECTED')) {
    return (
      <ReportProgressBar 
        status={status}
        percent={percent}
        stage={stage}
        message={message}
        position={position}
        estimatedWait={estimatedWait}
        error={error}
      />
    );
  }

  const ideaName = report?.idea?.name || "Startup Idea";
  const industry = report?.idea?.industry || "Tech";
  const ideaStage = report?.idea?.stage || "Idea";
  const verdict = report?.data?.vcScore?.verdict || "Analysis Complete";
  const conviction = report?.data?.vcScore?.score || "N/A";

  return (
    <div className="bg-surface text-on-surface flex min-h-screen font-body">
      {/* ── SideNavBar ───────────────────────────────────────── */}
      <nav className="bg-[#131b2e] font-headline text-sm font-medium tracking-wide h-screen w-64 fixed left-0 top-0 z-40 shadow-[4px_0_24px_rgba(0,0,0,0.1)] flex-col p-6 space-y-8 hidden md:flex">
        <div className="flex flex-col mb-4">
          <div className="flex items-center gap-2 mb-2">
            <img src="/app-logo.png" alt="startupIQ Logo" className="h-6 w-6 object-contain" />
            <div className="text-lg font-black text-white uppercase tracking-widest">startupIQ</div>
          </div>
          <div className="text-slate-400 text-xs">Sovereign Analyst</div>
        </div>
        <Link href="/validate/new" className="bg-primary-container border border-green-500 text-green-500 rounded py-3 px-4 font-bold hover:bg-green-500 hover:text-white transition-all duration-300 w-full flex justify-center items-center gap-2">
          <span className="material-symbols-outlined text-lg">add</span>
          New Validation
        </Link>
        <div className="flex-grow flex flex-col space-y-2 mt-8">
          <Link href="/dashboard" className="text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-300 px-4 py-3 rounded-lg flex items-center gap-3">
            <span className="material-symbols-outlined">dashboard</span>Dashboard
          </Link>
          <Link href="/validate/new" className="text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-300 px-4 py-3 rounded-lg flex items-center gap-3">
            <span className="material-symbols-outlined">edit_note</span>Input
          </Link>
          <Link href="#" className="bg-white/10 text-white rounded-lg font-bold px-4 py-3 flex items-center gap-3">
            <span className="material-symbols-outlined">analytics</span>Reports
          </Link>
          <Link href="/dashboard" className="text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-300 px-4 py-3 rounded-lg flex items-center gap-3">
            <span className="material-symbols-outlined">settings</span>Settings
          </Link>
        </div>
        <div className="mt-auto pt-4 border-t border-white/10">
          <a href="#" className="text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-300 px-4 py-3 rounded-lg flex items-center gap-3">
            <span className="material-symbols-outlined">help_outline</span>Help Center
          </a>
        </div>
      </nav>

      {/* ── Main Content ─────────────────────────────────────── */}
      <main className="flex-1 md:ml-64 relative min-h-screen bg-surface">
        {/* Header */}
        <header className="glass-panel sticky top-0 z-30 px-10 py-6 flex justify-between items-center border-b border-outline-variant/15 bg-surface-container-lowest/85 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <h1 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight">{ideaName}</h1>
            <span className="bg-surface-container text-on-surface-variant font-label text-xs px-3 py-1 rounded-full uppercase tracking-wider font-semibold">{industry}</span>
            <span className="bg-secondary-container text-on-secondary-fixed font-label text-xs px-3 py-1 rounded-full uppercase tracking-wider font-semibold">{ideaStage}</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-on-surface hover:bg-surface-container-low rounded-lg transition-colors">
              <span className="material-symbols-outlined text-[20px]">compare_arrows</span>Compare
            </button>
            <ShareReportBtn reportId={params.id} initialToken={report.shareToken} />
            <DownloadReportBtn reportId={params.id} />
          </div>
        </header>

        <div className="px-10 py-12 max-w-7xl mx-auto space-y-12">
          {/* ── Verdict Section ───────────────────────────────── */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 bg-surface-container-lowest p-10 rounded-xl shadow-[0_8px_60px_-12px_rgba(27,27,29,0.08)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-secondary" />
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-secondary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                <h2 className="font-headline text-2xl font-bold text-on-surface">Analyst Verdict: {verdict}</h2>
              </div>
              <p className="font-body text-lg text-on-surface-variant leading-relaxed mb-8">
                {report?.data?.vcScore?.summary || report?.idea?.description || "No analysis summary available yet."}
              </p>
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-outline-variant/15">
                <div>
                  <p className="font-label text-xs text-on-tertiary-container uppercase tracking-widest mb-1">Conviction Score</p>
                  <p className="font-label text-3xl font-bold text-on-surface">{conviction}<span className="text-lg text-outline">/10</span></p>
                </div>
                <div>
                  <p className="font-label text-xs text-on-tertiary-container uppercase tracking-widest mb-1">Target Valuation</p>
                  <p className="font-label text-3xl font-bold text-on-surface">$45M</p>
                </div>
                <div>
                  <p className="font-label text-xs text-on-tertiary-container uppercase tracking-widest mb-1">Time Horizon</p>
                  <p className="font-label text-3xl font-bold text-on-surface">5-7<span className="text-lg text-outline">Yrs</span></p>
                </div>
              </div>
            </div>

            {/* Circular Gauges */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-4">
              {gauges.map((g) => (
                <div key={g.label} className="bg-surface-container-lowest p-6 rounded-xl ambient-shadow flex flex-col items-center justify-center">
                  <div className="relative w-20 h-20 mb-3">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle className="text-surface-container-high stroke-current" cx="50" cy="50" fill="transparent" r="40" strokeWidth="8" />
                      <circle className={`${g.color} stroke-current`} cx="50" cy="50" fill="transparent" r="40" strokeDasharray="251.2" strokeDashoffset={g.offset} strokeLinecap="round" strokeWidth="8" style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dashoffset 1s ease-in-out" }} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center font-label font-bold text-xl text-on-surface">{g.score}</div>
                  </div>
                  <span className="font-headline text-xs font-semibold text-on-surface-variant text-center">{g.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* AI Startup Naming Engine */}
          <NameGeneratorWidget idea={report?.idea?.description || ""} industry={report?.idea?.industry || ""} geography={report?.idea?.geography || ""} />

          {/* ── Tab Navigation ────────────────────────────────── */}
          <section>
            <div className="flex items-center gap-8 border-b border-outline-variant/15 mb-10 overflow-x-auto pb-4">
              {tabs.map((tab, i) => (
                <button key={tab} className={`font-headline text-lg whitespace-nowrap pb-2 transition-colors ${i === 0 ? "font-bold text-primary-container border-b-2 border-primary-container" : "font-medium text-on-surface-variant hover:text-primary-container"}`}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Market Analysis Content */}
            <div className="space-y-12">
              {/* TAM / SAM / SOM */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: "Total Addressable Market", icon: "public", value: "$14.2B", desc: "Global precision agriculture software and services market, projected to grow at 14% CAGR through 2030." },
                  { label: "Serviceable Addressable Market", icon: "map", value: "$4.8B", desc: "North American and European mid-to-large scale commercial farming operations focusing on row crops." },
                  { label: "Serviceable Obtainable Market", icon: "my_location", value: "$450M", desc: "Targeting 10% penetration within the SAM over the next 36 months.", valueColor: "text-secondary" },
                ].map((m) => (
                  <div key={m.label} className="bg-surface-container-low p-8 rounded-xl border border-transparent hover:bg-surface-container-lowest hover:shadow-[0_4px_40px_-6px_rgba(27,27,29,0.06)] transition-all duration-300 group">
                    <h3 className="font-headline text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-4 flex items-center justify-between">
                      {m.label}
                      <span className="material-symbols-outlined text-outline group-hover:text-secondary transition-colors text-[20px]">{m.icon}</span>
                    </h3>
                    <div className={`font-label text-4xl font-bold mb-2 ${m.valueColor || "text-on-surface"}`}>{m.value}</div>
                    <p className="font-body text-sm text-on-surface-variant leading-relaxed">{m.desc}</p>
                  </div>
                ))}
              </div>

              {/* Editorial + Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-5 space-y-6">
                  <h3 className="font-headline text-3xl font-extrabold text-on-surface leading-tight">Growth Vectors in Precision Ag</h3>
                  <p className="font-body text-base text-on-surface-variant leading-relaxed">
                    The transition from reactive to predictive farming is accelerating. FarmAI is positioned at the intersection of decreasing sensor costs and increasing compute availability at the edge.
                  </p>
                  <ul className="space-y-3 mt-4">
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      <span className="font-body text-sm text-on-surface-variant"><strong className="text-on-surface">Regulatory Tailwinds:</strong> EU Green Deal targets 50% reduction in pesticide use by 2030.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      <span className="font-body text-sm text-on-surface-variant"><strong className="text-on-surface">Labor Scarcity:</strong> Automated scouting reduces manual labor requirements by an estimated 40%.</span>
                    </li>
                  </ul>
                </div>
                {/* Chart */}
                <div className="lg:col-span-7 bg-surface-container-lowest p-8 rounded-xl ambient-shadow w-full">
                  <h4 className="font-headline text-sm font-semibold text-on-surface-variant mb-6 uppercase tracking-wider">Projected Revenue vs Competitor Baseline (in $M)</h4>
                  <div className="relative w-full h-72">
                    <div className="absolute left-0 top-0 bottom-8 w-10 flex flex-col justify-between font-label text-xs text-outline text-right pr-2">
                      <span>50</span><span>37.5</span><span>25</span><span>12.5</span><span>0</span>
                    </div>
                    <div className="absolute left-10 right-0 top-0 bottom-8 border-l border-b border-outline-variant/30">
                      <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                        <path d="M0,90 L20,85 L40,75 L60,65 L80,55 L100,50 L100,100 L0,100 Z" fill="rgba(211, 228, 254, 0.4)" stroke="#b7c8e1" strokeWidth="1.5" />
                        <path d="M0,95 L20,80 L40,55 L60,30 L80,15 L100,5 L100,100 L0,100 Z" fill="rgba(107, 255, 143, 0.2)" stroke="#006e2f" strokeWidth="2.5" />
                        <circle cx="20" cy="80" fill="#006e2f" r="1.5" />
                        <circle cx="40" cy="55" fill="#006e2f" r="1.5" />
                        <circle cx="60" cy="30" fill="#006e2f" r="1.5" />
                        <circle cx="80" cy="15" fill="#006e2f" r="1.5" />
                        <circle cx="100" cy="5" fill="#006e2f" r="1.5" />
                      </svg>
                    </div>
                    <div className="absolute left-10 right-0 bottom-0 h-8 flex justify-between items-end font-label text-xs text-outline px-2">
                      <span>2024</span><span>2025</span><span>2026</span><span>2027</span><span>2028</span><span>2029</span>
                    </div>
                  </div>
                  <div className="flex justify-center gap-6 mt-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-secondary" />
                      <span className="font-label text-xs text-on-surface-variant">FarmAI Projected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-tertiary-fixed-dim" />
                      <span className="font-label text-xs text-on-surface-variant">Market Avg</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
