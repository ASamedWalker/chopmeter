"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveSettings } from "@/lib/storage";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const handleFinish = () => {
    saveSettings({ onboardingComplete: true });
    router.replace("/dashboard");
  };

  const next = () => (step < 2 ? setStep(step + 1) : handleFinish());
  const back = () => step > 0 && setStep(step - 1);

  return (
    <div className="min-h-screen bg-bg-dark flex flex-col items-center justify-center">
      {step === 0 && <Screen1 onNext={next} onSkip={handleFinish} />}
      {step === 1 && (
        <Screen2 onNext={next} onBack={back} onSkip={handleFinish} />
      )}
      {step === 2 && <Screen3 onFinish={handleFinish} onBack={back} />}
    </div>
  );
}

/* ======================== SCREEN 1 ======================== */
function Screen1({
  onNext,
  onSkip,
}: {
  onNext: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="w-full max-w-[480px] h-screen max-h-[900px] flex flex-col bg-bg-dark relative shadow-2xl overflow-hidden sm:rounded-xl sm:h-[85vh] sm:border sm:border-primary/10">
      <header className="flex items-center justify-between px-6 py-5 z-20">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center size-8 rounded-lg bg-primary/20 text-primary">
            <span className="material-symbols-outlined text-xl">
              electric_bolt
            </span>
          </div>
          <h2 className="text-white text-lg font-bold tracking-tight">
            ChopMeter
          </h2>
        </div>
        <button
          onClick={onSkip}
          className="text-sm font-medium text-slate-400 hover:text-primary transition-colors"
        >
          Skip
        </button>
      </header>

      <main className="flex-1 flex flex-col relative z-10 px-6 pb-6 overflow-y-auto">
        <div className="flex-1 flex items-center justify-center min-h-[300px] py-4 relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
            <div className="w-64 h-64 bg-primary/30 rounded-full blur-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>

          <div className="relative w-full aspect-[4/5] max-h-[400px] rounded-2xl overflow-hidden bg-gradient-to-b from-primary/5 to-primary/10 border border-primary/10 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/80 via-transparent to-transparent" />
            {/* Illustration placeholder */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="material-symbols-outlined text-primary/20"
                style={{ fontSize: 120, fontVariationSettings: "'FILL' 1" }}
              >
                electric_meter
              </span>
            </div>
            <div className="absolute bottom-4 left-4 right-4 bg-bg-dark/60 backdrop-blur-md border border-primary/20 rounded-xl p-3 flex items-center gap-3">
              <div className="size-10 rounded-full bg-primary flex items-center justify-center text-bg-dark shrink-0">
                <span className="material-symbols-outlined">savings</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-primary font-bold uppercase tracking-wider">
                  Savings
                </span>
                <span className="text-sm text-white font-medium">
                  GH₵ 120.00 saved this month
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center text-center mt-4 mb-2 space-y-4">
          <h1 className="text-3xl font-extrabold text-white leading-tight tracking-tight">
            No more meter dey{" "}
            <span className="text-primary">chop your money</span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-xs mx-auto">
            Take control of your electricity. Track usage in real-time and stop
            overpaying for your utilities today.
          </p>
        </div>
      </main>

      <footer className="px-6 pb-8 pt-2 w-full z-20">
        <div className="flex justify-center gap-2 mb-6">
          <div className="h-1.5 w-6 rounded-full bg-primary transition-all duration-300" />
          <div className="h-1.5 w-1.5 rounded-full bg-slate-700" />
          <div className="h-1.5 w-1.5 rounded-full bg-slate-700" />
        </div>
        <button
          onClick={onNext}
          className="w-full group relative flex items-center justify-center overflow-hidden rounded-xl h-14 bg-primary hover:bg-primary/90 transition-all duration-300 shadow-[0_0_20px_rgba(0,255,65,0.3)] hover:shadow-[0_0_30px_rgba(0,255,65,0.5)]"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
          <span className="text-bg-dark text-lg font-bold tracking-wide mr-2 relative z-10">
            Next
          </span>
          <span className="material-symbols-outlined text-bg-dark relative z-10 transition-transform group-hover:translate-x-1">
            arrow_forward
          </span>
        </button>
      </footer>
    </div>
  );
}

/* ======================== SCREEN 2 ======================== */
function Screen2({
  onNext,
  onBack,
  onSkip,
}: {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="w-full min-h-screen flex flex-col bg-bg-dark">
      <header className="w-full border-b border-surface-border bg-bg-dark sticky top-0 z-50">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 text-white">
              <div className="size-8 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-2xl">
                  electric_bolt
                </span>
              </div>
              <h2 className="text-lg font-bold tracking-tight">ChopMeter</h2>
            </div>
            <button
              onClick={onSkip}
              className="flex items-center justify-center rounded-lg h-9 px-4 bg-primary text-bg-dark text-sm font-bold hover:brightness-110 transition-all"
            >
              Skip
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center py-10 px-4">
        <div className="max-w-[960px] w-full flex flex-col gap-12 lg:gap-16">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 flex flex-col gap-6 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider border border-primary/20">
                  Step 2 of 3
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
                Snap your meter, <br />
                <span className="text-primary">track your units.</span>
              </h1>
              <p className="text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Simply take a photo of your digital electric meter to instantly
                log your current usage. ChopMeter&apos;s smart scanning
                technology does the heavy lifting, ensuring accurate tracking.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <button
                  onClick={onBack}
                  className="w-full sm:w-auto min-w-[140px] h-12 rounded-xl border border-surface-border text-white font-bold hover:bg-surface-dark transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    arrow_back
                  </span>
                  Back
                </button>
                <button
                  onClick={onNext}
                  className="w-full sm:w-auto min-w-[140px] h-12 rounded-xl bg-primary text-bg-dark font-bold hover:brightness-110 shadow-[0_0_20px_rgba(0,255,65,0.3)] transition-all flex items-center justify-center gap-2"
                >
                  Next
                  <span className="material-symbols-outlined text-[20px]">
                    arrow_forward
                  </span>
                </button>
              </div>
            </div>

            <div className="flex-1 w-full max-w-[480px] lg:max-w-none relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-yellow-400/20 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
              <div className="relative rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-2xl aspect-[4/3] flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-transparent to-transparent" />
                <div className="relative z-10 flex flex-col items-center animate-[pulse_4s_ease-in-out_infinite]">
                  <div className="w-48 h-48 border-2 border-primary rounded-xl relative flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-primary -mt-1 -ml-1" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-primary -mt-1 -mr-1" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-primary -mb-1 -ml-1" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-primary -mb-1 -mr-1" />
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_#00FF41] animate-scan" />
                    <span className="text-white font-mono text-2xl font-bold tracking-widest drop-shadow-md">
                      2450.5
                    </span>
                  </div>
                  <div className="mt-4 flex justify-center">
                    <div className="px-3 py-1 bg-black/60 rounded-full text-primary text-xs font-bold border border-primary/30 flex items-center gap-1 backdrop-blur-md">
                      <span className="material-symbols-outlined text-sm">
                        check_circle
                      </span>
                      Meter Found
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 border-t border-surface-border">
            {[
              {
                icon: "center_focus_strong",
                color: "bg-primary/10 text-primary",
                title: "Instant Scan",
                desc: "Point and shoot to capture meter readings instantly with 99% accuracy.",
              },
              {
                icon: "auto_graph",
                color: "bg-yellow-500/10 text-yellow-500",
                title: "Auto-Log",
                desc: "Your readings are automatically saved and graphed over time.",
              },
              {
                icon: "notifications_active",
                color: "bg-blue-500/10 text-blue-500",
                title: "Usage Alerts",
                desc: "Get notified immediately when your usage spikes unexpectedly.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="flex flex-col gap-3 p-4 rounded-xl hover:bg-surface-dark/50 transition-colors"
              >
                <div
                  className={`size-12 rounded-lg ${f.color} flex items-center justify-center mb-2`}
                >
                  <span className="material-symbols-outlined text-2xl">
                    {f.icon}
                  </span>
                </div>
                <h3 className="text-white text-lg font-bold mb-1">
                  {f.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ======================== SCREEN 3 ======================== */
function Screen3({
  onFinish,
  onBack,
}: {
  onFinish: () => void;
  onBack: () => void;
}) {
  return (
    <div className="w-full min-h-screen flex flex-col bg-bg-dark">
      <header className="flex items-center justify-between whitespace-nowrap px-6 py-4 lg:px-10 max-w-[960px] mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="size-8 flex items-center justify-center text-primary">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 32 }}
            >
              bolt
            </span>
          </div>
          <h2 className="text-white text-xl font-bold leading-tight tracking-tight">
            ChopMeter
          </h2>
        </div>
        <button
          onClick={onFinish}
          className="flex min-w-[84px] items-center justify-center rounded-lg h-10 px-4 text-white text-sm font-bold hover:bg-surface-dark transition-colors"
        >
          Skip
        </button>
      </header>

      <div className="flex flex-col flex-1 items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-md aspect-square relative mb-8 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-full opacity-20 blur-3xl" />
          <div className="absolute w-2/3 h-2/3 bg-[#CE1126]/10 rounded-full blur-2xl top-1/4 left-1/4" />

          <div className="relative z-10 flex flex-col items-center justify-center p-12 bg-surface-dark rounded-full shadow-2xl border border-surface-border aspect-square w-64 h-64 lg:w-80 lg:h-80">
            <div className="relative">
              <span
                className="material-symbols-outlined text-[#FCD116] drop-shadow-[0_0_15px_rgba(252,209,22,0.4)]"
                style={{
                  fontSize: 120,
                  fontVariationSettings: "'FILL' 1, 'wght' 400",
                }}
              >
                notifications_active
              </span>
              <div className="absolute top-2 right-4 w-6 h-6 bg-[#CE1126] rounded-full border-4 border-surface-dark" />
            </div>
            <div className="absolute -z-10 w-full h-full border border-primary/20 rounded-full animate-pulse" />
            <div className="absolute -z-10 w-[120%] h-[120%] border border-primary/10 rounded-full" />
          </div>
        </div>

        <div className="flex flex-col gap-3 text-center max-w-lg mb-8">
          <h1 className="text-white text-3xl md:text-4xl font-bold leading-tight">
            Get alerts before your credit finishes
          </h1>
          <p className="text-slate-400 text-base md:text-lg font-normal leading-relaxed">
            Avoid sudden blackouts. We notify you when your electricity credit
            is running low so you can top up in time.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="flex size-10 items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="size-2.5 rounded-full bg-slate-700" />
            <div className="size-2.5 rounded-full bg-slate-700" />
            <div className="w-8 h-2.5 rounded-full bg-primary" />
          </div>
          <div className="size-10 opacity-0 pointer-events-none">
            <span className="material-symbols-outlined">chevron_right</span>
          </div>
        </div>

        <div className="w-full max-w-sm px-4">
          <button
            onClick={onFinish}
            className="flex w-full items-center justify-center rounded-xl h-14 px-5 bg-primary text-bg-dark text-lg font-bold transition-all shadow-[0_0_20px_rgba(0,255,65,0.3)] hover:shadow-[0_0_30px_rgba(0,255,65,0.5)] transform hover:-translate-y-0.5"
          >
            Get Started
            <span className="material-symbols-outlined ml-2 text-xl">
              arrow_forward
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
