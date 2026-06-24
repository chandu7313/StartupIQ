import React from 'react';
import { Metadata, ResolvingMetadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Props {
  params: { token: string };
}

async function getPublicReport(token: string) {
  // Use absolute URL since this runs on the server
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  try {
    const res = await fetch(`${API_URL}/api/v1/reports/public/${token}`, {
      next: { revalidate: 60 }, // Cache for 60s
    });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Failed to fetch public report');
    }
    return res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const report = await getPublicReport(params.token);
  
  if (!report) {
    return { title: 'Report Not Found | VentureForge AI' };
  }

  const title = `Startup Analysis: ${report.idea?.name || 'Validated Idea'} | VentureForge AI`;
  const description = report.marketData?.analysis?.substring(0, 160) || 'Detailed AI validation report for this startup idea.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'VentureForge AI',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function PublicSharePage({ params }: Props) {
  const report = await getPublicReport(params.token);

  if (!report) {
    notFound();
  }

  return (
    <div className="bg-surface min-h-screen text-on-surface font-body pb-20">
      
      {/* ── Top CTA Banner ────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-primary to-secondary text-on-primary py-3 px-6 flex justify-between items-center sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
          <span className="font-headline font-bold uppercase tracking-widest text-sm">VentureForge AI AI</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium hidden md:inline">Validate your own startup idea in 60 seconds.</span>
          <Link 
            href="/auth/register" 
            className="bg-white text-primary px-4 py-1.5 rounded-full text-sm font-bold hover:scale-105 transition-transform"
          >
            Get Started Free
          </Link>
        </div>
      </div>

      {/* ── Report Content (Read-Only) ────────────────────────────────── */}
      <main className="max-w-4xl mx-auto mt-12 px-6">
        
        <header className="mb-12 border-b border-outline-variant/20 pb-8 relative">
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
             <span className="material-symbols-outlined text-9xl">verified</span>
          </div>
          <span className="text-sm font-bold uppercase tracking-widest text-secondary mb-2 block">AI Validated Thesis</span>
          <h1 className="text-5xl font-headline font-extrabold mb-4 pr-20">{report.idea?.name || 'Unknown Idea'}</h1>
          <p className="text-lg text-on-surface-variant max-w-2xl leading-relaxed">{report.idea?.description}</p>
          
          <div className="flex gap-4 mt-6">
            <span className="px-3 py-1 bg-surface-container rounded-md text-sm font-medium">{report.idea?.industry}</span>
            <span className="px-3 py-1 bg-surface-container rounded-md text-sm font-medium">{report.idea?.stage}</span>
            <span className="px-3 py-1 bg-surface-container rounded-md text-sm font-medium">Score: {report.investorScore}/100</span>
          </div>
        </header>

        {/* Executive Summary */}
        <section className="mb-12 bg-surface-container-lowest p-8 rounded-2xl ambient-shadow border border-outline-variant/10">
          <h2 className="text-2xl font-headline font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">psychology</span> Executive Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-bold text-on-surface-variant uppercase mb-2">Market Verdict</h3>
              <p className="text-on-surface leading-relaxed">{report.marketData?.analysis || 'No data available.'}</p>
            </div>
            <div>
               <h3 className="text-sm font-bold text-on-surface-variant uppercase mb-2">Investment Verdict</h3>
               <p className="text-xl font-bold text-secondary mb-2">{report.verdict}</p>
               <p className="text-on-surface leading-relaxed">{report.monetizationData?.fundingRecommendation || 'No recommendation available.'}</p>
            </div>
          </div>
        </section>

        {/* Competitors */}
        <section className="mb-12">
          <h2 className="text-2xl font-headline font-bold mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">query_stats</span> Competitive Landscape
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(report.competitorData?.competitors || []).map((c: any, i: number) => (
              <div key={i} className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/20">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{c.name}</h3>
                  <span className="text-xs px-2 py-1 bg-surface-container rounded">{c.type}</span>
                </div>
                <p className="text-sm text-on-surface-variant mb-2"><span className="font-bold">Funding:</span> {c.fundingStage}</p>
                <p className="text-sm text-on-surface"><span className="font-bold text-error">Weakness:</span> {c.weakness}</p>
              </div>
            ))}
          </div>
        </section>

        {/* MVP Roadmap */}
        <section className="mb-12">
          <h2 className="text-2xl font-headline font-bold mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">architecture</span> MVP Roadmap
          </h2>
          <div className="flex flex-col gap-4">
            {(report.mvpData || []).map((m: any, i: number) => (
              <div key={i} className="bg-surface-container-lowest p-6 rounded-xl border-l-4 border-secondary flex flex-col md:flex-row gap-6">
                <div className="md:w-1/4">
                  <span className="text-sm font-bold text-on-surface-variant">Phase {m.phase}</span>
                  <h3 className="font-bold text-lg mt-1">{m.title}</h3>
                  <span className="text-xs text-secondary">{m.duration}</span>
                </div>
                <div className="md:w-3/4">
                  <ul className="list-disc pl-4 text-sm text-on-surface-variant space-y-1 mb-3">
                    {m.tasks?.map((t: string, j: number) => <li key={j}>{t}</li>)}
                  </ul>
                  <div className="bg-surface-container p-3 rounded text-sm"><span className="font-bold">Milestone:</span> {m.milestone}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* ── Footer Watermark ──────────────────────────────────────────── */}
      <footer className="text-center mt-20 pt-10 border-t border-outline-variant/10 text-on-surface-variant text-sm flex flex-col items-center gap-2">
        <span>Shared via <span className="font-bold text-on-surface">VentureForge AI AI</span></span>
        <Link href="/" className="hover:text-primary transition-colors hover:underline">Create your own validation report</Link>
      </footer>

    </div>
  );
}
