"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveSettings } from "@/lib/storage";
import { COUNTRIES, type CountryConfig } from "@/lib/countries";
import {
  Zap,
  ArrowRight,
  ArrowLeft,
  Gauge,
  PiggyBank,
  CheckCircle,
  Rocket,
  ScanLine,
  TrendingUp,
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

  const handleFinish = () => {
    const balanceNum = parseFloat(balance) || 0;
    const tariffNum = parseFloat(tariff) || selectedCountry.defaultTariff;

    saveSettings({
      onboardingComplete: true,
      countryCode: selectedCountry.code,
      displayName: displayName.trim(),
      meterNumber,
      lastBalance: balanceNum,
      lastBalanceDate: Date.now(),
      tariffRate: tariffNum,
      tariffOverridden: tariffEdited,
    });
    router.replace("/dashboard");
  };

  const handleCountrySelect = (country: CountryConfig) => {
    setSelectedCountry(country);
    if (!tariffEdited) {
      setTariff(country.defaultTariff.toString());
    }
  };

  const next = () => {
    if (step === 2 && !balance) return;
    if (step < 3) setStep(step + 1);
    else handleFinish();
  };

  const back = () => step > 0 && setStep(step - 1);

  return (
    <div className="min-h-screen bg-bg-dark flex flex-col items-center justify-center">
      {step === 0 && <WelcomeScreen onNext={next} onSkip={handleFinish} />}
      {step === 1 && (
        <CountryScreen
          selected={selectedCountry}
          onSelect={handleCountrySelect}
          onNext={next}
          onBack={back}
        />
      )}
      {step === 2 && (
        <MeterSetupScreen
          country={selectedCountry}
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
        />
      )}
      {step === 3 && <ReadyScreen onFinish={handleFinish} onBack={back} />}
    </div>
  );
}

/* ======================== SCREEN 0: WELCOME ======================== */
function WelcomeScreen({
  onNext,
  onSkip,
}: {
  onNext: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="w-full max-w-[480px] h-screen max-h-[900px] flex flex-col bg-bg-dark relative shadow-2xl overflow-hidden sm:rounded-xl sm:h-[85vh] sm:border sm:border-white/[0.06]">
      <header className="flex items-center justify-between px-6 py-5 z-20">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center size-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-violet-500/20 text-blue-400">
            <Zap size={18} />
          </div>
          <h2 className="text-white text-lg font-bold tracking-tight">
            ChopMeter
          </h2>
        </div>
        <button
          onClick={onSkip}
          className="text-sm font-medium text-gray-400 hover:text-blue-400 transition-colors"
        >
          Skip
        </button>
      </header>

      <main className="flex-1 flex flex-col relative z-10 px-6 pb-6 overflow-y-auto">
        <div className="flex-1 flex items-center justify-center min-h-[300px] py-4 relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
            <div className="w-64 h-64 bg-blue-500/30 rounded-full blur-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>

          <div className="relative w-full aspect-[4/5] max-h-[400px] rounded-2xl overflow-hidden bg-gradient-to-b from-blue-500/5 to-violet-500/10 border border-white/[0.06] shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/80 via-transparent to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Gauge size={120} className="text-blue-500/20" strokeWidth={0.5} />
            </div>
            <div className="absolute bottom-4 left-4 right-4 bg-bg-dark/60 backdrop-blur-md border border-white/[0.08] rounded-xl p-3 flex items-center gap-3">
              <div className="size-10 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center text-white shrink-0">
                <PiggyBank size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-blue-400 font-bold uppercase tracking-wider">
                  Smart Tracking
                </span>
                <span className="text-sm text-white font-medium">
                  Know exactly where your money goes
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center text-center mt-4 mb-2 space-y-4">
          <h1 className="text-3xl font-extrabold text-white leading-tight tracking-tight">
            No more meter dey{" "}
            <span className="gradient-primary-text">chop your money</span>
          </h1>
          <p className="text-gray-400 text-base leading-relaxed max-w-xs mx-auto">
            Take control of your electricity. Track usage in real-time and stop
            overpaying for your utilities today.
          </p>
        </div>
      </main>

      <footer className="px-6 pb-8 pt-2 w-full z-20">
        <StepDots current={0} total={4} />
        <button
          onClick={onNext}
          className="w-full group relative flex items-center justify-center overflow-hidden rounded-xl h-14 bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] active:scale-[0.98]"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
          <span className="text-white text-lg font-bold tracking-wide mr-2 relative z-10">
            Get Started
          </span>
          <ArrowRight size={20} className="text-white relative z-10 transition-transform group-hover:translate-x-1" />
        </button>
      </footer>
    </div>
  );
}

/* ======================== SCREEN 1: COUNTRY ======================== */
function CountryScreen({
  selected,
  onSelect,
  onNext,
  onBack,
}: {
  selected: CountryConfig;
  onSelect: (c: CountryConfig) => void;
  onNext: () => void;
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
        <h2 className="text-white text-lg font-bold tracking-tight">
          Your Country
        </h2>
        <div className="size-10" />
      </header>

      <main className="flex-1 flex flex-col px-6 pb-6 overflow-y-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-white mb-2">
            Where are you?
          </h1>
          <p className="text-gray-400 text-sm">
            We&apos;ll set your currency and default electricity rate.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {COUNTRIES.map((country) => {
            const isSelected = selected.code === country.code;
            return (
              <button
                key={country.code}
                onClick={() => onSelect(country)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10"
                    : "border-white/[0.06] bg-white/[0.03] hover:border-blue-500/40"
                }`}
              >
                <span className="text-4xl">{country.flag}</span>
                <span className="text-white font-bold text-sm">
                  {country.name}
                </span>
                <span className="text-gray-400 text-xs">
                  {country.currencySymbol}/kWh
                </span>
                {isSelected && (
                  <CheckCircle size={18} className="text-blue-400" />
                )}
              </button>
            );
          })}
        </div>
      </main>

      <footer className="px-6 pb-8 pt-2 w-full z-20">
        <StepDots current={1} total={4} />
        <button
          onClick={onNext}
          className="w-full group relative flex items-center justify-center overflow-hidden rounded-xl h-14 bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.3)] active:scale-[0.98]"
        >
          <span className="text-white text-lg font-bold tracking-wide mr-2 relative z-10">
            Continue
          </span>
          <ArrowRight size={20} className="text-white relative z-10" />
        </button>
      </footer>
    </div>
  );
}

/* ======================== SCREEN 2: METER SETUP ======================== */
function MeterSetupScreen({
  country,
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
}: {
  country: CountryConfig;
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
}) {
  const balanceValid = balance !== "" && parseFloat(balance) >= 0;

  return (
    <div className="w-full max-w-[480px] h-screen max-h-[900px] flex flex-col bg-bg-dark relative shadow-2xl overflow-hidden sm:rounded-xl sm:h-[85vh] sm:border sm:border-white/[0.06]">
      <header className="flex items-center justify-between px-6 py-5 z-20">
        <button
          onClick={onBack}
          className="flex items-center justify-center size-10 rounded-full bg-white/[0.05] border border-white/[0.06] text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-white text-lg font-bold tracking-tight">
          Meter Setup
        </h2>
        <div className="size-10" />
      </header>

      <main className="flex-1 flex flex-col px-6 pb-6 overflow-y-auto">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold mb-3 border border-blue-500/20">
            <span className="text-lg">{country.flag}</span>
            {country.name}
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-2">
            Set up your meter
          </h1>
          <p className="text-gray-400 text-sm">
            Enter your current balance to start tracking.
          </p>
        </div>

        <div className="space-y-5">
          {/* Display Name (optional) */}
          <div>
            <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
              Your Name{" "}
              <span className="text-gray-600 normal-case">(optional)</span>
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Kofi"
              className="w-full h-14 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-lg font-bold px-4 placeholder:text-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Meter Number (optional) */}
          <div>
            <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
              Meter Number{" "}
              <span className="text-gray-600 normal-case">(optional)</span>
            </label>
            <input
              type="text"
              value={meterNumber}
              onChange={(e) => setMeterNumber(e.target.value)}
              placeholder="e.g. 01234567890"
              className="w-full h-14 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-lg font-bold px-4 placeholder:text-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Current Balance (required) */}
          <div>
            <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
              Current Balance{" "}
              <span className="text-blue-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">
                {country.currencySymbol}
              </span>
              <input
                type="number"
                inputMode="decimal"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="0.00"
                className="w-full h-14 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-lg font-bold pl-16 pr-4 placeholder:text-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            {balance !== "" && !balanceValid && (
              <p className="text-danger text-xs mt-1">
                Enter a valid balance amount
              </p>
            )}
          </div>

          {/* Tariff Rate */}
          <div>
            <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
              Tariff Rate (per kWh)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">
                {country.currencySymbol}
              </span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                value={tariff}
                onChange={(e) => setTariff(e.target.value)}
                className="w-full h-14 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-lg font-bold pl-16 pr-4 placeholder:text-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <p className="text-gray-500 text-xs mt-1">
              Default: {country.currencySymbol} {country.defaultTariff} for{" "}
              {country.name}
            </p>
          </div>
        </div>
      </main>

      <footer className="px-6 pb-8 pt-2 w-full z-20">
        <StepDots current={2} total={4} />
        <button
          onClick={onNext}
          disabled={!balanceValid}
          className={`w-full flex items-center justify-center rounded-xl h-14 font-bold text-lg transition-all active:scale-[0.98] ${
            balanceValid
              ? "bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]"
              : "bg-white/[0.03] text-gray-600 cursor-not-allowed"
          }`}
        >
          Continue
          <ArrowRight size={20} className="ml-2" />
        </button>
      </footer>
    </div>
  );
}

/* ======================== SCREEN 3: READY ======================== */
function ReadyScreen({
  onFinish,
  onBack,
}: {
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
        <h2 className="text-white text-lg font-bold tracking-tight">
          ChopMeter
        </h2>
        <div className="size-10" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-6">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-violet-500/5 rounded-full opacity-40 blur-3xl scale-150" />
          <div className="relative z-10 flex flex-col items-center justify-center p-10 glass-card rounded-full shadow-2xl size-56">
            <Rocket size={80} className="text-blue-400" fill="currentColor" strokeWidth={1} />
            <div className="absolute -z-10 w-full h-full border border-blue-500/20 rounded-full animate-pulse" />
          </div>
        </div>

        <div className="flex flex-col items-center text-center space-y-4 max-w-sm">
          <h1 className="text-3xl font-extrabold text-white leading-tight">
            You&apos;re all set!
          </h1>
          <p className="text-gray-400 text-base leading-relaxed">
            Scan your meter, track your spending, and never be surprised by your
            electricity bill again.
          </p>

          <div className="grid grid-cols-3 gap-3 w-full pt-4">
            {[
              { Icon: ScanLine, label: "Scan" },
              { Icon: TrendingUp, label: "Track" },
              { Icon: PiggyBank, label: "Save" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
              >
                <item.Icon size={24} className="text-blue-400" />
                <span className="text-gray-300 text-xs font-bold">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="px-6 pb-8 pt-2 w-full z-20">
        <StepDots current={3} total={4} />
        <button
          onClick={onFinish}
          className="w-full group relative flex items-center justify-center overflow-hidden rounded-xl h-14 bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] active:scale-[0.98]"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
          <span className="text-white text-lg font-bold tracking-wide mr-2 relative z-10">
            Launch Dashboard
          </span>
          <ArrowRight size={20} className="text-white relative z-10 transition-transform group-hover:translate-x-1" />
        </button>
      </footer>
    </div>
  );
}

/* ======================== STEP DOTS ======================== */
function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex justify-center gap-2 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === current
              ? "w-6 bg-gradient-to-r from-blue-500 to-violet-500"
              : i < current
              ? "w-3 bg-blue-500/40"
              : "w-1.5 bg-gray-700"
          }`}
        />
      ))}
    </div>
  );
}
