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
} from "lucide-react";
import { ChopMeterLogo } from "@/components/ChopMeterLogo";

// Theme-aware classes — since <html> has "dark" hardcoded,
// we can't use Tailwind dark: on the landing page. Instead we
// resolve classes based on isDark state at render time.
function t(isDark: boolean, light: string, dark: string) {
  return isDark ? dark : light;
}

export default function LandingPage() {
  const router = useRouter();
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const settings = getSettings();
    if (settings.onboardingComplete) setIsReturningUser(true);
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("chopmeter_landing_theme");
      if (saved === "dark") setIsDark(true);
      else if (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches) setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("chopmeter_landing_theme", next ? "dark" : "light");
  };

  const handleCTA = () =>
    router.push(isReturningUser ? "/dashboard" : "/onboarding");

  const ctaText = isReturningUser
    ? "Open Dashboard"
    : "Start Tracking \u2014 It\u2019s Free";

  // Resolved theme tokens
  const bg = t(isDark, "bg-white", "bg-[#09090b]");
  const text = t(isDark, "text-gray-600", "text-white/70");
  const heading = t(isDark, "text-gray-900", "text-white");
  const subtext = t(isDark, "text-gray-500", "text-white/55");
  const muted = t(isDark, "text-gray-400", "text-white/40");
  const border = t(isDark, "border-gray-200", "border-white/[0.06]");
  const navBg = t(isDark, "bg-white/80", "bg-[#09090b]/80");
  const cardBg = t(isDark, "bg-gray-50", "bg-white/[0.02]");
  const cardBorder = t(isDark, "border-gray-200", "border-white/[0.07]");
  const cardHover = t(isDark, "hover:shadow-md", "hover:border-white/[0.12]");
  const whiteBg = t(isDark, "bg-white", "bg-white/[0.02]");
  const mobileBg = t(isDark, "bg-white/95", "bg-[#09090b]/95");
  const toggleBorder = t(isDark, "border-gray-200", "border-white/[0.1]");
  const toggleText = t(isDark, "text-gray-500", "text-white/50");

  return (
    <div className={`min-h-screen ${bg} font-display ${text} overflow-x-hidden transition-colors duration-300`}>

      {/* ============================== NAV ============================== */}
      <nav className={`sticky top-0 z-50 w-full h-16 ${navBg} backdrop-blur-xl border-b ${border} flex items-center px-6 lg:px-12 justify-between transition-colors`}>
        <div className="flex items-center gap-2.5">
          <ChopMeterLogo size={130} color={isDark ? "#FFFFFF" : "#111827"} />
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className={`text-sm font-medium ${subtext} hover:text-primary transition-colors`}>How It Works</a>
          <a href="#features" className={`text-sm font-medium ${subtext} hover:text-primary transition-colors`}>Features</a>
          <a href="#faq" className={`text-sm font-medium ${subtext} hover:text-primary transition-colors`}>FAQ</a>
          <button
            onClick={toggleTheme}
            className={`size-9 rounded-lg border ${toggleBorder} flex items-center justify-center ${toggleText} hover:text-primary transition-colors`}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={handleCTA}
            className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-all"
          >
            {isReturningUser ? "Dashboard" : "Get Started"}
          </button>
        </div>
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            className={`size-9 rounded-lg border ${toggleBorder} flex items-center justify-center ${toggleText}`}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button className={heading} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className={`absolute top-16 left-0 right-0 md:hidden px-6 pb-5 pt-3 space-y-1 border-t ${border} ${mobileBg} backdrop-blur-xl`}>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className={`block py-3 text-sm ${subtext} font-medium`}>How It Works</a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className={`block py-3 text-sm ${subtext} font-medium`}>Features</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className={`block py-3 text-sm ${subtext} font-medium`}>FAQ</a>
            <button onClick={handleCTA} className="w-full mt-2 h-11 bg-primary text-white rounded-lg text-sm font-semibold">
              {isReturningUser ? "Dashboard" : "Get Started"}
            </button>
          </div>
        )}
      </nav>

      {/* ============================== HERO ============================== */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-32 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className={`inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-sm font-medium ${t(isDark, "bg-blue-50 border-blue-100", "bg-blue-500/[0.06] border-blue-500/20")} text-primary border mb-6`}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            Built for Ghana&apos;s 1M+ smart meters
          </span>

          <h1 className={`text-5xl lg:text-6xl font-extrabold ${heading} leading-tight tracking-[-0.025em] mb-6`}>
            Is your meter eating your credit?
          </h1>

          <p className={`text-lg lg:text-xl ${subtext} mb-8 max-w-lg leading-relaxed`}>
            Track your prepaid electricity, scan your meter, and detect overcharging instantly. No hidden fees, just clarity.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <button
              onClick={handleCTA}
              className={`group bg-primary text-white px-8 py-4 rounded-xl text-lg font-bold ${t(isDark, "shadow-lg shadow-blue-200", "shadow-lg shadow-blue-500/20")} hover:bg-blue-600 hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2.5`}
            >
              {ctaText}
              <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
            </button>
            <a
              href="#how-it-works"
              className={`h-14 px-8 rounded-xl font-bold text-base flex items-center justify-center border ${cardBorder} ${subtext} hover:text-primary hover:border-primary/30 transition-all`}
            >
              See How It Works
            </a>
          </div>

          <div className={`flex flex-wrap gap-6 text-sm font-medium ${muted}`}>
            <span className="flex items-center gap-2">
              <Lock size={14} className="text-emerald-500" /> No sign-up required
            </span>
            <span className="flex items-center gap-2">
              <Shield size={14} className="text-emerald-500" /> Data stays on your phone
            </span>
          </div>
        </div>

        {/* Phone Mockup */}
        <div className="relative hidden lg:block">
          <div className="mx-auto w-[320px]" style={{ transform: "perspective(1000px) rotateY(-15deg) rotateX(5deg)" }}>
            <div className={`rounded-[3rem] p-[2px] ${t(isDark, "bg-gradient-to-b from-gray-300 to-gray-100", "bg-gradient-to-b from-white/[0.15] to-white/[0.05]")} shadow-2xl`}>
              <div className="rounded-[2.9rem] bg-gray-900 p-3.5">
                <div className="w-[80px] h-[24px] bg-black rounded-full mx-auto mb-4" />
                <div className="space-y-3 px-1">
                  <div className="flex items-center justify-between px-0.5">
                    <div className="flex items-center gap-2">
                      <ChopMeterLogo size={70} color="rgba(255,255,255,0.8)" />
                    </div>
                    <span className="text-white/30 text-[9px] font-medium">9:41</span>
                  </div>
                  <p className="text-white/35 text-[10px] font-medium px-0.5">Good evening, Kofi</p>
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
      <section className={`py-24 lg:py-32 ${bg} border-t ${border}`} id="how-it-works">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <h2 className={`text-3xl lg:text-4xl font-bold ${heading} mb-16`}>How ChopMeter Works</h2>

          <div className="grid md:grid-cols-3 gap-6 mb-20">
            {[
              {
                num: "1",
                icon: Lightbulb,
                title: "Select Appliances",
                desc: "Choose which gadgets you use daily (Fridge, AC, TV) to build your usage profile.",
                color: "text-blue-500",
                iconBg: t(isDark, "bg-blue-50", "bg-blue-500/10"),
              },
              {
                num: "2",
                icon: Camera,
                title: "Scan Meter",
                desc: "Point your camera at your meter. Our OCR AI reads your credit balance instantly.",
                color: "text-violet-500",
                iconBg: t(isDark, "bg-violet-50", "bg-violet-500/10"),
              },
              {
                num: "3",
                icon: Activity,
                title: "Get Verdict",
                desc: "Compare your predicted usage with real costs to see if you're being overcharged.",
                color: "text-red-500",
                iconBg: t(isDark, "bg-red-50", "bg-red-500/10"),
              },
            ].map((step) => (
              <div
                key={step.num}
                className={`${cardBg} p-8 rounded-2xl border ${cardBorder} text-left ${cardHover} transition-all`}
              >
                <div className={`w-12 h-12 ${step.iconBg} rounded-lg flex items-center justify-center mb-6`}>
                  <span className={`${step.color} font-bold text-lg`}>{step.num}</span>
                </div>
                <h4 className={`text-xl font-bold ${heading} mb-4`}>{step.title}</h4>
                <p className={`${subtext} leading-relaxed`}>{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Verdict Scale */}
          <div className="max-w-3xl mx-auto">
            <p className={`text-sm font-semibold uppercase tracking-wider ${muted} mb-6`}>
              Our Analysis Verdict Scale
            </p>
            <div className={`h-4 w-full rounded-full overflow-hidden mb-4 border ${t(isDark, "border-gray-100", "border-white/[0.04]")}`}>
              <div
                className="h-full w-full rounded-full"
                style={{ background: "linear-gradient(to right, #22C55E, #EAB308 35%, #F97316 60%, #EF4444)" }}
              />
            </div>
            <div className={`flex justify-between text-xs font-bold ${t(isDark, "text-gray-700", "text-white/70")} px-2`}>
              <span>HEALTHY</span>
              <span>WATCH</span>
              <span>SUSPICIOUS</span>
              <span>ALERT</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================== FEATURES ============================== */}
      <section className={`py-24 lg:py-32 ${cardBg} border-t ${border}`} id="features">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="mb-16">
            <h2 className={`text-3xl lg:text-4xl font-bold ${heading} mb-4`}>Powerful tracking tools</h2>
            <p className={`${subtext} text-lg`}>Everything you need to stop losing money to your meter.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Camera OCR — large */}
            <div className={`lg:col-span-2 ${whiteBg} p-8 rounded-2xl border ${cardBorder} ${cardHover} transition-all`}>
              <div className={`w-10 h-10 ${t(isDark, "bg-blue-50", "bg-blue-500/10")} text-primary rounded-lg flex items-center justify-center mb-6`}>
                <ScanLine size={22} />
              </div>
              <h3 className={`text-xl font-bold ${heading} mb-2`}>Smart Camera OCR</h3>
              <p className={subtext}>Just snap a photo. Our engine extracts the meter reading accurately even in low light.</p>
            </div>

            {/* Privacy */}
            <div className={`${whiteBg} p-8 rounded-2xl border ${cardBorder} ${cardHover} transition-all`}>
              <div className={`w-10 h-10 ${t(isDark, "bg-emerald-50", "bg-emerald-500/10")} text-emerald-500 rounded-lg flex items-center justify-center mb-6`}>
                <Shield size={22} />
              </div>
              <h3 className={`text-xl font-bold ${heading} mb-2`}>100% Privacy</h3>
              <p className={`${subtext} text-sm`}>Your energy data is sensitive. We never upload your logs to any server.</p>
            </div>

            {/* Evidence */}
            <div className={`${whiteBg} p-8 rounded-2xl border ${cardBorder} ${cardHover} transition-all`}>
              <div className={`w-10 h-10 ${t(isDark, "bg-red-50", "bg-red-500/10")} text-red-500 rounded-lg flex items-center justify-center mb-6`}>
                <FileText size={22} />
              </div>
              <h3 className={`text-xl font-bold ${heading} mb-2`}>Evidence PDF</h3>
              <p className={`${subtext} text-sm`}>Download a detailed audit report to show your utility provider.</p>
            </div>

            {/* Analytics — full width */}
            <div className={`lg:col-span-4 ${whiteBg} p-10 rounded-2xl border ${cardBorder} flex flex-col md:flex-row items-center gap-10`}>
              <div className="flex-1">
                <div className={`w-10 h-10 ${t(isDark, "bg-blue-50", "bg-blue-500/10")} text-primary rounded-lg flex items-center justify-center mb-6`}>
                  <BarChart3 size={22} />
                </div>
                <h3 className={`text-2xl font-bold ${heading} mb-4`}>Deep Usage Analytics</h3>
                <p className={`${subtext} leading-relaxed`}>
                  See exactly which day of the week your credit &ldquo;disappears.&rdquo; Understand if your fridge is faulty or if the tariff changed without notice. Our dashboard breaks down costs per appliance category.
                </p>
              </div>
              <div className={`flex-1 w-full ${cardBg} p-6 rounded-xl border ${cardBorder} border-dashed`}>
                <div className="space-y-4">
                  {[
                    { day: "Mon", w: "50%", cost: "GH₵ 4.2", color: "bg-primary" },
                    { day: "Tue", w: "75%", cost: "GH₵ 8.1", color: "bg-primary" },
                    { day: "Wed", w: "100%", cost: "GH₵ 12.5", color: "bg-red-500" },
                  ].map((row) => (
                    <div key={row.day} className="flex items-center justify-between gap-3">
                      <span className={`text-xs ${subtext} w-8`}>{row.day}</span>
                      <div className={`h-2 flex-1 ${t(isDark, "bg-gray-100", "bg-white/[0.04]")} rounded-full overflow-hidden`}>
                        <div className={`h-full ${row.color} rounded-full`} style={{ width: row.w }} />
                      </div>
                      <span className={`text-xs font-bold ${t(isDark, "text-gray-700", "text-white/70")} w-16 text-right`}>{row.cost}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================== FAQ ============================== */}
      <section className={`py-24 lg:py-32 ${bg}`} id="faq">
        <div className="max-w-3xl mx-auto px-6 lg:px-12">
          <h2 className={`text-3xl font-bold ${heading} text-center mb-16`}>Frequently Asked Questions</h2>

          <div className="space-y-4">
            {[
              {
                q: "Is this affiliated with ECG or NEDCo?",
                a: "No, ChopMeter is an independent utility tool built to empower consumers with their own data. We use standard PURC tariff rates to calculate your expected costs.",
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
                className={`group border ${cardBorder} rounded-xl px-6 py-4 ${cardBg} ${cardHover} transition-colors [&_summary::-webkit-details-marker]:hidden`}
              >
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <h5 className={`text-lg font-semibold ${t(isDark, "text-gray-900", "text-white/80")} pr-8`}>{item.q}</h5>
                  <ChevronDown size={18} className={`${muted} shrink-0 transition-transform group-open:rotate-180`} />
                </summary>
                <p className={`mt-4 ${subtext} leading-relaxed`}>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== FINAL CTA ============================== */}
      <section className={`py-24 lg:py-32 ${bg}`}>
        <div className={`max-w-5xl mx-auto px-6 lg:px-12 text-center ${t(isDark, "bg-gray-900", "bg-white/[0.03] border border-white/[0.06]")} rounded-[2.5rem] py-20`}>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Take control of your electricity
          </h2>
          <p className={`${t(isDark, "text-blue-200", "text-white/45")} text-lg mb-10 max-w-xl mx-auto`}>
            Join thousands of Ghanaians using ChopMeter to audit their bills and save money.
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

      {/* ============================== FOOTER ============================== */}
      <footer className={`py-12 border-t ${border}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center">
            <ChopMeterLogo size={110} color={isDark ? "rgba(255,255,255,0.3)" : "#111827"} />
          </div>
          <p className={`text-sm ${muted}`}>
            &copy; 2026 ChopMeter &middot; Built for Ghana.
          </p>
          <div className={`flex gap-6 text-sm font-medium ${subtext}`}>
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
