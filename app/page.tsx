"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSettings } from "@/lib/storage";
import {
  ArrowRight,
  ScanLine,
  Activity,
  Shield,
  BarChart3,
  ChevronDown,
  FileText,
  Menu,
  X,
  Lightbulb,
  Lock,
  Camera,
  Moon,
  Sun,
  Info,
} from "lucide-react";
import { ChopMeterLogo, ChopMeterTagline } from "@/components/ChopMeterLogo";

export default function LandingPage() {
  const router = useRouter();
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const settings = getSettings();
    if (settings.onboardingComplete) setIsReturningUser(true);

    // Resolve initial theme
    const saved = localStorage.getItem("chopmeter_landing_theme");
    let dark = false;
    if (saved === "dark") dark = true;
    else if (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches) dark = true;
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.classList.toggle("light", !dark);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    document.documentElement.classList.toggle("light", !next);
    localStorage.setItem("chopmeter_landing_theme", next ? "dark" : "light");
  };

  const handleCTA = () =>
    router.push(isReturningUser ? "/dashboard" : "/onboarding");

  const ctaText = isReturningUser
    ? "Open Dashboard"
    : "Start Tracking \u2014 It\u2019s Free";

  return (
    <div className="min-h-screen bg-white dark:bg-darkBg font-display text-body dark:text-gray-300 overflow-x-hidden transition-colors duration-300">

      {/* ============================== NAV ============================== */}
      <nav className="sticky top-0 z-50 w-full h-16 bg-white border-b border-border flex items-center px-6 lg:px-12 justify-between dark:bg-darkBg dark:border-darkBorder">
        <div className="flex items-center gap-2.5">
          <ChopMeterLogo size={130} color={isDark ? "#FFFFFF" : "#111827"} />
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors dark:text-gray-400 dark:hover:text-primary">How It Works</a>
          <a href="#features" className="text-sm font-medium hover:text-primary transition-colors dark:text-gray-400 dark:hover:text-primary">Features</a>
          <a href="#faq" className="text-sm font-medium hover:text-primary transition-colors dark:text-gray-400 dark:hover:text-primary">FAQ</a>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-body dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-darkSurface transition-colors flex items-center justify-center"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} />}
          </button>
          <button
            onClick={handleCTA}
            className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-all"
          >
            {isReturningUser ? "Dashboard" : "Get Started"}
          </button>
        </div>
        {/* Mobile */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-body dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-darkSurface transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} />}
          </button>
          <button className="text-heading dark:text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 md:hidden px-6 pb-5 pt-3 space-y-1 border-t border-border bg-white/95 dark:bg-darkBg/95 dark:border-darkBorder backdrop-blur-xl">
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block py-3 text-sm font-medium dark:text-gray-400">How It Works</a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block py-3 text-sm font-medium dark:text-gray-400">Features</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block py-3 text-sm font-medium dark:text-gray-400">FAQ</a>
            <button onClick={handleCTA} className="w-full mt-2 h-11 bg-primary text-white rounded-lg text-sm font-semibold">
              {isReturningUser ? "Dashboard" : "Get Started"}
            </button>
          </div>
        )}
      </nav>

      <main>
        {/* ============================== HERO ============================== */}
        <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-32 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-primary border border-blue-100 mb-6 dark:bg-blue-500/[0.08] dark:border-blue-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Built for Ghana&apos;s 1M+ smart meters
            </span>

            <h1 className="text-5xl lg:text-6xl font-extrabold text-heading leading-tight tracking-[-0.025em] mb-6 dark:text-white">
              Is your meter eating your credit?
            </h1>

            <p className="text-lg lg:text-xl text-body mb-8 max-w-lg leading-relaxed dark:text-gray-400">
              Track your prepaid electricity, scan your meter, and detect overcharging instantly. No hidden fees, just clarity.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <button
                onClick={handleCTA}
                className="group bg-primary text-white px-8 py-4 rounded-xl text-lg font-bold shadow-lg shadow-blue-200 hover:bg-blue-600 hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2.5 dark:shadow-blue-500/20"
              >
                {ctaText}
                <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
              </button>
              <a
                href="#how-it-works"
                className="h-14 px-8 rounded-xl font-bold text-base flex items-center justify-center border border-border text-body hover:text-primary hover:border-primary/30 transition-all dark:border-darkBorder dark:text-gray-400 dark:hover:text-primary"
              >
                See How It Works
              </a>
            </div>

            <div className="flex flex-wrap gap-6 text-sm font-medium text-gray-400">
              <span className="flex items-center gap-2">
                <Lock size={14} className="text-success" /> No sign-up required
              </span>
              <span className="flex items-center gap-2">
                <Shield size={14} className="text-success" /> Data stays on your phone
              </span>
            </div>
          </div>

          {/* Phone Mockup */}
          <div className="relative hidden lg:block">
            <div className="mx-auto w-[320px]" style={{ transform: "perspective(1000px) rotateY(-15deg) rotateX(5deg)" }}>
              <div className="rounded-[3rem] p-[2px] bg-gradient-to-b from-gray-300 to-gray-100 shadow-2xl dark:from-white/[0.15] dark:to-white/[0.05] dark:shadow-blue-900/20">
                <div className="keep-dark rounded-[2.9rem] bg-gray-900 p-3.5">
                  <div className="w-[80px] h-[24px] bg-black rounded-full mx-auto mb-4" />
                  <div className="space-y-3 px-1">
                    <div className="flex items-center justify-between px-0.5">
                      <ChopMeterLogo size={70} color="rgba(255,255,255,0.8)" />
                      <span className="text-white/30 text-[9px] font-medium">9:41</span>
                    </div>
                    <p className="text-white/35 text-[10px] font-medium px-0.5">Good evening, Kofi</p>
                    <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-3.5">
                      <p className="text-white/35 text-[8px] uppercase tracking-[0.1em] font-semibold">Credit Balance</p>
                      <p className="text-white text-2xl font-extrabold tracking-tight mt-1">GH&#8373; 124.50</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="h-1.5 flex-1 bg-white/[0.06] rounded-full overflow-hidden">
                          <div className="h-full w-[65%] bg-gradient-to-r from-primary to-emerald-400 rounded-full" />
                        </div>
                        <span className="text-emerald-400 text-[9px] font-bold">~8 days left</span>
                      </div>
                    </div>
                    <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-3.5">
                      <div className="flex items-center justify-between mb-2.5">
                        <p className="text-white/35 text-[8px] uppercase tracking-[0.1em] font-semibold">Weekly Usage</p>
                        <span className="text-[8px] px-2 py-0.5 rounded bg-red-500/10 text-red-400 font-bold">+34% Suspicious</span>
                      </div>
                      <div className="flex items-end gap-1 h-14">
                        {[38, 62, 48, 75, 42, 58, 52].map((h, i) => (
                          <div key={i} className="flex-1 flex flex-col justify-end h-full">
                            <div className="w-full rounded-sm bg-gradient-to-t from-primary/80 to-violet-500/60" style={{ height: `${h}%` }} />
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between mt-2 px-0.5">
                        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                          <span key={i} className="text-[7px] text-white/25 flex-1 text-center font-medium">{d}</span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-red-500/[0.05] border border-red-500/[0.12] rounded-2xl p-3.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white/35 text-[8px] uppercase tracking-[0.1em] font-semibold">Health Check</p>
                          <p className="text-red-400 text-lg font-extrabold mt-0.5">
                            +34% <span className="text-xs font-bold text-red-400/60">Suspicious</span>
                          </p>
                        </div>
                        <div className="size-9 rounded-full bg-red-500/[0.1] flex items-center justify-center">
                          <Activity size={16} className="text-red-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-24 h-1 bg-white/[0.1] rounded-full mx-auto mt-5 mb-1" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================== HOW IT WORKS ============================== */}
        <section className="py-24 lg:py-32 bg-white border-t border-border dark:bg-darkBg dark:border-darkBorder" id="how-it-works">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-heading mb-16 dark:text-white">How ChopMetr Works</h2>

            <div className="grid md:grid-cols-3 gap-8 mb-20">
              {[
                {
                  num: "1",
                  icon: Lightbulb,
                  title: "Select Appliances",
                  desc: "Choose which gadgets you use daily (Fridge, AC, TV) to build your usage profile.",
                  color: "text-blue-500",
                  iconBg: "bg-white dark:bg-darkBg",
                },
                {
                  num: "2",
                  icon: Camera,
                  title: "Scan Meter",
                  desc: "Point your camera at your meter. Our OCR AI reads your credit balance instantly.",
                  color: "text-violet-500",
                  iconBg: "bg-white dark:bg-darkBg",
                },
                {
                  num: "3",
                  icon: Activity,
                  title: "Get Verdict",
                  desc: "Compare your predicted usage with real costs to see if you're being overcharged.",
                  color: "text-red-500",
                  iconBg: "bg-white dark:bg-darkBg",
                },
              ].map((step) => (
                <div
                  key={step.num}
                  className="bg-surface p-8 rounded-2xl border border-border text-left dark:bg-darkSurface dark:border-darkBorder"
                >
                  <div className={`w-12 h-12 ${step.iconBg} rounded-lg flex items-center justify-center border border-border shadow-sm mb-6 dark:border-darkBorder`}>
                    <span className={`${step.color} font-bold text-lg`}>{step.num}</span>
                  </div>
                  <h4 className="text-xl font-bold text-heading mb-4 dark:text-white">{step.title}</h4>
                  <p className="text-body leading-relaxed dark:text-gray-400">{step.desc}</p>
                </div>
              ))}
            </div>

            {/* Verdict Scale */}
            <div className="max-w-3xl mx-auto">
              <p className="text-sm font-semibold uppercase tracking-wider text-body mb-6 dark:text-gray-400">
                Our Analysis Verdict Scale
              </p>
              <div className="h-4 w-full bg-gradient-to-r from-success via-yellow-400 to-alert rounded-full mb-4" />
              <div className="flex justify-between text-xs font-bold text-heading px-2 dark:text-white">
                <span>HEALTHY</span>
                <span>WATCH</span>
                <span>SUSPICIOUS</span>
                <span>ALERT</span>
              </div>
            </div>
          </div>
        </section>

        {/* ============================== FEATURES ============================== */}
        <section className="py-24 lg:py-32 bg-surface dark:bg-darkBg" id="features">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-heading mb-4 dark:text-white">Powerful tracking tools</h2>
              <p className="text-body text-lg dark:text-gray-400">Everything you need to stop losing money to your meter.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Camera OCR — large */}
              <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-border hover:shadow-md transition-shadow dark:bg-darkSurface dark:border-darkBorder">
                <div className="w-10 h-10 bg-blue-50 text-primary rounded-lg flex items-center justify-center mb-6 dark:bg-blue-500/10">
                  <ScanLine size={22} />
                </div>
                <h3 className="text-xl font-bold text-heading mb-2 dark:text-white">Smart Camera OCR</h3>
                <p className="text-body dark:text-gray-400">Just snap a photo. Our engine extracts the meter reading accurately even in low light.</p>
              </div>

              {/* Privacy */}
              <div className="bg-white p-8 rounded-2xl border border-border hover:shadow-md transition-shadow dark:bg-darkSurface dark:border-darkBorder">
                <div className="w-10 h-10 bg-green-50 text-success rounded-lg flex items-center justify-center mb-6 dark:bg-emerald-500/10">
                  <Shield size={22} />
                </div>
                <h3 className="text-xl font-bold text-heading mb-2 dark:text-white">100% Privacy</h3>
                <p className="text-body text-sm dark:text-gray-400">Your energy data is sensitive. We never upload your logs to any server.</p>
              </div>

              {/* Evidence */}
              <div className="bg-white p-8 rounded-2xl border border-border hover:shadow-md transition-shadow dark:bg-darkSurface dark:border-darkBorder">
                <div className="w-10 h-10 bg-red-50 text-alert rounded-lg flex items-center justify-center mb-6 dark:bg-red-500/10">
                  <FileText size={22} />
                </div>
                <h3 className="text-xl font-bold text-heading mb-2 dark:text-white">Evidence PDF</h3>
                <p className="text-body text-sm dark:text-gray-400">Download a detailed audit report to show your utility provider.</p>
              </div>

              {/* Analytics — full width */}
              <div className="lg:col-span-4 bg-white p-10 rounded-2xl border border-border flex flex-col md:flex-row items-center gap-10 dark:bg-darkSurface dark:border-darkBorder">
                <div className="flex-1">
                  <div className="w-10 h-10 bg-blue-50 text-primary rounded-lg flex items-center justify-center mb-6 dark:bg-blue-500/10">
                    <BarChart3 size={22} />
                  </div>
                  <h3 className="text-2xl font-bold text-heading mb-4 dark:text-white">Deep Usage Analytics</h3>
                  <p className="text-body leading-relaxed dark:text-gray-400">
                    See exactly which day of the week your credit &ldquo;disappears.&rdquo; Understand if your fridge is faulty or if the tariff changed without notice. Our dashboard breaks down costs per appliance category.
                  </p>
                </div>
                <div className="flex-1 w-full bg-surface p-6 rounded-xl border border-border border-dashed dark:bg-darkBg dark:border-darkBorder">
                  <div className="space-y-4">
                    {[
                      { day: "Mon", w: "50%", cost: "GH\u20B5 4.2", color: "bg-primary" },
                      { day: "Tue", w: "75%", cost: "GH\u20B5 8.1", color: "bg-primary" },
                      { day: "Wed", w: "100%", cost: "GH\u20B5 12.5", color: "bg-alert" },
                    ].map((row) => (
                      <div key={row.day} className="flex items-center justify-between gap-3">
                        <span className="text-xs w-8">{row.day}</span>
                        <div className="h-2 flex-1 bg-gray-100 dark:bg-gray-700/50 rounded-full overflow-hidden">
                          <div className={`h-full ${row.color} rounded-full`} style={{ width: row.w }} />
                        </div>
                        <span className="text-xs font-bold text-heading dark:text-white w-16 text-right">{row.cost}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================== FAQ ============================== */}
        <section className="py-24 lg:py-32 bg-white dark:bg-darkBg" id="faq">
          <div className="max-w-3xl mx-auto px-6 lg:px-12">
            <h2 className="text-3xl font-bold text-heading text-center mb-16 dark:text-white">Frequently Asked Questions</h2>

            <div className="space-y-4">
              {[
                {
                  q: "Is this affiliated with ECG or NEDCo?",
                  a: "No, ChopMetr is an independent utility tool built to empower consumers with their own data. We use standard PURC tariff rates to calculate your expected costs.",
                },
                {
                  q: "How accurate is the camera scan?",
                  a: "Our OCR technology is optimized for standard smart meters used in Ghana. It works with 98% accuracy when the screen is clear and well-lit.",
                },
                {
                  q: "Where is my data stored?",
                  a: "All your usage data and meter photos are stored locally in your browser's memory. We do not have a database that stores your personal consumption info.",
                },
                {
                  q: "What should I do if my meter shows ALERT?",
                  a: "Generate a timestamped report from the app and take it to your nearest ECG district office. You can also file a formal complaint with PURC for an independent meter audit.",
                },
              ].map((item, i) => (
                <details
                  key={i}
                  className="group border border-border rounded-xl px-6 py-4 bg-surface [&_summary::-webkit-details-marker]:hidden dark:bg-darkSurface dark:border-darkBorder"
                >
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <h5 className="text-lg font-semibold text-heading dark:text-white pr-8">{item.q}</h5>
                    <ChevronDown size={18} className="text-gray-400 shrink-0 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-4 text-body leading-relaxed dark:text-gray-400">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ============================== FINAL CTA ============================== */}
        <section className="py-24 lg:py-32 bg-white dark:bg-darkBg">
          <div className="keep-dark max-w-5xl mx-auto px-6 lg:px-12 text-center bg-heading rounded-[2.5rem] py-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Take control of your electricity
            </h2>
            <p className="text-blue-200 text-lg mb-10 max-w-xl mx-auto dark:text-gray-400">
              Join thousands of Ghanaians using ChopMetr to audit their bills and save money.
            </p>
            <button
              onClick={handleCTA}
              className="group bg-primary hover:bg-blue-600 text-white px-10 py-5 rounded-2xl text-xl font-bold transition-all transform hover:scale-105 inline-flex items-center gap-2.5"
            >
              {ctaText}
              <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </section>
      </main>

      {/* ============================== DISCLAIMER ============================== */}
      <div className="max-w-3xl mx-auto px-6 lg:px-12 pb-10">
        <div className="px-5 py-4 rounded-xl border border-border bg-surface dark:bg-darkSurface dark:border-darkBorder">
          <div className="flex items-start gap-3">
            <Info size={15} className="text-gray-400 shrink-0 mt-0.5" />
            <p className="text-[12px] text-body leading-relaxed dark:text-gray-400">
              <span className="font-bold text-heading dark:text-white">Disclaimer:</span>{" "}
              ChopMetr is an <span className="font-bold text-heading dark:text-white">independent consumer tool</span> and is{" "}
              <span className="font-bold text-heading dark:text-white">not affiliated with ECG, NEDCo, PDS, or PURC.</span>{" "}
              All estimates are based on publicly available PURC tariff rates and are for{" "}
              <span className="font-bold text-heading dark:text-white">informational purposes only.</span>{" "}
              This app is not an official billing tool. For official billing disputes, contact your utility provider or PURC directly.
            </p>
          </div>
        </div>
      </div>

      {/* ============================== FOOTER ============================== */}
      <footer className="py-12 border-t border-border dark:bg-darkBg dark:border-darkBorder">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <ChopMeterLogo size={110} color={isDark ? "rgba(255,255,255,0.3)" : "#111827"} />
            <ChopMeterTagline color={isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.35)"} />
          </div>
          <p className="text-sm text-body dark:text-gray-400">
            &copy; 2026 ChopMetr &middot; Built for Ghana.
          </p>
          <div className="flex gap-6 text-sm font-medium">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
