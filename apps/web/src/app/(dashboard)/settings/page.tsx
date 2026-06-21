import * as React from "react";
import Link from "next/link";

export const metadata = {
  title: "Settings | startupIQ",
  description: "Manage your institutional profile and preferences.",
};

export default function SettingsPage() {
  return (
    <div className="bg-surface text-on-surface h-screen overflow-hidden flex font-body">
      {/* ── SideNavBar ───────────────────────────────────────── */}
      <nav className="bg-[#131b2e] h-screen w-64 fixed left-0 top-0 z-40 flex flex-col p-6 space-y-8 shadow-[4px_0_24px_rgba(0,0,0,0.1)] hidden md:flex">
        {/* Brand */}
        <div>
          <span className="font-headline text-lg font-black text-white uppercase tracking-widest block">
            Sovereign Analyst
          </span>
          <span className="font-body text-xs text-slate-400 mt-1 block">
            startupIQ
          </span>
        </div>

        {/* Navigation Tabs */}
        <div className="flex-1 flex flex-col space-y-2 font-headline text-sm font-medium tracking-wide">
          <Link
            href="/dashboard"
            className="flex items-center px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-300 ease-in-out group rounded-lg"
          >
            <span className="material-symbols-outlined mr-3 text-[20px]">
              dashboard
            </span>
            Dashboard
          </Link>
          <Link
            href="/validate/new"
            className="flex items-center px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-300 ease-in-out group rounded-lg"
          >
            <span className="material-symbols-outlined mr-3 text-[20px]">
              edit_note
            </span>
            Input
          </Link>
          <Link
            href="#"
            className="flex items-center px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-300 ease-in-out group rounded-lg"
          >
            <span className="material-symbols-outlined mr-3 text-[20px]">
              analytics
            </span>
            Reports
          </Link>
          {/* Active Tab */}
          <Link
            href="/settings"
            className="flex items-center px-4 py-3 bg-white/10 text-white rounded-lg font-bold transition-all duration-300 ease-in-out"
          >
            <span className="material-symbols-outlined mr-3 text-[20px]">
              settings
            </span>
            Settings
          </Link>
        </div>

        {/* CTA & Footer */}
        <div className="mt-auto flex flex-col space-y-6">
          <Link
            href="/validate/new"
            className="bg-secondary text-white font-headline text-sm font-bold py-3 px-4 rounded-md w-full text-center hover:bg-secondary/90 transition-colors block"
          >
            New Validation
          </Link>
          <div className="pt-4 border-t border-white/10 font-headline text-sm font-medium tracking-wide">
            <a
              href="#"
              className="flex items-center text-slate-400 hover:text-white transition-all duration-300 ease-in-out"
            >
              <span className="material-symbols-outlined mr-3 text-[20px]">
                help_outline
              </span>
              Help Center
            </a>
          </div>
        </div>
      </nav>

      {/* ── Main Content Canvas ──────────────────────────────── */}
      <main className="md:ml-64 flex-1 h-screen overflow-y-auto bg-surface relative">
        {/* Inner Settings Navigation Header (Glassmorphism) */}
        <header className="sticky top-0 z-30 bg-surface-container-lowest/80 backdrop-blur-xl border-b border-outline-variant/15 px-12 py-6">
          <div className="max-w-6xl mx-auto flex items-end justify-between">
            <div>
              <h1 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight">
                Account Settings
              </h1>
              <p className="font-body text-on-surface-variant mt-2">
                Manage your institutional profile and preferences.
              </p>
            </div>
            {/* Settings Sub-Nav */}
            <nav className="flex space-x-8">
              <a
                href="#profile"
                className="font-headline font-bold text-primary border-b-2 border-primary pb-2 px-1"
              >
                Profile
              </a>
              <a
                href="#billing"
                className="font-headline text-on-surface-variant hover:text-primary transition-colors pb-2 px-1"
              >
                Billing
              </a>
              <a
                href="#notifications"
                className="font-headline text-on-surface-variant hover:text-primary transition-colors pb-2 px-1"
              >
                Notifications
              </a>
              <a
                href="#api"
                className="font-headline text-on-surface-variant hover:text-primary transition-colors pb-2 px-1"
              >
                API
              </a>
            </nav>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-12 py-12 space-y-16">
          {/* ── Profile Section ──────────────────────────────── */}
          <section id="profile" className="scroll-mt-32">
            <h2 className="font-headline text-2xl font-bold text-on-surface mb-8">
              Institutional Profile
            </h2>
            <div className="bg-surface-container-lowest ambient-shadow rounded-xl p-10">
              <div className="flex items-start space-x-12">
                {/* Avatar */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-surface-container-high border-4 border-surface relative group cursor-pointer">
                    {/* Placeholder for avatar */}
                    <div className="w-full h-full bg-primary-container text-on-primary flex items-center justify-center font-headline text-4xl font-bold">
                      AK
                    </div>
                    <div className="absolute inset-0 bg-primary-container/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-3xl">
                        upload
                      </span>
                    </div>
                  </div>
                  <span className="font-label text-xs text-on-surface-variant uppercase tracking-wider">
                    Update Avatar
                  </span>
                </div>

                {/* Form Fields */}
                <div className="flex-1 space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="border-b border-outline-variant/30 focus-within:border-primary relative pb-1 transition-colors">
                      <label className="font-label text-xs text-on-surface-variant uppercase tracking-wider block mb-1">
                        Full Name
                      </label>
                      <input
                        className="w-full bg-transparent border-none p-0 outline-none focus:ring-0 font-body text-base text-on-surface"
                        type="text"
                        defaultValue="Dr. Arvind Kumar"
                      />
                    </div>
                    <div className="border-b border-outline-variant/30 focus-within:border-primary relative pb-1 transition-colors">
                      <label className="font-label text-xs text-on-surface-variant uppercase tracking-wider block mb-1">
                        Title / Role
                      </label>
                      <input
                        className="w-full bg-transparent border-none p-0 outline-none focus:ring-0 font-body text-base text-on-surface"
                        type="text"
                        defaultValue="Managing Director, Strategy"
                      />
                    </div>
                  </div>

                  <div className="border-b border-outline-variant/30 relative pb-1">
                    <label className="font-label text-xs text-on-surface-variant uppercase tracking-wider block mb-1">
                      Institutional Email
                    </label>
                    <input
                      className="w-full bg-transparent border-none p-0 outline-none focus:ring-0 font-body text-base text-on-surface cursor-not-allowed opacity-70"
                      readOnly
                      type="email"
                      defaultValue="arvind.k@sovereign-analyst.com"
                    />
                  </div>

                  <div className="border-b border-outline-variant/30 focus-within:border-primary relative pb-1 transition-colors">
                    <label className="font-label text-xs text-on-surface-variant uppercase tracking-wider block mb-1">
                      Brief Bio
                    </label>
                    <textarea
                      className="w-full bg-transparent border-none p-0 outline-none focus:ring-0 font-body text-base text-on-surface resize-none"
                      rows={3}
                      defaultValue="Focusing on deep-tech validation and sovereign market strategies across APAC regions."
                    />
                  </div>

                  <div>
                    <label className="font-label text-xs text-on-surface-variant uppercase tracking-wider block mb-3">
                      Focus Sectors
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {["FinTech", "DeepTech", "SaaS"].map((sector) => (
                        <span
                          key={sector}
                          className="px-3 py-1 bg-surface-container text-on-surface font-body text-sm rounded-full flex items-center"
                        >
                          {sector}{" "}
                          <span className="material-symbols-outlined text-[16px] ml-1 cursor-pointer hover:text-error transition-colors">
                            close
                          </span>
                        </span>
                      ))}
                      <button className="px-3 py-1 border border-outline-variant text-on-surface-variant font-body text-sm rounded-full hover:bg-surface-container-low transition-colors flex items-center">
                        <span className="material-symbols-outlined text-[16px] mr-1">
                          add
                        </span>{" "}
                        Add Sector
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button className="bg-primary-container text-on-primary font-headline text-sm font-bold py-3 px-8 rounded-md hover:bg-primary-container/90 transition-colors shadow-sm active:scale-95">
                      Save Changes
                    </button>
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
