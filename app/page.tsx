"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSettings } from "@/lib/storage";
import {
  Zap,
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
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const settings = getSettings();
    if (settings.onboardingComplete) setIsReturningUser(true);
  }, []);

  const handleCTA = () =>
    router.push(isReturningUser ? "/dashboard" : "/onboarding");

  const ctaText = isReturningUser
    ? "Open Dashboard"
    : "Start Tracking \u2014 It\u2019s Free";

  return (
    <div className="min-h-screen bg-[#09090b] font-display text-white overflow-x-hidden selection:bg-primary/30">
      {/* ============================== NAV ============================== */}
      <nav className="fixed top-0 w-full z-50 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="size-9 bg-gradient-to-br from-primary to-primary-violet rounded-lg flex items-center justify-center">
              <Zap size={17} className="text-white" fill="currentColor" />
            </div>
            <span className="font-bold text-base">ChopMeter</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm text-white/60 hover:text-white transition-colors font-medium">How It Works</a>
            <a href="#features" className="text-sm text-white/60 hover:text-white transition-colors font-medium">Features</a>
            <a href="#faq" className="text-sm text-white/60 hover:text-white transition-colors font-medium">FAQ</a>
            <button
              onClick={handleCTA}
              className="h-10 px-5 rounded-lg bg-white text-[#09090b] text-sm font-semibold hover:bg-white/90 transition-all"
            >
              {isReturningUser ? "Dashboard" : "Get Started"}
            </button>
          </div>
          <button className="md:hidden text-white/70" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden px-6 pb-5 pt-3 space-y-1 border-t border-white/[0.06] bg-[#09090b]/95 backdrop-blur-xl">
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block py-3 text-sm text-white/60 font-medium">How It Works</a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block py-3 text-sm text-white/60 font-medium">Features</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block py-3 text-sm text-white/60 font-medium">FAQ</a>
            <button onClick={handleCTA} className="w-full mt-2 h-11 bg-white text-[#09090b] rounded-lg text-sm font-semibold">
              {isReturningUser ? "Dashboard" : "Get Started"}
            </button>
          </div>
        )}
      </nav>

      {/* ============================== HERO ============================== */}
      <section className="relative px-6 pt-36 sm:pt-48 pb-28 sm:pb-36">
        {/* Background glows */}
        <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-primary/[0.05] rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute top-72 right-[10%] w-[350px] h-[350px] bg-primary-violet/[0.04] rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-[1200px] mx-auto relative z-10">
          <div className="grid lg:grid-cols-[1fr_380px] gap-16 lg:gap-24 items-center">
            {/* Left — Copy */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2.5 h-8 px-3.5 rounded-full border border-red-500/20 bg-red-500/[0.06] mb-10">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
                <span className="text-red-400 text-xs font-medium">Ghana Smart Meter Crisis</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.08] tracking-[-0.025em] mb-7">
                Is your meter
                <br />
                <span className="gradient-primary-text">chopping</span> your money?
              </h1>

              <p className="text-white/55 text-lg sm:text-xl leading-[1.65] max-w-[500px] mb-12 font-medium">
                Track your prepaid electricity usage and find out if your smart
                meter is overcharging you. No download, no sign-up.
              </p>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <button
                  onClick={handleCTA}
                  className="group h-14 px-8 bg-white text-[#09090b] rounded-xl font-bold text-base flex items-center justify-center gap-2.5 hover:bg-white/90 transition-all active:scale-[0.98] shadow-[0_0_30px_rgba(255,255,255,0.07)]"
                >
                  {ctaText}
                  <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
                </button>
                <a
                  href="#how-it-works"
                  className="h-14 px-8 rounded-xl font-bold text-base flex items-center justify-center border border-white/[0.12] text-white/60 hover:text-white hover:bg-white/[0.04] hover:border-white/[0.2] transition-all"
                >
                  See How It Works
                </a>
              </div>

              {/* Trust */}
              <div className="flex items-center gap-6 text-white/40 text-sm font-medium">
                <span className="flex items-center gap-2"><Lock size={14} /> No sign-up needed</span>
                <span className="flex items-center gap-2"><Shield size={14} /> Data stays on your phone</span>
              </div>
            </div>

            {/* Right — Phone Mockup */}
            <div className="relative hidden lg:block">
              <div className="absolute -inset-12 bg-gradient-to-b from-primary/[0.07] to-transparent rounded-full blur-[80px] pointer-events-none" />

              {/* Phone shell */}
              <div className="relative w-[300px] mx-auto">
                <div className="rounded-[3rem] p-[2px] bg-gradient-to-b from-white/[0.15] to-white/[0.05] shadow-2xl shadow-black/50">
                  <div className="rounded-[2.9rem] bg-[#111113] p-3.5">
                    {/* Dynamic island */}
                    <div className="w-[80px] h-[24px] bg-black rounded-full mx-auto mb-4" />

                    {/* Screen content */}
                    <div className="space-y-3 px-1">
                      {/* Header */}
                      <div className="flex items-center justify-between px-0.5">
                        <div className="flex items-center gap-2">
                          <div className="size-6 bg-gradient-to-br from-primary to-primary-violet rounded-md flex items-center justify-center">
                            <Zap size={11} className="text-white" fill="currentColor" />
                          </div>
                          <span className="text-white/80 text-[10px] font-bold">ChopMeter</span>
                        </div>
                        <span className="text-white/30 text-[9px] font-medium">9:41</span>
                      </div>

                      <p className="text-white/35 text-[10px] font-medium px-0.5">Good evening, Kofi</p>

                      {/* Balance */}
                      <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-3.5">
                        <p className="text-white/35 text-[8px] uppercase tracking-[0.1em] font-semibold">Credit Balance</p>
                        <p className="text-white text-2xl font-extrabold tracking-tight mt-1">GH₵ 124.50</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="h-1.5 flex-1 bg-white/[0.06] rounded-full overflow-hidden">
                            <div className="h-full w-[65%] bg-gradient-to-r from-primary to-emerald-400 rounded-full" />
                          </div>
                          <span className="text-emerald-400 text-[9px] font-bold">~8 days left</span>
                        </div>
                      </div>

                      {/* Chart */}
                      <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-3.5">
                        <div className="flex items-center justify-between mb-2.5">
                          <p className="text-white/35 text-[8px] uppercase tracking-[0.1em] font-semibold">7-Day Usage</p>
                          <p className="text-white/50 text-[9px] font-bold">4.2 kWh avg</p>
                        </div>
                        <div className="flex items-end gap-1 h-14">
                          {[38, 62, 48, 75, 42, 58, 52].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col justify-end h-full">
                              <div
                                className="w-full rounded-sm bg-gradient-to-t from-primary/80 to-primary-violet/60"
                                style={{ height: `${h}%` }}
                              />
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between mt-2 px-0.5">
                          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                            <span key={i} className="text-[7px] text-white/25 flex-1 text-center font-medium">{d}</span>
                          ))}
                        </div>
                      </div>

                      {/* Health check */}
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

                    {/* Home bar */}
                    <div className="w-24 h-1 bg-white/[0.1] rounded-full mx-auto mt-5 mb-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================== HOW IT WORKS ============================== */}
      <section className="px-6 py-28 sm:py-36 border-t border-white/[0.06]" id="how-it-works">
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-20">
            <p className="text-primary text-sm font-semibold uppercase tracking-[0.08em] mb-4">How It Works</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-[-0.025em] leading-[1.1] mb-5">
              Verify your meter in three steps
            </h2>
            <p className="text-white/50 text-lg leading-[1.65] font-medium">
              Over 1M smart prepaid meters have been installed across Ghana.
              ChopMeter lets you independently check if yours is running accurately.
            </p>
          </div>

          {/* 3 Step cards */}
          <div className="grid md:grid-cols-3 gap-5 lg:gap-6 mb-20">
            {[
              {
                num: "01",
                icon: Lightbulb,
                title: "Select your appliances",
                desc: "Pick what you use at home \u2014 fans, fridge, TV, lights \u2014 and how many hours you run them daily. We calculate your expected consumption.",
                gradient: "from-blue-500 to-cyan-400",
              },
              {
                num: "02",
                icon: ScanLine,
                title: "Scan your meter",
                desc: "Point your phone camera at your prepaid meter display. Our OCR reads the digits automatically \u2014 no typing needed.",
                gradient: "from-primary-violet to-purple-400",
              },
              {
                num: "03",
                icon: Activity,
                title: "Get your verdict",
                desc: "We compare what your meter says against what your appliances should use. If there\u2019s a gap \u2014 you\u2019ll see exactly how much you\u2019re overpaying.",
                gradient: "from-red-500 to-orange-400",
              },
            ].map((step) => (
              <div
                key={step.num}
                className="group rounded-2xl border border-white/[0.07] bg-white/[0.02] p-8 sm:p-10 hover:border-white/[0.12] hover:bg-white/[0.035] transition-all duration-300"
              >
                <div className={`size-12 rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mb-6 group-hover:shadow-lg transition-shadow`}>
                  <step.icon size={22} className="text-white" />
                </div>

                <p className={`text-xs font-bold uppercase tracking-[0.1em] mb-4 bg-gradient-to-r ${step.gradient} bg-clip-text text-transparent`}>
                  Step {step.num}
                </p>

                <h3 className="text-xl font-bold mb-3 tracking-tight">{step.title}</h3>
                <p className="text-white/50 text-base leading-[1.65] font-medium">{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Verdict spectrum */}
          <div className="max-w-3xl mx-auto">
            <p className="text-center text-white/40 text-sm font-semibold uppercase tracking-[0.08em] mb-8">
              Your meter gets a clear diagnosis
            </p>

            {/* Spectrum bar */}
            <div className="px-4 sm:px-8">
              <div className="h-4 rounded-full bg-white/[0.04] overflow-hidden mb-5 border border-white/[0.04]">
                <div
                  className="h-full w-full rounded-full"
                  style={{ background: "linear-gradient(to right, #10b981, #eab308 35%, #f97316 60%, #ef4444)" }}
                />
              </div>

              <div className="flex text-center">
                <div className="flex-1">
                  <p className="text-emerald-400 text-sm font-bold mb-1">Healthy</p>
                  <p className="text-white/35 text-xs font-medium">&lt;15%</p>
                </div>
                <div className="flex-1">
                  <p className="text-yellow-400 text-sm font-bold mb-1">Watch</p>
                  <p className="text-white/35 text-xs font-medium">15–30%</p>
                </div>
                <div className="flex-1">
                  <p className="text-orange-400 text-sm font-bold mb-1">Suspicious</p>
                  <p className="text-white/35 text-xs font-medium">30–50%</p>
                </div>
                <div className="flex-1">
                  <p className="text-red-400 text-sm font-bold mb-1">Alert</p>
                  <p className="text-white/35 text-xs font-medium">&gt;50% </p>
                </div>
              </div>
            </div>

            <p className="text-center text-white/35 text-sm mt-8 font-medium leading-relaxed max-w-lg mx-auto">
              If your meter reads 30%+ higher than expected, generate a report and take it to ECG or PURC as evidence.
            </p>
          </div>
        </div>
      </section>

      {/* ============================== FEATURES ============================== */}
      <section className="px-6 py-28 sm:py-36 border-t border-white/[0.06]" id="features">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <p className="text-primary text-sm font-semibold uppercase tracking-[0.08em] mb-4">Features</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-[-0.025em] leading-[1.1]">
              Everything to stop the chop
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 lg:gap-6 max-w-[900px] mx-auto">
            {[
              {
                icon: ScanLine,
                title: "Camera OCR Scanner",
                desc: "Point your phone camera at the meter. We read the numbers instantly using on-device text recognition.",
                gradient: "from-blue-500 to-cyan-400",
              },
              {
                icon: BarChart3,
                title: "Usage Analytics",
                desc: "Track daily consumption, see your burn rate, and know exactly how many days until your credit runs out.",
                gradient: "from-primary-violet to-purple-400",
              },
              {
                icon: FileText,
                title: "Evidence Reports",
                desc: "Generate timestamped, printable reports with your readings and health check results for ECG or PURC complaints.",
                gradient: "from-emerald-500 to-teal-400",
              },
              {
                icon: Shield,
                title: "Fully Private",
                desc: "All data lives in your browser\u2019s local storage. No accounts, no servers, no cloud. You own everything.",
                gradient: "from-amber-500 to-orange-400",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-white/[0.07] bg-white/[0.02] p-8 sm:p-10 hover:border-white/[0.12] hover:bg-white/[0.035] transition-all duration-300"
              >
                <div className={`size-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-6 group-hover:shadow-lg transition-shadow`}>
                  <f.icon size={22} className="text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2 tracking-tight">{f.title}</h3>
                <p className="text-white/50 text-base leading-[1.65] font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== FAQ ============================== */}
      <section className="px-6 py-28 sm:py-36 border-t border-white/[0.06]" id="faq">
        <div className="max-w-[700px] mx-auto">
          <div className="text-center mb-16">
            <p className="text-primary text-sm font-semibold uppercase tracking-[0.08em] mb-4">FAQ</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-[-0.025em] leading-[1.1]">
              Common questions
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "Does ChopMeter connect to my ECG meter?",
                a: "No. You scan your own meter and log your own data. We\u2019re fully independent and not affiliated with any utility company. Your data is unbiased and you control it.",
              },
              {
                q: "Is my data safe?",
                a: "Everything is stored locally in your browser. No data is ever sent to a server. If you clear your browser data, it\u2019s gone \u2014 we never had it.",
              },
              {
                q: "What should I do if my meter shows ALERT?",
                a: "Generate a timestamped report from the app and take it to your nearest ECG district office. You can also file a formal complaint with PURC for an independent meter audit.",
              },
            ].map((item, i) => (
              <details key={i} className="group rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12] transition-colors">
                <summary className="flex justify-between items-center cursor-pointer list-none p-6">
                  <span className="text-base font-semibold pr-8 text-white/80">{item.q}</span>
                  <ChevronDown size={18} className="text-white/25 shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-6 pb-6 -mt-1">
                  <p className="text-white/50 text-base leading-[1.7] font-medium">{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== FINAL CTA ============================== */}
      <section className="px-6 py-28 sm:py-36 border-t border-white/[0.06] relative">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/[0.04] rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-lg mx-auto text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-[-0.025em] leading-[1.1] mb-5">
            Take control of your electricity
          </h2>
          <p className="text-white/45 text-lg mb-12 font-medium leading-relaxed">
            No sign-up. No download. Works right in your browser.
          </p>
          <button
            onClick={handleCTA}
            className="group h-14 px-10 bg-white text-[#09090b] rounded-xl font-bold text-base hover:bg-white/90 transition-all active:scale-[0.98] shadow-[0_0_40px_rgba(255,255,255,0.07)] inline-flex items-center gap-2.5"
          >
            {ctaText}
            <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </section>

      {/* ============================== FOOTER ============================== */}
      <footer className="px-6 py-10 border-t border-white/[0.06]">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="size-7 bg-gradient-to-br from-primary to-primary-violet rounded-md flex items-center justify-center">
              <Zap size={13} className="text-white" fill="currentColor" />
            </div>
            <span className="text-sm font-semibold text-white/30">ChopMeter</span>
          </div>
          <p className="text-sm text-white/20 font-medium">
            &copy; 2026 ChopMeter &middot; Built for Ghana &middot; Data never leaves your device
          </p>
        </div>
      </footer>
    </div>
  );
}
