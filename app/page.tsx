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
  BarChart3,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  Wallet,
  FileText,
  Home,
  Store,
  Building,
  Scale,
  Camera,
  Menu,
  X,
  UserX,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const settings = getSettings();
    if (settings.onboardingComplete) {
      setIsReturningUser(true);
    }
  }, []);

  const handleCTA = () => {
    router.push(isReturningUser ? "/dashboard" : "/onboarding");
  };

  const ctaLabel = isReturningUser ? "Open Dashboard" : "Start Tracking — It\u2019s Free";

  return (
    <div className="min-h-screen bg-bg-dark font-display text-slate-100 overflow-x-hidden">
      {/* ===================== NAVIGATION ===================== */}
      <nav className="fixed top-0 w-full z-50 glass-nav border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-gradient-to-br from-primary to-primary-violet rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/25">
                <Zap size={22} fill="currentColor" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                ChopMeter
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a className="text-sm font-medium hover:text-primary transition-colors" href="#how-it-works">
                How It Works
              </a>
              <a className="text-sm font-medium hover:text-primary transition-colors" href="#features">
                Features
              </a>
              <a className="text-sm font-medium hover:text-primary transition-colors" href="#faq">
                FAQ
              </a>
              <button
                onClick={handleCTA}
                className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all"
              >
                {isReturningUser ? "Open Dashboard" : "Start Tracking"}
              </button>
            </div>
            <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 border-t border-white/10 mt-2 pt-4 space-y-3 animate-fade-in-up">
              <a
                className="block text-sm font-medium hover:text-primary transition-colors py-2"
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </a>
              <a
                className="block text-sm font-medium hover:text-primary transition-colors py-2"
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                className="block text-sm font-medium hover:text-primary transition-colors py-2"
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
              >
                FAQ
              </a>
              <button
                onClick={handleCTA}
                className="w-full bg-primary hover:bg-primary/90 text-white px-5 py-3 rounded-lg text-sm font-bold transition-all"
              >
                {isReturningUser ? "Open Dashboard" : "Start Tracking"}
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* ===================== HERO SECTION ===================== */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full glow-radial -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                NEW: SMART METER VERIFIER
              </div>

              <h1 className="text-5xl lg:text-7xl font-black leading-[1.1] mb-6 tracking-tight">
                Is your meter{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-violet">
                  chopping
                </span>{" "}
                your money?
              </h1>
              <p className="text-lg text-slate-400 mb-8 max-w-xl">
                Verify your smart prepaid meter for free. No download. No sign-up.
                100% private. Join thousands of Ghanaians taking back control.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleCTA}
                  className="bg-primary text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  {ctaLabel}
                  <ArrowRight size={20} />
                </button>
                <a
                  href="#how-it-works"
                  className="glass-landing text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all text-center"
                >
                  See How It Works
                </a>
              </div>

              <div className="mt-10 flex flex-wrap gap-6 text-slate-500 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-primary" /> 100% Free
                </div>
                <div className="flex items-center gap-2">
                  <UserX size={16} className="text-primary" /> No Sign-up
                </div>
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-primary" /> Privacy-First
                </div>
              </div>
            </div>

            {/* Phone mockup */}
            <div className="relative hidden lg:block">
              <div className="absolute -inset-4 bg-gradient-to-tr from-primary/30 to-primary-violet/30 blur-3xl rounded-full opacity-50" />
              <div className="relative glass-landing rounded-[2.5rem] p-4 border-white/20 shadow-2xl">
                <div className="bg-[#0a0f18] rounded-[2rem] overflow-hidden aspect-[9/19] relative">
                  {/* Mock dashboard UI */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-2 mt-4">
                      <div className="size-8 bg-gradient-to-br from-primary to-primary-violet rounded-lg flex items-center justify-center">
                        <Zap size={16} className="text-white" fill="currentColor" />
                      </div>
                      <span className="text-white text-sm font-bold">ChopMeter</span>
                    </div>
                    <p className="text-slate-400 text-xs">Good evening, Kofi</p>
                    <div className="glass-landing rounded-xl p-4 mt-2">
                      <p className="text-slate-400 text-[10px] uppercase tracking-wider">Balance</p>
                      <p className="text-white text-2xl font-black mt-1">GH₵ 124.50</p>
                      <p className="text-emerald-400 text-xs mt-1 font-bold">~8 days left</p>
                    </div>
                    <div className="glass-landing rounded-xl p-4">
                      <p className="text-slate-400 text-[10px] uppercase tracking-wider">Daily Usage</p>
                      <p className="text-white text-xl font-bold mt-1">4.2 kWh</p>
                      <div className="flex gap-1 mt-2">
                        {[40, 65, 55, 70, 45, 60, 50].map((h, i) => (
                          <div key={i} className="flex-1 bg-white/5 rounded-full overflow-hidden h-12">
                            <div
                              className="w-full bg-gradient-to-t from-primary to-primary-violet rounded-full mt-auto"
                              style={{ height: `${h}%`, marginTop: `${100 - h}%` }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Overlay card at bottom */}
                  <div className="absolute bottom-8 left-4 right-4">
                    <div className="glass-landing p-4 rounded-2xl border border-red-500/20">
                      <p className="text-xs text-slate-400 mb-1">Health Check Result</p>
                      <p className="text-2xl font-bold text-red-500">34.2% Suspicious</p>
                      <div className="w-full bg-white/10 h-2 rounded-full mt-2 overflow-hidden">
                        <div className="bg-red-500 h-full rounded-full" style={{ width: "34%" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== PROBLEM SECTION ===================== */}
      <section className="py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 grid grid-cols-2 gap-4">
              <div className="glass-landing p-8 rounded-2xl flex flex-col gap-2">
                <p className="text-slate-400 text-sm">Meters Installed</p>
                <p className="text-4xl font-black text-white">1M+</p>
                <p className="text-emerald-500 text-sm flex items-center gap-1 font-bold">
                  <TrendingUp size={14} /> Since 2024
                </p>
              </div>
              <div className="glass-landing p-8 rounded-2xl flex flex-col gap-2 translate-y-8">
                <p className="text-slate-400 text-sm">Complaints Rising</p>
                <p className="text-4xl font-black text-white">70%+</p>
                <p className="text-red-400 text-sm flex items-center gap-1 font-bold">
                  <TrendingUp size={14} /> Rapid depletion
                </p>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl lg:text-5xl font-bold mb-6">
                GH₵50 gone in 2 days? You are not alone.
              </h2>
              <p className="text-lg text-slate-400 mb-6">
                The Ghana smart meter crisis is real. Thousands of users are
                reporting rapid credit depletion without a change in usage habits.
              </p>
              <p className="text-lg text-slate-400 mb-8">
                Electricity costs are high enough — you shouldn&apos;t be paying for
                &quot;ghost&quot; consumption or faulty meter calibrations.
                ChopMeter helps you gather the evidence you need.
              </p>
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-400 font-medium flex items-center gap-2">
                  <AlertTriangle size={18} />
                  The Energy Minister ordered ECG to investigate. PURC summoned ECG for emergency meetings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== KILLER FEATURE: HEALTH CHECK ===================== */}
      <section className="py-24 relative" id="health-check">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold mb-6">
            <Activity size={14} />
            KILLER FEATURE
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">Meter Health Check</h2>
          <p className="text-slate-400 mb-16 text-lg">
            Our verification system works in 3 simple steps.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-20 relative">
            {/* Dashed connector line */}
            <div className="hidden md:block absolute top-1/2 left-[30%] right-[30%] h-0.5 border-t-2 border-dashed border-primary/30 -z-10" />

            {[
              {
                step: "1",
                title: "Select Appliances",
                desc: "Tell us what\u2019s running (Fan, Fridge, TV, Lights). We know their exact power draw.",
                icon: CheckCircle,
              },
              {
                step: "2",
                title: "Scan Meter",
                desc: "Use your phone camera to scan your meter\u2019s display. Our OCR reads it automatically.",
                icon: Camera,
              },
              {
                step: "3",
                title: "Get Verdict",
                desc: "We compare expected usage to actual readings and flag any mismatches instantly.",
                icon: Activity,
              },
            ].map((item) => (
              <div key={item.step} className="glass-landing p-8 rounded-3xl relative">
                <div className="size-14 bg-primary rounded-2xl flex items-center justify-center text-white font-bold text-2xl mb-6 mx-auto">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Health Status Tiers */}
          <div className="glass-landing p-8 lg:p-12 rounded-[2.5rem] border-primary/20">
            <h3 className="text-2xl font-bold mb-8">Understanding Your Verdict</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="size-3 bg-emerald-500 rounded-full mb-3 mx-auto" />
                <p className="font-bold text-emerald-500">Healthy</p>
                <p className="text-xs text-slate-400">&lt;15% variance</p>
              </div>
              <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20">
                <div className="size-3 bg-yellow-500 rounded-full mb-3 mx-auto" />
                <p className="font-bold text-yellow-500">Watch</p>
                <p className="text-xs text-slate-400">15-30% variance</p>
              </div>
              <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20">
                <div className="size-3 bg-orange-500 rounded-full mb-3 mx-auto" />
                <p className="font-bold text-orange-500">Suspicious</p>
                <p className="text-xs text-slate-400">30-50% variance</p>
              </div>
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                <div className="size-3 bg-red-500 rounded-full mb-3 mx-auto" />
                <p className="font-bold text-red-500">Alert</p>
                <p className="text-xs text-slate-400">&gt;50% variance</p>
              </div>
            </div>

            <div className="mt-10 p-6 bg-white/5 rounded-2xl text-left border border-white/10">
              <div className="flex items-start gap-4">
                <BarChart3 size={28} className="text-primary shrink-0 mt-1" />
                <div>
                  <p className="font-bold text-white mb-1">Evidence for PURC/ECG</p>
                  <p className="text-sm text-slate-400">
                    If your meter is in &quot;ALERT&quot; status, generate a timestamped
                    report you can use to file a formal complaint with the Public
                    Utilities Regulatory Commission.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== HOW IT WORKS / FEATURES ===================== */}
      <section className="py-24 bg-slate-900/30" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" id="how-it-works">
            <h2 className="text-4xl font-bold mb-4">
              Everything you need to stop the &quot;Chop&quot;
            </h2>
            <p className="text-slate-400">
              A full suite of tools designed for the modern Ghanaian energy consumer.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: ScanLine,
                title: "Scan (OCR)",
                desc: "Simply point your camera. Our AI reads your meter\u2019s screen automatically. No more typing long serial numbers.",
              },
              {
                icon: BarChart3,
                title: "Daily Usage Tracking",
                desc: "See exactly how much credit you use every 24 hours. Identify which days are costing you the most.",
              },
              {
                icon: Activity,
                title: "Health Mismatches",
                desc: "We flag discrepancies between what your appliances should use and what your meter actually charges.",
              },
              {
                icon: Wallet,
                title: "Top-up History",
                desc: "Maintain a digital log of every scratch card or mobile money top-up to see where the money goes.",
              },
              {
                icon: FileText,
                title: "Budgeting Tools",
                desc: "Set a monthly limit. Get alerts when you\u2019ve reached 50%, 80%, and 100% of your allocated budget.",
              },
              {
                icon: FileText,
                title: "Monthly Reports",
                desc: "Generate a printable PDF summary of your consumption trends and any suspicious activity as evidence.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="glass-landing p-8 rounded-3xl hover:border-primary/50 transition-colors group"
              >
                <feature.icon
                  size={36}
                  className="text-primary mb-6 group-hover:scale-110 transition-transform"
                />
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== WHO IS THIS FOR ===================== */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Built for everyone in the ecosystem
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                icon: Home,
                title: "Homeowners",
                desc: "Stop the leak in your household budget.",
              },
              {
                icon: Store,
                title: "Small Businesses",
                desc: "Keep your overheads predictable and fair.",
              },
              {
                icon: Building,
                title: "Landlords",
                desc: "Manage multi-tenant billing with transparency.",
              },
              {
                icon: Scale,
                title: "Advocates",
                desc: "Gather data to push for better utility policies.",
              },
            ].map((item) => (
              <div key={item.title} className="text-center p-6">
                <div className="size-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                  <item.icon size={24} className="text-primary" />
                </div>
                <h4 className="font-bold mb-2">{item.title}</h4>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== FAQ ===================== */}
      <section className="py-24 bg-slate-900/50" id="faq">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "How accurate is the Health Check?",
                a: "Our algorithms are calibrated based on official PURC tariff guidelines and standard consumption rates for common appliances. The more readings you take over 5\u20137 days, the more accurate your results. We recommend scanning your meter twice daily (morning and evening).",
              },
              {
                q: "Is my data shared with ECG?",
                a: "No. Your data is 100% private and stored locally on your device. Nothing is sent to any server. We are an independent consumer tool, not affiliated with any utility provider.",
              },
              {
                q: "What should I do if my status is \u2018ALERT\u2019?",
                a: "First, run the check again to confirm. If it persists, use the \u201CGenerate Report\u201D button to create a formal evidence report. Take this to your local ECG district office or file an online complaint with PURC.",
              },
              {
                q: "Does it connect to my ECG meter?",
                a: "No. ChopMeter doesn\u2019t connect to any utility system. You scan your own meter and log your own top-ups. This means you have independent, unbiased data that you control.",
              },
              {
                q: "Can I use this outside Ghana?",
                a: "Yes! ChopMeter supports multiple African countries including Nigeria, Kenya, South Africa, and more. Select your country during setup and we\u2019ll adjust the currency and default tariff rate.",
              },
              {
                q: "Is it really free?",
                a: "Yes, 100% free. No sign-up, no subscription, no ads. We built this to help consumers take control of their electricity spend.",
              },
            ].map((item) => (
              <details key={item.q} className="glass-landing rounded-2xl p-6 group">
                <summary className="flex justify-between items-center cursor-pointer list-none">
                  <span className="font-bold pr-4">{item.q}</span>
                  <ChevronDown
                    size={20}
                    className="text-slate-400 shrink-0 transition-transform group-open:rotate-180"
                  />
                </summary>
                <p className="mt-4 text-slate-400 text-sm leading-relaxed">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== FINAL CTA ===================== */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/10 -z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/[0.08] rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl lg:text-5xl font-black mb-6">
            Take control of your electricity today.
          </h2>
          <p className="text-xl text-slate-300 mb-10">
            Stop guessing. Start tracking. Join the movement fighting back.
          </p>
          <button
            onClick={handleCTA}
            className="bg-white text-primary px-10 py-5 rounded-2xl font-black text-xl hover:shadow-2xl hover:scale-105 transition-all active:scale-[0.98]"
          >
            {ctaLabel}
          </button>
          <p className="mt-6 text-slate-400 text-sm">
            No credit card required. No sign-up necessary.
          </p>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="size-8 bg-gradient-to-br from-primary to-primary-violet rounded-lg flex items-center justify-center text-white">
                <Zap size={16} fill="currentColor" />
              </div>
              <span className="text-lg font-bold tracking-tight">ChopMeter</span>
            </div>
            <p className="text-sm text-slate-500">
              Built with love for Ghana. Your data never leaves your device.
            </p>
            <p className="text-sm text-slate-500">&copy; 2025 ChopMeter. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
