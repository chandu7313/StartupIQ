"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
      );
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to sign in");
      }
      const data = await res.json();
      document.cookie = `token=${data.token}; path=/; max-age=604800`;
      toast.success("Welcome back!");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background font-body min-h-screen flex items-center justify-center p-4 sm:p-8">
      <main className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row bg-surface-container-lowest rounded-xl shadow-[0_4px_40px_0_rgba(27,27,29,0.06)] overflow-hidden">
        {/* ── Left Panel: Brand & Context ────────────────────────── */}
        <section className="lg:w-1/2 bg-[#0f172a] text-white p-10 lg:p-16 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-16">
              <span
                className="material-symbols-outlined text-3xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                analytics
              </span>
              <span className="font-headline font-bold text-2xl tracking-tighter uppercase">
                StartupSaarthi AI
              </span>
            </div>
            <div className="space-y-6 max-w-md">
              <h1 className="font-headline font-extrabold text-4xl lg:text-5xl leading-tight">
                Editorial-First Intelligence.
              </h1>
              <p className="font-body text-lg text-slate-300 leading-relaxed">
                Join 10,000+ Indian founders leveraging precision analytics and
                narrative-driven insights to build sovereign enterprises.
              </p>
            </div>
          </div>
          {/* Testimonial */}
          <div className="relative z-10 mt-20">
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 backdrop-blur-sm">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex-shrink-0 flex items-center justify-center font-headline font-bold text-white text-lg">
                  AM
                </div>
                <div>
                  <p className="font-body text-sm text-slate-200 italic mb-3">
                    &ldquo;The Sovereign Analyst doesn&apos;t just show data; it
                    writes the thesis for our next growth phase. It&apos;s an
                    indispensable co-founder.&rdquo;
                  </p>
                  <p className="font-label text-xs font-semibold uppercase tracking-wider text-green-400">
                    Arjun M. — YC W23
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Right Panel: Auth Flow ─────────────────────────────── */}
        <section className="lg:w-1/2 bg-surface-container-lowest p-10 lg:p-16 flex flex-col justify-center">
          <div className="w-full max-w-md mx-auto">
            {/* Tabs */}
            <div className="flex border-b border-outline-variant/30 mb-10">
              <button className="flex-1 pb-4 font-headline font-semibold text-lg text-primary border-b-2 border-primary transition-colors">
                Log In
              </button>
              <Link
                href="/sign-up"
                className="flex-1 pb-4 font-headline font-medium text-lg text-on-surface-variant hover:text-primary transition-colors text-center"
              >
                Sign Up
              </Link>
            </div>

            <div className="space-y-8">
              <div className="text-center">
                <h2 className="font-headline font-bold text-3xl text-on-background mb-2">
                  Welcome back
                </h2>
                <p className="font-body text-on-surface-variant text-sm">
                  Enter your details to access your dashboard.
                </p>
              </div>

              {/* Divider */}
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-outline-variant/30" />
                <span className="flex-shrink-0 mx-4 text-on-surface-variant text-xs font-body uppercase tracking-widest">
                  Email Login
                </span>
                <div className="flex-grow border-t border-outline-variant/30" />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label
                    className="block font-label text-sm text-on-surface-variant"
                    htmlFor="email"
                  >
                    Email Address
                  </label>
                  <input
                    className="w-full bg-transparent border-0 border-b border-outline-variant/50 focus:border-primary focus:ring-0 px-0 py-2 font-body text-on-background transition-colors"
                    id="email"
                    placeholder="founder@startup.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <label
                      className="block font-label text-sm text-on-surface-variant"
                      htmlFor="password"
                    >
                      Password
                    </label>
                    <a
                      className="font-body text-xs text-secondary hover:underline"
                      href="#"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <input
                    className="w-full bg-transparent border-0 border-b border-outline-variant/50 focus:border-primary focus:ring-0 px-0 py-2 font-body text-on-background transition-colors"
                    id="password"
                    placeholder="••••••••"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>
                <button
                  className="w-full bg-gradient-to-b from-primary-container to-[#0a1020] text-on-primary font-headline font-semibold py-4 rounded-md shadow-sm hover:opacity-95 transition-opacity flex justify-center items-center space-x-2 mt-8 disabled:opacity-50"
                  type="submit"
                  disabled={loading}
                >
                  <span>
                    {loading ? "Signing in..." : "Access Dashboard"}
                  </span>
                  {!loading && (
                    <span className="material-symbols-outlined text-sm">
                      arrow_forward
                    </span>
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
