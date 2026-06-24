import * as React from "react";
import { Rocket, Quote } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Side: Branding Panel */}
      <div className="hidden lg:flex w-[45%] flex-col justify-between bg-[#111827] text-white p-12 relative overflow-hidden">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <img src="/app-logo.png" alt="VentureForge AI Logo" className="h-8 w-8 object-contain" />
          <span className="text-xl font-bold tracking-tight">
            startup<span className="text-[#22c55e]">IQ</span>
          </span>
        </div>

        {/* Content */}
        <div className="flex flex-col max-w-md mt-16">
          <h1 className="text-5xl font-bold leading-tight tracking-tight mb-6 text-white">
            Empowering the next generation of Indian founders.
          </h1>
          <p className="text-[#9ca3af] text-lg leading-relaxed mb-8">
            Join over 10,000+ institutional-grade analysts and visionary entrepreneurs leveraging India's most advanced AI validation engine.
          </p>

          <div className="flex items-center space-x-4">
            <div className="flex -space-x-3">
              <img src="https://i.pravatar.cc/100?img=11" alt="Avatar 1" className="h-10 w-10 rounded-full border-2 border-[#111827]" />
              <img src="https://i.pravatar.cc/100?img=47" alt="Avatar 2" className="h-10 w-10 rounded-full border-2 border-[#111827]" />
            </div>
            <span className="text-xs font-semibold tracking-widest text-[#9ca3af] uppercase">
              Institutional Access
            </span>
          </div>
        </div>

        {/* Testimonial */}
        <div className="mt-16 rounded-2xl border border-[#1f2937] bg-[#1f2937]/30 p-8">
          <div className="relative">
            <Quote className="absolute -top-2 -left-2 h-8 w-8 text-[#22c55e] fill-current opacity-20" />
            <p className="relative z-10 text-[15px] italic leading-relaxed text-[#d1d5db]">
              "VentureForge AI's AI validation provided the rigor we needed to secure our Series A. It's the standard for the Indian ecosystem."
            </p>
          </div>
          <div className="mt-6 flex items-center space-x-3">
            <img src="https://i.pravatar.cc/100?img=33" alt="Arjun Mehta" className="h-10 w-10 rounded-full" />
            <div>
              <p className="text-sm font-semibold text-white">Arjun Mehta</p>
              <p className="text-xs text-[#9ca3af]">Founder, FinStream Tech</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex w-full lg:w-[55%] items-center justify-center p-8 sm:p-12 lg:p-24">
        <div className="w-full max-w-[440px]">
          {children}
        </div>
      </div>
    </div>
  );
}
