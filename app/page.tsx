"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSettings } from "@/lib/storage";
import {
  Zap,
  ArrowRight,
  ScanLine,
  Activity,
  TrendingUp,
  Shield,
  PiggyBank,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  Wallet,
  FileText,
  Lightbulb,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const settings = getSettings();
    if (settings.onboardingComplete) {
      router.replace("/dashboard");
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-bg-dark">
        <Zap className="text-blue-400 animate-pulse" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-dark font-display text-gray-50 overflow-x-hidden">
      {/* ===================== NAVBAR ===================== */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0E1A]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center size-9 rounded-[10px] bg-gradient-to-br from-blue-500 to-violet-500 shadow-lg shadow-blue-500/25">
              <Zap size={20} className="text-white" fill="white" />
            </div>
            <span className="text-white text-xl font-bold tracking-tight">
              ChopMeter
            </span>
          </div>
          <button
            onClick={() => router.push("/onboarding")}
            className="bg-gradient-to-r from-blue-500 to-violet-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-[0.97]"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* ===================== HERO ===================== */}
      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-24 px-4 sm:px-6">
        {/* Glow effects */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-500/[0.06] rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-40 left-1/4 w-[300px] h-[300px] bg-violet-500/[0.04] rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 mb-8 animate-fade-in-up">
            <AlertTriangle size={14} className="text-red-400" />
            <span className="text-red-300 text-xs font-bold uppercase tracking-wider">
              Ghana Smart Meter Crisis
            </span>
          </div>

          <h1 className="text-[36px] sm:text-[52px] font-extrabold text-white leading-[1.15] mb-6 animate-fade-in-up">
            Is your meter{" "}
            <span className="gradient-primary-text">chopping</span>
            <br />
            your money?
          </h1>
          <p className="text-gray-400 text-lg sm:text-xl leading-relaxed max-w-[600px] mx-auto mb-10 animate-fade-in-up">
            ChopMeter helps you track your electricity usage, detect if your
            prepaid meter is running too fast, and{" "}
            <span className="text-white font-semibold">
              get the evidence you need
            </span>{" "}
            to challenge unfair billing.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-in-up">
            <button
              onClick={() => router.push("/onboarding")}
              className="w-full sm:w-auto group relative flex items-center justify-center overflow-hidden rounded-2xl h-14 px-8 bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] active:scale-[0.98]"
            >
              <span className="text-white text-[17px] font-bold mr-2 relative z-10">
                Start Tracking Free
              </span>
              <ArrowRight
                size={20}
                className="text-white relative z-10 transition-transform group-hover:translate-x-1"
              />
            </button>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto flex items-center justify-center gap-2 h-14 px-8 rounded-2xl bg-white/[0.05] border border-white/[0.08] text-gray-300 font-bold hover:text-white hover:border-white/[0.15] transition-all"
            >
              See How It Works
              <ChevronDown size={18} />
            </a>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-6 text-gray-500 text-sm animate-fade-in-up">
            <div className="flex items-center gap-1.5">
              <Shield size={14} className="text-emerald-500" />
              <span>100% Free</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap size={14} className="text-blue-400" />
              <span>No sign-up needed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield size={14} className="text-violet-400" />
              <span>Data stays on your phone</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== THE PROBLEM ===================== */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-red-400 text-xs font-bold uppercase tracking-wider mb-3">
              The Problem
            </p>
            <h2 className="text-[28px] sm:text-[36px] font-extrabold text-white leading-tight mb-4">
              GH₵50 top-up gone in 2 days?
              <br />
              <span className="text-gray-500">You&apos;re not alone.</span>
            </h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-[550px] mx-auto leading-relaxed">
              Since ECG began installing smart prepaid meters, thousands of
              Ghanaians have reported their credit disappearing far too quickly
              — even with minimal usage.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                stat: "1M+",
                label: "Smart meters installed across Ghana since 2024",
                color: "text-blue-400",
              },
              {
                stat: "70%",
                label: "Of complaints are about rapid credit depletion",
                color: "text-red-400",
              },
              {
                stat: "???",
                label: "No consumer tool existed to verify meter accuracy — until now",
                color: "text-violet-400",
              },
            ].map((item) => (
              <div
                key={item.stat}
                className="glass-card p-6 text-center"
              >
                <p className={`text-3xl font-extrabold ${item.color} mb-2`}>
                  {item.stat}
                </p>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== KILLER FEATURE: METER HEALTH CHECK ===================== */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 relative">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-red-500/[0.04] rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 mb-6">
              <Activity size={14} className="text-red-400" />
              <span className="text-red-300 text-xs font-bold uppercase tracking-wider">
                Killer Feature
              </span>
            </div>
            <h2 className="text-[28px] sm:text-[36px] font-extrabold text-white leading-tight mb-4">
              Meter Health Check
            </h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-[550px] mx-auto leading-relaxed">
              The first tool that lets you independently verify if your meter is
              running too fast — with{" "}
              <span className="text-white font-semibold">
                evidence you can take to ECG
              </span>
              .
            </p>
          </div>

          {/* How it works steps */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {[
              {
                step: "1",
                title: "Tell us what you use",
                desc: "Select your appliances — fans, fridge, TV, lights — and how many hours you use each one daily.",
                icon: Lightbulb,
                color: "text-violet-400",
                bg: "bg-violet-500/10",
              },
              {
                step: "2",
                title: "Scan your meter",
                desc: "Take a few meter readings over several days. Just point your camera at your meter — we read it automatically.",
                icon: ScanLine,
                color: "text-blue-400",
                bg: "bg-blue-500/10",
              },
              {
                step: "3",
                title: "See the truth",
                desc: "We compare what your meter says vs what your appliances should actually use. If there's a mismatch — you'll know.",
                icon: Activity,
                color: "text-red-400",
                bg: "bg-red-500/10",
              },
            ].map((item) => (
              <div key={item.step} className="glass-card p-6 relative">
                <div className="absolute -top-3 -left-2 size-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                  {item.step}
                </div>
                <div
                  className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center mb-4 mt-2`}
                >
                  <item.icon size={24} className={item.color} />
                </div>
                <h3 className="text-white font-bold text-base mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Status tiers preview */}
          <div className="glass-card p-6 sm:p-8">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-4">
              Your meter gets a clear verdict
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  status: "HEALTHY",
                  range: "< 15%",
                  color: "text-emerald-400",
                  bg: "bg-emerald-500/10",
                  border: "border-emerald-500/20",
                  icon: CheckCircle,
                },
                {
                  status: "WATCH",
                  range: "15-30%",
                  color: "text-yellow-400",
                  bg: "bg-yellow-500/10",
                  border: "border-yellow-500/20",
                  icon: TrendingUp,
                },
                {
                  status: "SUSPICIOUS",
                  range: "30-50%",
                  color: "text-orange-400",
                  bg: "bg-orange-500/10",
                  border: "border-orange-500/20",
                  icon: AlertTriangle,
                },
                {
                  status: "ALERT",
                  range: "> 50%",
                  color: "text-red-400",
                  bg: "bg-red-500/10",
                  border: "border-red-500/20",
                  icon: AlertTriangle,
                },
              ].map((tier) => (
                <div
                  key={tier.status}
                  className={`rounded-xl ${tier.bg} border ${tier.border} p-4 text-center`}
                >
                  <tier.icon size={24} className={`${tier.color} mx-auto mb-2`} />
                  <p className={`text-sm font-extrabold ${tier.color}`}>
                    {tier.status}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    {tier.range} off
                  </p>
                </div>
              ))}
            </div>
            <p className="text-gray-500 text-xs text-center mt-4">
              If your meter is running 30%+ higher than expected, you have
              evidence to file a complaint with ECG or request a PURC audit.
            </p>
          </div>
        </div>
      </section>

      {/* ===================== HOW IT WORKS ===================== */}
      <section
        id="how-it-works"
        className="py-16 sm:py-24 px-4 sm:px-6 border-t border-white/[0.04]"
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-3">
              How It Works
            </p>
            <h2 className="text-[28px] sm:text-[36px] font-extrabold text-white leading-tight mb-4">
              Simple. Free. Private.
            </h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-[500px] mx-auto">
              No account needed. No data leaves your phone. Everything runs
              right in your browser.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                icon: ScanLine,
                title: "Scan Your Meter",
                desc: "Open the scanner, point your camera at your prepaid meter display. ChopMeter reads the numbers automatically using OCR — no typing needed.",
                color: "text-blue-400",
                bg: "bg-blue-500/10",
              },
              {
                icon: BarChart3,
                title: "Track Your Usage",
                desc: "See your daily consumption, burn rate (how fast your credit is being used), and how many days you have left before your balance hits zero.",
                color: "text-violet-400",
                bg: "bg-violet-500/10",
              },
              {
                icon: Activity,
                title: "Run a Health Check",
                desc: "Select your appliances (fans, fridge, TV, etc.) and we calculate what your meter should read. If there's a big gap between expected and actual — your meter might be faulty.",
                color: "text-red-400",
                bg: "bg-red-500/10",
              },
              {
                icon: Wallet,
                title: "Track Your Top-ups",
                desc: "Log every time you buy credit. See how long each top-up actually lasts vs how long it should last based on your usage.",
                color: "text-emerald-400",
                bg: "bg-emerald-500/10",
              },
              {
                icon: PiggyBank,
                title: "Set a Monthly Budget",
                desc: "Set a target amount per month and track whether you're on pace. Get warnings when you're spending faster than planned.",
                color: "text-yellow-400",
                bg: "bg-yellow-500/10",
              },
              {
                icon: FileText,
                title: "Generate a Report",
                desc: "Create a printable report of your readings, usage patterns, and health check results — evidence you can take to ECG or PURC.",
                color: "text-blue-400",
                bg: "bg-blue-500/10",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="glass-card p-5 flex items-start gap-4"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}
                >
                  <item.icon size={24} className={item.color} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base mb-1">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== WHO IS THIS FOR ===================== */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-violet-400 text-xs font-bold uppercase tracking-wider mb-3">
              Who Is This For
            </p>
            <h2 className="text-[28px] sm:text-[36px] font-extrabold text-white leading-tight mb-4">
              Built for Ghanaians who are
              <br />
              <span className="text-gray-500">tired of unexplained bills</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                title: "Homeowners & Tenants",
                desc: "Track your family's daily electricity usage and catch when something doesn't add up.",
              },
              {
                title: "Small Business Owners",
                desc: "Your shop's electricity cost shouldn't be a mystery. Know exactly where every pesewa goes.",
              },
              {
                title: "Landlords & Property Managers",
                desc: "Monitor multiple meters (coming soon) and help your tenants understand their usage.",
              },
              {
                title: "Consumer Advocates",
                desc: "Use ChopMeter reports as evidence when filing complaints with ECG, PURC, or your MP.",
              },
            ].map((item) => (
              <div key={item.title} className="glass-card p-6">
                <h3 className="text-white font-bold text-base mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== FAQ ===================== */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 border-t border-white/[0.04]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-3">
              Common Questions
            </p>
            <h2 className="text-[28px] sm:text-[36px] font-extrabold text-white leading-tight">
              Got questions?
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Does ChopMeter connect to my ECG meter?",
                a: "No. ChopMeter doesn't connect to any utility company system. You are the data source — you scan your own meter and log your own top-ups. This means you have independent, unbiased data.",
              },
              {
                q: "Is it really free?",
                a: "Yes, 100% free. No sign-up, no subscription, no ads. We built this to help Ghanaians take control of their electricity spend.",
              },
              {
                q: "Is my data safe?",
                a: "All your data stays on your device — in your browser's local storage. Nothing is sent to any server. Your readings, balance, and usage data never leave your phone.",
              },
              {
                q: "How accurate is the Meter Health Check?",
                a: "The more readings you take over time, the more accurate it gets. We recommend scanning your meter twice a day (morning and evening) for at least 5-7 days for the best results. The health check compares your actual consumption against standard wattage ratings for your selected appliances.",
              },
              {
                q: "What should I do if my meter shows SUSPICIOUS or ALERT?",
                a: "Document your readings daily (the app does this for you), generate a report, and take it to your nearest ECG district office. You can also file a complaint with PURC (Public Utilities Regulatory Commission) and request an independent meter audit.",
              },
              {
                q: "Can I use this outside Ghana?",
                a: "Yes! ChopMeter supports multiple African countries including Nigeria, Kenya, South Africa, and more. Select your country during setup and we'll adjust the currency and default tariff rate.",
              },
            ].map((item) => (
              <details
                key={item.q}
                className="glass-card group"
              >
                <summary className="flex items-center justify-between cursor-pointer p-5 list-none">
                  <span className="text-white font-bold text-sm pr-4">
                    {item.q}
                  </span>
                  <ChevronDown
                    size={18}
                    className="text-gray-500 shrink-0 transition-transform group-open:rotate-180"
                  />
                </summary>
                <div className="px-5 pb-5 -mt-1">
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {item.a}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== FINAL CTA ===================== */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 border-t border-white/[0.04] relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-blue-500/[0.05] rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <div className="size-20 rounded-full bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
            <Zap size={36} className="text-blue-400" fill="currentColor" />
          </div>
          <h2 className="text-[28px] sm:text-[36px] font-extrabold text-white leading-tight mb-4">
            Take control of your
            <br />
            electricity today
          </h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-[450px] mx-auto mb-8 leading-relaxed">
            Stop guessing. Start tracking. Know if your meter is cheating you.
          </p>
          <button
            onClick={() => router.push("/onboarding")}
            className="w-full sm:w-auto group relative inline-flex items-center justify-center overflow-hidden rounded-2xl h-14 px-10 bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] active:scale-[0.98]"
          >
            <span className="text-white text-[17px] font-bold mr-2 relative z-10">
              Get Started — It&apos;s Free
            </span>
            <ArrowRight
              size={20}
              className="text-white relative z-10 transition-transform group-hover:translate-x-1"
            />
          </button>
          <p className="text-gray-600 text-xs mt-4">
            No sign-up. No download. Works in your browser.
          </p>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="py-8 px-4 sm:px-6 border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center size-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500">
              <Zap size={14} className="text-white" fill="white" />
            </div>
            <span className="text-gray-500 text-sm font-semibold">
              ChopMeter
            </span>
          </div>
          <p className="text-gray-600 text-xs">
            Built with love for Ghana. Your data never leaves your device.
          </p>
        </div>
      </footer>
    </div>
  );
}
