"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveSettings } from "@/lib/storage";
import { COUNTRIES, type CountryConfig } from "@/lib/countries";
import {
  Zap,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  ScanLine,
  TrendingUp,
  Sparkles,
  Clock,
} from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState<CountryConfig>(
    COUNTRIES[0]
  );
  const [displayName, setDisplayName] = useState("");
  const [meterNumber, setMeterNumber] = useState("");
  const [balance, setBalance] = useState("");
  const [tariff, setTariff] = useState(COUNTRIES[0].defaultTariff.toString());
  const [tariffEdited, setTariffEdited] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const sanitize = (s: string) => s.replace(/<[^>]*>/g, "").trim();

  const handleFinish = () => {
    const balanceNum = Math.min(999999.99, Math.max(0, parseFloat(balance) || 0));
    const tariffNum = Math.min(99.99, Math.max(0, parseFloat(tariff) || selectedCountry.defaultTariff));

    saveSettings({
      onboardingComplete: true,
      countryCode: selectedCountry.code,
      displayName: sanitize(displayName).slice(0, 50),
      meterNumber: sanitize(meterNumber).slice(0, 20),
      lastBalance: balanceNum,
      lastBalanceDate: Date.now(),
      tariffRate: tariffNum,
      tariffOverridden: tariffEdited,
    });
    router.replace("/dashboard");
  };

  const handleCountrySelect = (country: CountryConfig) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
    if (!tariffEdited) {
      setTariff(country.defaultTariff.toString());
    }
  };

  const next = () => {
    if (step < 2) setStep(step + 1);
    else handleFinish();
  };

  const back = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-bg-dark flex flex-col items-center justify-center">
      {step === 0 && <WelcomeScreen onNext={next} />}
      {step === 1 && (
        <QuickSetupScreen
          country={selectedCountry}
          showCountryPicker={showCountryPicker}
          setShowCountryPicker={setShowCountryPicker}
          onCountrySelect={handleCountrySelect}
          displayName={displayName}
          setDisplayName={setDisplayName}
          meterNumber={meterNumber}
          setMeterNumber={setMeterNumber}
          balance={balance}
          setBalance={setBalance}
          tariff={tariff}
          setTariff={(v) => {
            setTariff(v);
            setTariffEdited(true);
          }}
          onNext={next}
          onBack={back}
          onSkip={handleFinish}
        />
      )}
      {step === 2 && (
        <ReadyScreen
          displayName={displayName}
          onFinish={handleFinish}
          onBack={back}
        />
      )}
    </div>
  );
}

/* ======================== SCREEN 0: WELCOME ======================== */
function WelcomeScreen({ onNext }: { onNext: () => void }) {
  return (
    <div className="w-full max-w-[480px] h-screen max-h-[900px] flex flex-col bg-bg-dark relative shadow-2xl overflow-hidden sm:rounded-xl sm:h-[85vh] sm:border sm:border-white/[0.06]">
      {/* Hero — centered, clean, minimal */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 relative">
        {/* Soft glow behind icon */}
        <div className="absolute w-60 h-60 rounded-full bg-blue-500/[0.06] blur-2xl pointer-events-none" />

        {/* App icon */}
        <div className="size-[120px] rounded-[32px] bg-blue-500 flex items-center justify-center mb-10 shadow-[0_8px_24px_rgba(59,130,246,0.3)] relative z-10">
          <Zap size={56} className="text-white" fill="white" />
        </div>

        {/* App name */}
        <h1 className="text-4xl font-extrabold text-white text-center mb-3 relative z-10">
          ChopMeter
        </h1>

        {/* Tagline */}
        <p className="text-lg font-medium text-gray-400 text-center leading-relaxed max-w-[280px] relative z-10">
          Take control of your<br />electricity spend
        </p>
      </main>

      {/* CTA */}
      <footer className="px-6 pb-10 pt-2 w-full z-20">
        <StepDots current={0} total={3} />
        <button
          onClick={onNext}
          className="w-full group relative flex items-center justify-center overflow-hidden rounded-2xl h-14 bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] active:scale-[0.98]"
        >
          <span className="text-white text-[17px] font-bold mr-2 relative z-10">
            Get Started
          </span>
          <ArrowRight size={20} className="text-white relative z-10 transition-transform group-hover:translate-x-1" />
        </button>
        <p className="text-center text-[13px] text-gray-600 mt-4">
          Setup takes 30 seconds
        </p>
      </footer>
    </div>
  );
}

/* ======================== SCREEN 1: QUICK SETUP ======================== */
function QuickSetupScreen({
  country,
  showCountryPicker,
  setShowCountryPicker,
  onCountrySelect,
  displayName,
  setDisplayName,
  meterNumber,
  setMeterNumber,
  balance,
  setBalance,
  tariff,
  setTariff,
  onNext,
  onBack,
  onSkip,
}: {
  country: CountryConfig;
  showCountryPicker: boolean;
  setShowCountryPicker: (v: boolean) => void;
  onCountrySelect: (c: CountryConfig) => void;
  displayName: string;
  setDisplayName: (v: string) => void;
  meterNumber: string;
  setMeterNumber: (v: string) => void;
  balance: string;
  setBalance: (v: string) => void;
  tariff: string;
  setTariff: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="w-full max-w-[480px] h-screen max-h-[900px] flex flex-col bg-bg-dark relative shadow-2xl overflow-hidden sm:rounded-xl sm:h-[85vh] sm:border sm:border-white/[0.06]">
      <header className="flex items-center justify-between px-6 py-4 z-20">
        <button
          onClick={onBack}
          className="flex items-center justify-center size-10 rounded-full bg-white/[0.05] border border-white/[0.06] text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-white text-[17px] font-semibold">Quick Setup</h2>
        <button
          onClick={onSkip}
          className="text-sm font-medium text-gray-500 hover:text-blue-400 transition-colors"
        >
          Skip
        </button>
      </header>

      <main className="flex-1 flex flex-col px-6 pb-6 overflow-y-auto">
        <p className="text-gray-400 text-sm text-center mb-6">
          Tell us a bit about yourself. Everything is optional — you can update later in Settings.
        </p>

        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-gray-300 text-[13px] font-semibold uppercase tracking-wider mb-2">
              What should we call you?
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={50}
              placeholder="e.g. Kofi, Ama, Chidi..."
              autoCapitalize="words"
              className="w-full h-14 rounded-[14px] bg-white/[0.03] border border-white/[0.06] text-white text-[17px] font-medium px-4 placeholder:text-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Country */}
          <div>
            <label className="block text-gray-300 text-[13px] font-semibold uppercase tracking-wider mb-2">
              Your Country
            </label>
            <button
              onClick={() => setShowCountryPicker(!showCountryPicker)}
              className="w-full flex items-center justify-between h-14 rounded-[14px] bg-white/[0.03] border border-white/[0.06] px-4"
            >
              <div className="flex items-center gap-3">
                <span className="text-[28px]">{country.flag}</span>
                <div className="text-left">
                  <p className="text-[15px] font-semibold text-white">{country.name}</p>
                  <p className="text-xs text-gray-400">
                    {country.currencySymbol} {country.defaultTariff}/kWh
                  </p>
                </div>
              </div>
              <span className="text-sm font-medium text-blue-500">Change</span>
            </button>

            {showCountryPicker && (
              <div className="grid grid-cols-2 gap-2.5 mt-3 pt-3 border-t border-white/[0.06]">
                {COUNTRIES.map((c) => {
                  const isSelected = country.code === c.code;
                  return (
                    <button
                      key={c.code}
                      onClick={() => onCountrySelect(c)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border-[1.5px] transition-all ${
                        isSelected
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-white/[0.06] bg-white/[0.02] hover:border-blue-500/40"
                      }`}
                    >
                      <span className="text-[22px]">{c.flag}</span>
                      <div className="text-left flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-white truncate">{c.name}</p>
                        <p className="text-[11px] text-gray-400">{c.currencySymbol}</p>
                      </div>
                      {isSelected && <CheckCircle size={16} className="text-blue-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Balance */}
          <div>
            <label className="block text-gray-300 text-[13px] font-semibold uppercase tracking-wider mb-2">
              Current Meter Balance
            </label>
            <div className="flex gap-2">
              <div className="flex items-center justify-center h-14 px-4 rounded-[14px] bg-blue-500/[0.08] border border-blue-500/[0.15]">
                <span className="text-base font-bold text-blue-500">{country.currencySymbol}</span>
              </div>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                max="999999.99"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="0.00"
                className="flex-1 h-14 rounded-[14px] bg-white/[0.03] border border-white/[0.06] text-white text-[17px] font-medium px-4 placeholder:text-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <p className="text-gray-500 text-xs mt-1.5">
              Optional — you can add this later from the dashboard
            </p>
          </div>

          {/* Meter Number */}
          <div>
            <label className="block text-gray-300 text-[13px] font-semibold uppercase tracking-wider mb-2">
              Meter Number{" "}
              <span className="text-gray-600 normal-case font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={meterNumber}
              onChange={(e) => setMeterNumber(e.target.value)}
              maxLength={20}
              placeholder="e.g. 01234567890"
              className="w-full h-14 rounded-[14px] bg-white/[0.03] border border-white/[0.06] text-white text-[17px] font-medium px-4 placeholder:text-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Tariff */}
          <div>
            <label className="block text-gray-300 text-[13px] font-semibold uppercase tracking-wider mb-2">
              Tariff Rate{" "}
              <span className="text-gray-600 normal-case font-normal">(per kWh)</span>
            </label>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              max="99.99"
              value={tariff}
              onChange={(e) => setTariff(e.target.value)}
              className="w-full h-14 rounded-[14px] bg-white/[0.03] border border-white/[0.06] text-white text-[17px] font-medium px-4 placeholder:text-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <p className="text-gray-500 text-xs mt-1.5">
              Auto-filled for {country.name}. Change only if your rate is different.
            </p>
          </div>
        </div>
      </main>

      <footer className="px-6 pb-8 pt-2 w-full z-20">
        <StepDots current={1} total={3} />
        <button
          onClick={onNext}
          className="w-full group relative flex items-center justify-center overflow-hidden rounded-2xl h-14 bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.3)] active:scale-[0.98]"
        >
          <span className="text-white text-[17px] font-bold mr-2 relative z-10">
            Continue
          </span>
          <ArrowRight size={20} className="text-white relative z-10" />
        </button>
      </footer>
    </div>
  );
}

/* ======================== SCREEN 2: READY ======================== */
function ReadyScreen({
  displayName,
  onFinish,
  onBack,
}: {
  displayName: string;
  onFinish: () => void;
  onBack: () => void;
}) {
  return (
    <div className="w-full max-w-[480px] h-screen max-h-[900px] flex flex-col bg-bg-dark relative shadow-2xl overflow-hidden sm:rounded-xl sm:h-[85vh] sm:border sm:border-white/[0.06]">
      <header className="flex items-center justify-between px-6 py-5 z-20">
        <button
          onClick={onBack}
          className="flex items-center justify-center size-10 rounded-full bg-white/[0.05] border border-white/[0.06] text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="size-10" />
        <div className="size-10" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-6">
        {/* Success icon */}
        <div className="size-[120px] rounded-full bg-emerald-500/[0.12] border border-emerald-500/20 flex items-center justify-center mb-8">
          <Sparkles size={56} className="text-emerald-500" />
        </div>

        <h1 className="text-[28px] font-extrabold text-white text-center mb-2">
          {displayName ? `Welcome, ${displayName}!` : "You\u2019re all set!"}
        </h1>
        <p className="text-gray-400 text-[15px] text-center leading-relaxed max-w-[300px] mb-8">
          Your dashboard is ready. Here&apos;s what you can do next:
        </p>

        {/* Next steps */}
        <div className="w-full space-y-3">
          {[
            { Icon: ScanLine, title: "Scan your meter", desc: "Get your first reading in seconds", num: "1" },
            { Icon: TrendingUp, title: "Track your usage", desc: "See daily trends and burn rate", num: "2" },
            { Icon: Clock, title: "Check your runway", desc: "Know when your credit runs out", num: "3" },
          ].map((item) => (
            <div
              key={item.num}
              className="flex items-center gap-3.5 py-3.5 px-4 rounded-[14px] bg-white/[0.03] border border-white/[0.05]"
            >
              <div className="size-9 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-blue-500">{item.num}</span>
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-semibold text-white">{item.title}</p>
                <p className="text-[13px] text-gray-400 mt-0.5">{item.desc}</p>
              </div>
              <item.Icon size={20} className="text-blue-500 shrink-0" />
            </div>
          ))}
        </div>
      </main>

      <footer className="px-6 pb-8 pt-2 w-full z-20">
        <StepDots current={2} total={3} />
        <button
          onClick={onFinish}
          className="w-full group relative flex items-center justify-center overflow-hidden rounded-2xl h-14 bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] active:scale-[0.98]"
        >
          <Zap size={20} className="text-white relative z-10 mr-2" fill="currentColor" />
          <span className="text-white text-[17px] font-bold relative z-10">
            Open Dashboard
          </span>
        </button>
      </footer>
    </div>
  );
}

/* ======================== STEP DOTS ======================== */
function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex justify-center gap-2 mb-5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1 rounded-full transition-all duration-300 ${
            i === current
              ? "w-7 bg-gradient-to-r from-blue-500 to-violet-500"
              : i < current
              ? "w-3.5 bg-blue-500/50"
              : "w-2 bg-gray-700"
          }`}
        />
      ))}
    </div>
  );
}
