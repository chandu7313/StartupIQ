"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PlanUpgradeModal } from "@/components/features/PlanUpgradeModal";
import { apiClient } from "@/lib/api-client";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LanguageToggle } from "@/components/features/LanguageToggle";

const steps = [
  { label: "Basics", num: 1 },
  { label: "Context", num: 2 },
  { label: "Confirm", num: 3 },
];

const industries = [
  "Fintech",
  "Healthtech",
  "SaaS",
  "E-commerce",
  "EdTech",
  "AgriTech",
  "DeepTech",
  "Climate Tech",
  "Consumer",
  "Enterprise AI",
  "Supply Chain",
  "Other",
];

const geographies = ["India", "US", "Europe", "Southeast Asia", "Global"];
const stages = ["Idea", "MVP", "Pre-Revenue", "Revenue", "Growth"];

export default function NewValidationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false);
  const [upgradeMessage, setUpgradeMessage] = React.useState("");
  const { t, language } = useLanguage();

  const [form, setForm] = React.useState({
    name: "",
    industry: "",
    problem: "",
    targetUsers: "",
    geography: "",
    stage: "",
    teamSize: "",
    budget: "",
    primarySkill: "",
    focusIndia: false,
  });

  const update = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 1. Create Idea
      const ideaResponse = await apiClient("/api/v1/ideas", {
        method: "POST",
        data: {
          name: form.name,
          description: form.problem,
          targetAudience: form.targetUsers,
          industry: form.industry,
          geography: form.focusIndia ? "India" : form.geography,
          stage: form.stage,
          teamSize: form.teamSize ? parseInt(form.teamSize) : 1,
          budget: form.budget,
          primarySkill: form.primarySkill,
        },
      });

      // 2. Queue Report Generation
      const reportResponse = await apiClient("/api/v1/reports/generate", {
        method: "POST",
        data: {
          ideaId: ideaResponse.id,
          ideaDescription: form.problem,
          industry: form.industry,
          geography: form.focusIndia ? "India" : form.geography,
          stage: form.stage,
          teamSize: form.teamSize ? parseInt(form.teamSize) : 1,
          budget: form.budget,
          language: language,
        },
      });

      toast.success("Validation submitted! Generating report...");
      router.push(`/report/${reportResponse.reportId}`);
    } catch (err: any) {
      if (err.status === 402) {
        setUpgradeMessage(err.message || "You've used your 1 free report this month.");
        setShowUpgradeModal(true);
      } else {
        toast.error(err.message || "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  const progressWidth =
    currentStep === 1 ? "25%" : currentStep === 2 ? "60%" : "100%";

  return (
    <div className="bg-surface text-on-surface flex h-screen overflow-hidden font-body">
      <PlanUpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)}
        message={upgradeMessage}
        onSuccess={() => {
          setShowUpgradeModal(false);
          handleSubmit();
        }}
      />
      {/* ── SideNavBar ───────────────────────────────────────── */}
      <nav className="bg-[#131b2e] h-screen w-64 fixed left-0 top-0 z-40 flex flex-col p-6 space-y-8 shadow-[4px_0_24px_rgba(0,0,0,0.1)]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <img src="/app-logo.png" alt="startupIQ Logo" className="h-6 w-6 object-contain" />
            <div className="text-lg font-black text-white uppercase tracking-widest font-headline">
              startupIQ
            </div>
          </div>
          <div className="font-headline text-sm font-medium tracking-wide text-slate-400 mt-1">
            Sovereign Analyst
          </div>
        </div>
        <div className="flex-1 flex flex-col space-y-2">
          <Link
            href="/dashboard"
            className="text-slate-400 hover:text-white hover:bg-white/5 font-headline text-sm font-medium tracking-wide flex items-center space-x-3 p-3 rounded-lg transition-all duration-300"
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </Link>
          <Link
            href="/validate/new"
            className="bg-white/10 text-white rounded-lg font-bold font-headline text-sm tracking-wide flex items-center space-x-3 p-3 transition-all duration-300"
          >
            <span className="material-symbols-outlined">edit_note</span>
            <span>Input</span>
          </Link>
          <Link
            href="/dashboard"
            className="text-slate-400 hover:text-white hover:bg-white/5 font-headline text-sm font-medium tracking-wide flex items-center space-x-3 p-3 rounded-lg transition-all duration-300"
          >
            <span className="material-symbols-outlined">analytics</span>
            <span>Reports</span>
          </Link>
          <Link
            href="/dashboard"
            className="text-slate-400 hover:text-white hover:bg-white/5 font-headline text-sm font-medium tracking-wide flex items-center space-x-3 p-3 rounded-lg transition-all duration-300"
          >
            <span className="material-symbols-outlined">settings</span>
            <span>Settings</span>
          </Link>
        </div>
        <div>
          <Link
            href="#"
            className="text-slate-400 hover:text-white hover:bg-white/5 font-headline text-sm font-medium tracking-wide flex items-center space-x-3 p-3 rounded-lg transition-all duration-300"
          >
            <span className="material-symbols-outlined">help_outline</span>
            <span>Help Center</span>
          </Link>
        </div>
      </nav>

      {/* ── Main Content ─────────────────────────────────────── */}
      <main className="ml-64 flex-1 h-full overflow-y-auto bg-surface">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-surface-container-lowest/80 backdrop-blur-md px-12 py-6 flex justify-between items-center border-b border-surface-container-high/50">
          <div>
            <h1 className="font-headline text-2xl font-bold text-on-surface tracking-tight">
              {t('nav.newReport')}
            </h1>
            <p className="font-body text-on-surface-variant text-sm mt-1">
              Provide initial parameters for preliminary analysis.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageToggle />
            <span className="material-symbols-outlined text-on-surface-variant">
              notifications
            </span>
            <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label text-sm font-bold">
              SA
            </div>
          </div>
        </header>

        <div className="px-12 py-10 max-w-5xl mx-auto pb-32">
          {/* ── Progress Tracker ──────────────────────────────── */}
          <div className="mb-12">
            <div className="flex justify-between items-center relative z-10">
              {steps.map((step) => (
                <div key={step.num} className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-label font-bold mb-2 shadow-sm transition-colors ${
                      currentStep >= step.num
                        ? "bg-primary-container text-on-primary"
                        : "bg-surface-container-high text-on-surface-variant"
                    }`}
                  >
                    {step.num}
                  </div>
                  <span
                    className={`font-label text-xs uppercase tracking-wider ${
                      currentStep >= step.num
                        ? "text-on-surface font-semibold"
                        : "text-on-surface-variant"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="relative -mt-11 mb-11 h-0.5 bg-surface-container-high w-full z-0">
              <div
                className="absolute top-0 left-0 h-full bg-primary-container transition-all duration-500"
                style={{ width: progressWidth }}
              />
            </div>
          </div>

          {/* ── Form Container ────────────────────────────────── */}
          <div className="bg-surface-container-lowest rounded-xl p-10 ambient-shadow border border-surface-container-high/30">
            {/* Step 1: Basics */}
            {currentStep === 1 && (
              <>
                <h2 className="font-headline text-xl font-bold text-on-surface mb-8">
                  Basic Parameters
                </h2>
                <div className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div>
                      <label className="font-label text-sm text-on-surface-variant block mb-1">
                        {t('field.startupName')}
                      </label>
                      <input
                        className="w-full bg-transparent border-0 border-b border-outline-variant/50 focus:border-primary focus:ring-0 px-0 py-2 font-body text-on-background transition-colors"
                        placeholder={t('field.startupName.placeholder')}
                        value={form.name}
                        onChange={(e) => update("name", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="font-label text-sm text-on-surface-variant block mb-1">
                        Primary Industry
                      </label>
                      <div className="relative">
                        <select
                          className="w-full bg-transparent border-0 border-b border-outline-variant/50 focus:border-primary focus:ring-0 px-0 py-2 font-body text-on-background appearance-none transition-colors"
                          value={form.industry}
                          onChange={(e) => update("industry", e.target.value)}
                        >
                          <option value="" disabled>
                            Select industry sector
                          </option>
                          {industries.map((i) => (
                            <option key={i}>{i}</option>
                          ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-0 top-2 text-on-surface-variant pointer-events-none">
                          expand_more
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="font-label text-sm text-on-surface-variant block mb-1">
                      {t('field.problem')}
                    </label>
                    <textarea
                      className="w-full bg-transparent border-0 border-b border-outline-variant/50 focus:border-primary focus:ring-0 px-0 py-2 font-body text-on-background resize-none transition-colors"
                      placeholder={t('field.problem.placeholder')}
                      rows={3}
                      value={form.problem}
                      onChange={(e) => update("problem", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="font-label text-sm text-on-surface-variant block mb-1">
                      Target Audience / Demographic
                    </label>
                    <input
                      className="w-full bg-transparent border-0 border-b border-outline-variant/50 focus:border-primary focus:ring-0 px-0 py-2 font-body text-on-background transition-colors"
                      placeholder="Who is the primary user?"
                      value={form.targetUsers}
                      onChange={(e) => update("targetUsers", e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Context */}
            {currentStep === 2 && (
              <>
                <h2 className="font-headline text-xl font-bold text-on-surface mb-8">
                  Context &amp; Parameters
                </h2>
                <div className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div>
                      <label className="font-label text-sm text-on-surface-variant block mb-1">
                        Geography
                      </label>
                      <select
                        className="w-full bg-transparent border-0 border-b border-outline-variant/50 focus:border-primary focus:ring-0 px-0 py-2 font-body text-on-background appearance-none transition-colors"
                        value={form.geography}
                        onChange={(e) => update("geography", e.target.value)}
                      >
                        <option value="" disabled>
                          Select geography
                        </option>
                        {geographies.map((g) => (
                          <option key={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="font-label text-sm text-on-surface-variant block mb-1">
                        {t('field.stage')}
                      </label>
                      <select
                        className="w-full bg-transparent border-0 border-b border-outline-variant/50 focus:border-primary focus:ring-0 px-0 py-2 font-body text-on-background transition-colors appearance-none"
                        value={form.stage}
                        onChange={(e) => update("stage", e.target.value)}
                      >
                        <option value="" disabled>Select stage</option>
                        {stages.map((stg) => (
                          <option key={stg} value={stg} className="bg-surface">
                            {stg}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div>
                      <label className="font-label text-sm text-on-surface-variant block mb-1">
                        {t('field.teamSize')}
                      </label>
                      <input
                        type="number"
                        className="w-full bg-transparent border-0 border-b border-outline-variant/50 focus:border-primary focus:ring-0 px-0 py-2 font-body text-on-background transition-colors"
                        placeholder="e.g. 2"
                        value={form.teamSize}
                        onChange={(e) => update("teamSize", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="font-label text-sm text-on-surface-variant block mb-1">
                        {t('field.budget')}
                      </label>
                      <input
                        className="w-full bg-transparent border-0 border-b border-outline-variant/50 focus:border-primary focus:ring-0 px-0 py-2 font-body text-on-background transition-colors"
                        placeholder={t('field.budget.placeholder')}
                        value={form.budget}
                        onChange={(e) => update("budget", e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-label text-sm text-on-surface-variant block mb-1">
                      {t('field.primarySkill')}
                    </label>
                    <input
                      className="w-full bg-transparent border-0 border-b border-outline-variant/50 focus:border-primary focus:ring-0 px-0 py-2 font-body text-on-background transition-colors"
                      placeholder={t('field.primarySkill.placeholder')}
                      value={form.primarySkill}
                      onChange={(e) => update("primarySkill", e.target.value)}
                    />
                  </div>
                  <div className="flex items-center space-x-3 mt-6">
                    <input
                      type="checkbox"
                      id="focusIndia"
                      checked={form.focusIndia}
                      onChange={(e) => update("focusIndia", e.target.checked)}
                      className="w-5 h-5 rounded border-gray-600 text-primary focus:ring-primary bg-transparent cursor-pointer"
                    />
                    <label htmlFor="focusIndia" className="font-body text-sm text-on-surface cursor-pointer">
                      {t('field.focusIndia')}
                    </label>
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Confirm */}
            {currentStep === 3 && (
              <>
                <h2 className="font-headline text-xl font-bold text-on-surface mb-8">
                  Confirm Submission
                </h2>
                <div className="space-y-6">
                  {Object.entries(form)
                    .filter(([, v]) => v)
                    .map(([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between items-center py-3 border-b border-outline-variant/15"
                      >
                        <span className="font-label text-sm text-on-surface-variant capitalize">
                          {key.replace(/([A-Z])/g, " $1")}
                        </span>
                        <span className="font-body text-sm text-on-surface font-medium">
                          {value}
                        </span>
                      </div>
                    ))}
                </div>
              </>
            )}

            {/* ── Navigation Actions ─────────────────────────── */}
            <div className="flex justify-between items-center pt-8 mt-8 border-t border-surface-container-high/50">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((s) => s - 1)}
                  className="text-on-surface-variant font-label text-sm font-semibold tracking-wide hover:text-on-surface transition-colors flex items-center space-x-2"
                >
                  <span className="material-symbols-outlined text-sm">
                    arrow_back
                  </span>
                  <span>Back</span>
                </button>
              ) : (
                <Link
                  href="/dashboard"
                  className="text-on-surface-variant font-label text-sm font-semibold tracking-wide hover:text-on-surface transition-colors"
                >
                  Cancel
                </Link>
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((s) => s + 1)}
                  className="bg-primary-container text-on-primary font-label text-sm font-bold tracking-wide px-8 py-3 rounded-md active:scale-95 transition-transform flex items-center space-x-2"
                >
                  <span>
                    Next: {currentStep === 1 ? "Context" : "Confirm"}
                  </span>
                  <span className="material-symbols-outlined text-sm">
                    arrow_forward
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-secondary text-on-secondary font-label text-sm font-bold tracking-wide px-8 py-3 rounded-md active:scale-95 transition-transform flex items-center space-x-2 shadow-lg shadow-secondary/20 disabled:opacity-50"
                >
                  <span>
                    {loading ? "Submitting..." : "Submit for Analysis"}
                  </span>
                  <span className="material-symbols-outlined text-sm">
                    bolt
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* ── Instructional Sidebar ─────────────────────────── */}
          <div className="mt-12 bg-surface-container p-6 rounded-lg border border-surface-dim/20 flex items-start space-x-4">
            <span className="material-symbols-outlined text-secondary">
              lightbulb
            </span>
            <div>
              <h4 className="font-headline font-semibold text-sm text-on-surface">
                Precision Matters
              </h4>
              <p className="font-body text-xs text-on-surface-variant mt-1 leading-relaxed">
                The Sovereign Analyst uses these initial parameters to construct
                the foundational query matrix. Clearer problem definitions yield
                higher confidence scores in the final validation report.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
