"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Activity,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Eye,
  Phone,
  FileText,
  ClipboardList,
  Share2,
  ScanLine,
  ChevronDown,
  ChevronUp,
  Check,
  Minus,
  Plus,
} from "lucide-react";
import { APPLIANCES, CATEGORIES } from "@/lib/appliances";
import type { Appliance } from "@/lib/appliances";
import {
  getAllReadings,
  getAllTopUps,
  getSettings,
  getApplianceSelections,
  saveApplianceSelections,
} from "@/lib/storage";
import { runHealthCheck } from "@/lib/healthcheck";
import type { HealthCheckResult, ApplianceSelection } from "@/lib/healthcheck";
import { getCountry } from "@/lib/countries";
import BottomNav from "@/components/BottomNav";

const STATUS_CONFIG = {
  healthy: {
    icon: ShieldCheck,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/15",
    borderColor: "border-emerald-500/20",
    ringColor: "ring-emerald-500/30",
    label: "HEALTHY",
    barColor: "bg-emerald-500",
  },
  watch: {
    icon: Eye,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/15",
    borderColor: "border-yellow-500/20",
    ringColor: "ring-yellow-500/30",
    label: "WATCH",
    barColor: "bg-yellow-500",
  },
  suspicious: {
    icon: AlertTriangle,
    color: "text-orange-400",
    bgColor: "bg-orange-500/15",
    borderColor: "border-orange-500/20",
    ringColor: "ring-orange-500/30",
    label: "SUSPICIOUS",
    barColor: "bg-orange-500",
  },
  alert: {
    icon: AlertOctagon,
    color: "text-red-400",
    bgColor: "bg-red-500/15",
    borderColor: "border-red-500/20",
    ringColor: "ring-red-500/30",
    label: "ALERT",
    barColor: "bg-red-500",
  },
};

export default function HealthCheckPage() {
  const router = useRouter();
  const [selections, setSelections] = useState<ApplianceSelection[]>([]);
  const [result, setResult] = useState<HealthCheckResult | null>(null);
  const [showAppliances, setShowAppliances] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [hasRun, setHasRun] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load saved selections on mount
  useEffect(() => {
    const saved = getApplianceSelections();
    if (saved.length > 0) {
      setSelections(saved);
    }
  }, []);

  const settings = useMemo(() => {
    if (typeof window === "undefined") return null;
    return getSettings();
  }, []);

  const country = settings ? getCountry(settings.countryCode) : null;
  const currencySymbol = country?.currencySymbol ?? "GH₵";

  // Compute expected daily kWh from current selections
  const expectedDailyKwh = useMemo(() => {
    let total = 0;
    for (const sel of selections) {
      const appliance = APPLIANCES.find((a) => a.id === sel.applianceId);
      if (appliance) {
        total += (appliance.wattage * sel.hours * sel.quantity) / 1000;
      }
    }
    return total;
  }, [selections]);

  const filteredAppliances = useMemo(() => {
    if (activeCategory === "all") return APPLIANCES;
    return APPLIANCES.filter((a) => a.category === activeCategory);
  }, [activeCategory]);

  const getSelection = (applianceId: string): ApplianceSelection | undefined => {
    return selections.find((s) => s.applianceId === applianceId);
  };

  const toggleAppliance = (appliance: Appliance) => {
    const existing = getSelection(appliance.id);
    if (existing) {
      setSelections(selections.filter((s) => s.applianceId !== appliance.id));
    } else {
      setSelections([
        ...selections,
        {
          applianceId: appliance.id,
          hours: appliance.defaultHours,
          quantity: 1,
        },
      ]);
    }
  };

  const updateHours = (applianceId: string, hours: number) => {
    setSelections(
      selections.map((s) =>
        s.applianceId === applianceId ? { ...s, hours: Math.max(0.1, Math.min(24, hours)) } : s
      )
    );
  };

  const updateQuantity = (applianceId: string, delta: number) => {
    setSelections(
      selections.map((s) =>
        s.applianceId === applianceId
          ? { ...s, quantity: Math.max(1, s.quantity + delta) }
          : s
      )
    );
  };

  const handleRunCheck = () => {
    if (!settings) return;

    const readings = getAllReadings();
    const topups = getAllTopUps();

    // Save selections for next time
    saveApplianceSelections(selections);

    const checkResult = runHealthCheck({
      readings,
      topups,
      applianceSelections: selections,
      appliances: APPLIANCES,
      tariffRate: settings.tariffRate,
      lastBalance: settings.lastBalance,
    });

    setResult(checkResult);
    setHasRun(true);
    setShowAppliances(false);
  };

  const handleShare = async () => {
    if (!result) return;

    const text = [
      `ChopMeter Health Check Results`,
      `Status: ${STATUS_CONFIG[result.status].label}`,
      ``,
      `Expected: ${result.expectedDailyKwh.toFixed(1)} kWh/day (${currencySymbol} ${result.expectedDailyCost.toFixed(2)}/day)`,
      `Actual: ${result.actualDailyKwh.toFixed(1)} kWh/day (${currencySymbol} ${result.actualDailyCost.toFixed(2)}/day)`,
      `Discrepancy: ${result.discrepancyPercent >= 0 ? "+" : ""}${result.discrepancyPercent.toFixed(0)}%`,
      ``,
      `Monthly difference: ${currencySymbol} ${Math.abs(result.discrepancyCost * 30).toFixed(2)}`,
      ``,
      result.statusMessage,
      ``,
      `Tracked with ChopMeter - chopmeter.app`,
    ].join("\n");

    if (navigator.share) {
      try {
        await navigator.share({ title: "ChopMeter Health Check", text });
        return;
      } catch {
        // fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silent fail
    }
  };

  return (
    <div className="flex h-full grow flex-col bg-bg-dark font-display min-h-screen text-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#0A0E1A]/95 backdrop-blur-xl border-b border-white/[0.06] px-4 py-3">
        <div className="max-w-7xl mx-auto w-full flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/[0.06] flex items-center justify-center text-gray-300 hover:text-white transition-colors active:scale-95"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-white font-bold text-lg flex items-center gap-2">
              <Activity size={20} className="text-red-400" />
              Meter Health Check
            </h1>
            <p className="text-gray-500 text-xs">
              Compare expected vs actual usage to verify your meter
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 pt-4 pb-24 space-y-4">
        {/* Appliance Selection Summary / Toggle */}
        <div className="glass-card p-4 animate-fade-in-up">
          <button
            onClick={() => setShowAppliances(!showAppliances)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
                <ClipboardList size={20} className="text-violet-400" />
              </div>
              <div className="text-left">
                <p className="text-white font-bold text-sm">
                  {selections.length > 0
                    ? `${selections.length} appliance${selections.length !== 1 ? "s" : ""} selected`
                    : "Select your appliances"}
                </p>
                <p className="text-gray-500 text-xs">
                  {selections.length > 0
                    ? `Expected: ${expectedDailyKwh.toFixed(1)} kWh/day · ${currencySymbol} ${(expectedDailyKwh * (settings?.tariffRate ?? 2)).toFixed(2)}/day`
                    : "Tell us what you use at home"}
                </p>
              </div>
            </div>
            {showAppliances ? (
              <ChevronUp size={20} className="text-gray-500" />
            ) : (
              <ChevronDown size={20} className="text-gray-500" />
            )}
          </button>

          {/* Appliance Selector */}
          {showAppliances && (
            <div className="mt-4 pt-4 border-t border-white/[0.06] animate-fade-in-up">
              {/* Category tabs */}
              <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                      activeCategory === cat.id
                        ? "bg-gradient-to-r from-blue-500 to-violet-500 text-white"
                        : "bg-white/[0.05] text-gray-400 hover:text-white"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Appliance grid */}
              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                {filteredAppliances.map((appliance) => {
                  const sel = getSelection(appliance.id);
                  const isSelected = !!sel;

                  return (
                    <div
                      key={appliance.id}
                      className={`rounded-xl border p-3 transition-all ${
                        isSelected
                          ? "bg-blue-500/10 border-blue-500/30"
                          : "bg-white/[0.02] border-white/[0.06]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => toggleAppliance(appliance)}
                          className="flex items-center gap-3 flex-1 text-left"
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                              isSelected
                                ? "bg-blue-500 text-white"
                                : "bg-white/[0.05] text-gray-500"
                            }`}
                          >
                            {isSelected ? <Check size={16} /> : null}
                          </div>
                          <div>
                            <p
                              className={`text-sm font-bold ${
                                isSelected ? "text-white" : "text-gray-400"
                              }`}
                            >
                              {appliance.name}
                            </p>
                            <p className="text-gray-600 text-xs">
                              {appliance.wattage}W
                            </p>
                          </div>
                        </button>
                      </div>

                      {isSelected && sel && (
                        <div className="mt-3 flex items-center gap-4 pl-11 animate-fade-in-up">
                          {/* Hours */}
                          <div className="flex-1">
                            <label className="text-gray-500 text-[10px] uppercase tracking-wider block mb-1">
                              Hours/day
                            </label>
                            <input
                              type="number"
                              inputMode="decimal"
                              value={sel.hours}
                              onChange={(e) =>
                                updateHours(
                                  appliance.id,
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-full h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white text-sm font-bold px-2 text-center focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                          </div>

                          {/* Quantity */}
                          <div>
                            <label className="text-gray-500 text-[10px] uppercase tracking-wider block mb-1">
                              Qty
                            </label>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => updateQuantity(appliance.id, -1)}
                                className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-white active:scale-95"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="w-8 text-center text-white text-sm font-bold">
                                {sel.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(appliance.id, 1)}
                                className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-white active:scale-95"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>

                          {/* Per-item kWh */}
                          <div className="text-right">
                            <label className="text-gray-500 text-[10px] uppercase tracking-wider block mb-1">
                              kWh/day
                            </label>
                            <p className="text-blue-400 text-sm font-bold">
                              {(
                                (appliance.wattage * sel.hours * sel.quantity) /
                                1000
                              ).toFixed(1)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Run Check Button */}
        <button
          onClick={handleRunCheck}
          disabled={selections.length === 0}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
            selections.length > 0
              ? "bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
              : "bg-white/[0.05] text-gray-600 cursor-not-allowed"
          }`}
        >
          <Activity size={22} />
          {hasRun ? "Re-run Health Check" : "Run Health Check"}
        </button>

        {/* Results */}
        {result && hasRun && (
          <>
            {/* Insufficient data warning */}
            {(!result.hasEnoughReadings || result.readingDaysSpan < 1) && (
              <div className="glass-card p-6 text-center border-yellow-500/20 animate-fade-in-up">
                <div className="w-16 h-16 rounded-full bg-yellow-500/15 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle size={32} className="text-yellow-400" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">
                  More readings needed
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  We need at least 3 meter readings over several days to accurately
                  analyze your meter. You currently have{" "}
                  {result.readingDaysSpan < 1
                    ? "less than 1 day"
                    : `${result.readingDaysSpan.toFixed(0)} days`}{" "}
                  of data.
                </p>
                <div className="space-y-2 text-left text-gray-400 text-sm mb-6">
                  <p className="flex items-center gap-2">
                    <ScanLine size={16} className="text-blue-400 shrink-0" />
                    Take a reading every morning and evening
                  </p>
                  <p className="flex items-center gap-2">
                    <ScanLine size={16} className="text-blue-400 shrink-0" />
                    Continue for at least 3 days for best results
                  </p>
                </div>
                <button
                  onClick={() => router.push("/scanner")}
                  className="bg-gradient-to-r from-blue-500 to-violet-500 text-white font-bold py-3 px-6 rounded-xl text-sm hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-[0.98]"
                >
                  Start Tracking
                </button>
              </div>
            )}

            {/* No appliances warning */}
            {!result.hasAppliances && (
              <div className="glass-card p-6 text-center border-violet-500/20 animate-fade-in-up">
                <div className="w-16 h-16 rounded-full bg-violet-500/15 flex items-center justify-center mx-auto mb-4">
                  <ClipboardList size={32} className="text-violet-400" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">
                  Select your appliances
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Select the appliances you use at home so we can estimate your
                  expected usage and compare it with your actual meter readings.
                </p>
                <button
                  onClick={() => setShowAppliances(true)}
                  className="bg-gradient-to-r from-blue-500 to-violet-500 text-white font-bold py-3 px-6 rounded-xl text-sm hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-[0.98]"
                >
                  Select Appliances
                </button>
              </div>
            )}

            {/* Full results (only if enough data) */}
            {result.hasEnoughReadings && result.hasAppliances && result.readingDaysSpan >= 1 && (
              <div className="space-y-4 animate-fade-in-up">
                {/* Status Badge */}
                {(() => {
                  const config = STATUS_CONFIG[result.status];
                  const Icon = config.icon;
                  return (
                    <div
                      className={`glass-card p-6 text-center ${config.borderColor}`}
                    >
                      <div
                        className={`w-20 h-20 rounded-full ${config.bgColor} flex items-center justify-center mx-auto mb-4 ring-4 ${config.ringColor}`}
                      >
                        <Icon size={40} className={config.color} />
                      </div>
                      <p
                        className={`text-2xl font-extrabold tracking-wider ${config.color}`}
                      >
                        {config.label}
                      </p>
                      <p className="text-gray-400 text-sm mt-2">
                        {result.statusMessage}
                      </p>
                    </div>
                  );
                })()}

                {/* Expected vs Actual */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="glass-card p-4 border-emerald-500/10">
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-2 font-medium">
                      Expected
                    </p>
                    <p className="text-white text-xl font-extrabold">
                      {result.expectedDailyKwh.toFixed(1)}{" "}
                      <span className="text-sm text-gray-500 font-medium">
                        kWh/day
                      </span>
                    </p>
                    <p className="text-gray-400 text-sm font-bold mt-1">
                      {currencySymbol} {result.expectedDailyCost.toFixed(2)}/day
                    </p>
                    <p className="text-gray-600 text-xs mt-2">
                      {currencySymbol} {result.expectedMonthlyCost.toFixed(0)}/month
                    </p>
                  </div>
                  <div
                    className={`glass-card p-4 ${
                      result.discrepancyPercent > 15
                        ? "border-red-500/20"
                        : "border-blue-500/10"
                    }`}
                  >
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-2 font-medium">
                      Actual
                    </p>
                    <p
                      className={`text-xl font-extrabold ${
                        result.discrepancyPercent > 15
                          ? "text-red-400"
                          : "text-white"
                      }`}
                    >
                      {result.actualDailyKwh.toFixed(1)}{" "}
                      <span className="text-sm text-gray-500 font-medium">
                        kWh/day
                      </span>
                    </p>
                    <p
                      className={`text-sm font-bold mt-1 ${
                        result.discrepancyPercent > 15
                          ? "text-red-400"
                          : "text-gray-400"
                      }`}
                    >
                      {currencySymbol} {result.actualDailyCost.toFixed(2)}/day
                    </p>
                    <p className="text-gray-600 text-xs mt-2">
                      {currencySymbol} {result.actualMonthlyCost.toFixed(0)}/month
                    </p>
                  </div>
                </div>

                {/* Discrepancy Bar */}
                <div className="glass-card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-gray-400 text-xs uppercase tracking-wider font-medium">
                      Discrepancy
                    </p>
                    <p
                      className={`text-lg font-extrabold ${
                        result.discrepancyPercent > 30
                          ? "text-red-400"
                          : result.discrepancyPercent > 15
                          ? "text-yellow-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {result.discrepancyPercent >= 0 ? "+" : ""}
                      {result.discrepancyPercent.toFixed(0)}%{" "}
                      <span className="text-xs font-medium text-gray-500">
                        {result.discrepancyPercent > 0
                          ? "higher than expected"
                          : "lower than expected"}
                      </span>
                    </p>
                  </div>

                  {/* Visual comparison bar */}
                  <div className="space-y-2">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-500">Expected</span>
                        <span className="text-gray-400 font-bold">
                          {result.expectedDailyKwh.toFixed(1)} kWh
                        </span>
                      </div>
                      <div className="h-3 bg-white/[0.05] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              (result.expectedDailyKwh /
                                Math.max(
                                  result.expectedDailyKwh,
                                  result.actualDailyKwh
                                )) *
                                100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-500">Actual</span>
                        <span
                          className={`font-bold ${
                            result.discrepancyPercent > 15
                              ? "text-red-400"
                              : "text-gray-400"
                          }`}
                        >
                          {result.actualDailyKwh.toFixed(1)} kWh
                        </span>
                      </div>
                      <div className="h-3 bg-white/[0.05] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            result.discrepancyPercent > 30
                              ? "bg-red-500"
                              : result.discrepancyPercent > 15
                              ? "bg-yellow-500"
                              : "bg-emerald-500"
                          }`}
                          style={{
                            width: `${Math.min(
                              100,
                              (result.actualDailyKwh /
                                Math.max(
                                  result.expectedDailyKwh,
                                  result.actualDailyKwh
                                )) *
                                100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Overpayment highlight */}
                {result.discrepancyPercent > 15 && (
                  <div className="glass-card p-5 border-red-500/20 text-center">
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">
                      Estimated Monthly Overpayment
                    </p>
                    <p className="text-red-400 text-3xl font-extrabold">
                      {currencySymbol}{" "}
                      {Math.abs(result.discrepancyCost * 30).toFixed(2)}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      {currencySymbol} {Math.abs(result.discrepancyCost).toFixed(2)}{" "}
                      extra per day
                    </p>
                  </div>
                )}

                {/* Top-up Analysis */}
                {(result.avgTopUpLifeDays !== null ||
                  result.expectedTopUpLifeDays !== null) && (
                  <div className="glass-card p-4">
                    <p className="text-gray-400 text-xs uppercase tracking-wider font-medium mb-3">
                      Top-up Analysis
                    </p>
                    <div className="space-y-2">
                      {result.avgTopUpLifeDays !== null && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">
                            Average top-up lasts
                          </span>
                          <span className="text-white font-bold text-sm">
                            {result.avgTopUpLifeDays.toFixed(1)} days
                          </span>
                        </div>
                      )}
                      {result.expectedTopUpLifeDays !== null && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">
                            Expected to last
                          </span>
                          <span className="text-emerald-400 font-bold text-sm">
                            {result.expectedTopUpLifeDays.toFixed(1)} days
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Recommendation */}
                <div className="glass-card p-5">
                  <p className="text-gray-400 text-xs uppercase tracking-wider font-medium mb-3">
                    Recommendation
                  </p>
                  <p className="text-gray-300 text-sm leading-relaxed mb-4">
                    {result.recommendation}
                  </p>

                  {result.status === "suspicious" || result.status === "alert" ? (
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 text-sm">
                        <ClipboardList
                          size={18}
                          className="text-blue-400 shrink-0 mt-0.5"
                        />
                        <p className="text-gray-400">
                          Document your readings daily with photos
                        </p>
                      </div>
                      <div className="flex items-start gap-3 text-sm">
                        <Phone
                          size={18}
                          className="text-blue-400 shrink-0 mt-0.5"
                        />
                        <p className="text-gray-400">
                          File a complaint with ECG customer service
                        </p>
                      </div>
                      <div className="flex items-start gap-3 text-sm">
                        <FileText
                          size={18}
                          className="text-blue-400 shrink-0 mt-0.5"
                        />
                        <p className="text-gray-400">
                          Request a meter audit from PURC
                        </p>
                      </div>
                      <div className="flex items-start gap-3 text-sm">
                        <Activity
                          size={18}
                          className="text-blue-400 shrink-0 mt-0.5"
                        />
                        <p className="text-gray-400">
                          Use your ChopMeter Report as evidence
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/report"
                    className="glass-card p-4 text-center active:scale-[0.98] transition-transform hover:border-blue-500/30"
                  >
                    <FileText
                      size={24}
                      className="text-blue-400 mx-auto mb-2"
                    />
                    <p className="text-white text-sm font-bold">
                      Generate Report
                    </p>
                    <p className="text-gray-600 text-xs">For ECG/PURC</p>
                  </Link>
                  <button
                    onClick={handleShare}
                    className="glass-card p-4 text-center active:scale-[0.98] transition-transform hover:border-blue-500/30"
                  >
                    <Share2
                      size={24}
                      className="text-violet-400 mx-auto mb-2"
                    />
                    <p className="text-white text-sm font-bold">
                      {copied ? "Copied!" : "Share Results"}
                    </p>
                    <p className="text-gray-600 text-xs">Copy or share</p>
                  </button>
                </div>

                {/* Data quality note */}
                <p className="text-gray-600 text-xs text-center px-4">
                  Based on {result.readingDaysSpan.toFixed(0)} days of meter data
                  and {selections.length} selected appliance
                  {selections.length !== 1 ? "s" : ""}. For best accuracy, track
                  readings daily for at least 7 days.
                </p>
              </div>
            )}
          </>
        )}

        {/* Initial state — no check run yet */}
        {!hasRun && (
          <div className="glass-card p-8 text-center animate-fade-in-up">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center mx-auto mb-4">
              <Activity size={36} className="text-blue-400" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">
              Verify your meter
            </h3>
            <p className="text-gray-400 text-sm mb-2">
              Select the appliances you use at home, then run the health check to
              compare your expected usage against actual meter readings.
            </p>
            <p className="text-gray-600 text-xs">
              This helps detect if your meter is over-reporting consumption.
            </p>
          </div>
        )}
      </main>

      <BottomNav active="dashboard" />
    </div>
  );
}
