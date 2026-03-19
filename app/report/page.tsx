"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  getSettings,
  getAllReadings,
  getAllTopUps,
  getDefaultMeter,
} from "@/lib/storage";
import { getCountry } from "@/lib/countries";
import { getBudgetStatus } from "@/lib/budget";
import { getStreakData, getTrackerLevel } from "@/lib/streak";
import type { UserSettings, MeterReading, TopUp, Meter } from "@/lib/types";
import type { BudgetStatus } from "@/lib/budget";
import BottomNav from "@/components/BottomNav";
import ShareCard from "@/components/ShareCard";
import { FileText, Download, ArrowLeft, Printer, Share2 } from "lucide-react";

interface MonthOption {
  label: string;
  year: number;
  month: number; // 0-indexed
}

function getMonthOptions(count: number): MonthOption[] {
  const options: MonthOption[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    options.push({
      label: d.toLocaleDateString("en", { month: "long", year: "numeric" }),
      year: d.getFullYear(),
      month: d.getMonth(),
    });
  }
  return options;
}

function filterByMonth<T extends { timestamp: number }>(
  items: T[],
  year: number,
  month: number
): T[] {
  const start = new Date(year, month, 1).getTime();
  const end = new Date(year, month + 1, 1).getTime();
  return items.filter((item) => item.timestamp >= start && item.timestamp < end);
}

function calcUsageForMonth(
  readings: MeterReading[],
  year: number,
  month: number
): { usage: number; count: number; monthReadings: MeterReading[] } {
  const start = new Date(year, month, 1).getTime();
  const end = new Date(year, month + 1, 1).getTime();
  const monthReadings = readings
    .filter((r) => r.timestamp >= start && r.timestamp < end)
    .sort((a, b) => a.timestamp - b.timestamp);

  let usage = 0;
  for (let i = 1; i < monthReadings.length; i++) {
    usage += Math.abs(monthReadings[i].value - monthReadings[i - 1].value);
  }
  return { usage, count: monthReadings.length, monthReadings };
}

export default function ReportPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [allReadings, setAllReadings] = useState<MeterReading[]>([]);
  const [allTopUps, setAllTopUps] = useState<TopUp[]>([]);
  const [activeMeter, setActiveMeter] = useState<Meter | null>(null);
  const [selectedMonthIdx, setSelectedMonthIdx] = useState(0);
  const [showShareCard, setShowShareCard] = useState(false);

  const monthOptions = useMemo(() => getMonthOptions(12), []);

  useEffect(() => {
    const s = getSettings();
    if (!s.onboardingComplete) {
      router.replace("/onboarding");
      return;
    }
    setSettings(s);
    const meter = getDefaultMeter();
    setActiveMeter(meter);
    setAllReadings(getAllReadings(meter?.id));
    setAllTopUps(getAllTopUps(meter?.id));
  }, [router]);

  if (!settings) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-bg-dark">
        <FileText size={48} className="text-blue-400 animate-pulse" />
      </div>
    );
  }

  const country = getCountry(settings.countryCode);
  const selected = monthOptions[selectedMonthIdx];
  const { year, month } = selected;

  // Current month data
  const { usage: totalUsage, count: readingCount, monthReadings } =
    calcUsageForMonth(allReadings, year, month);
  const totalCost = totalUsage * settings.tariffRate;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dailyAverage = readingCount > 1 ? totalUsage / daysInMonth : 0;

  // Top-ups for selected month
  const monthTopUps = filterByMonth(allTopUps, year, month).sort(
    (a, b) => a.timestamp - b.timestamp
  );
  const totalTopUpAmount = monthTopUps.reduce((sum, t) => sum + t.amount, 0);

  // Budget status (only for current calendar month)
  const now = new Date();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();
  const budgetStatus: BudgetStatus | null = isCurrentMonth
    ? getBudgetStatus(allReadings, settings.tariffRate, settings.monthlyBudget)
    : null;

  // Previous month comparison
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const { usage: prevUsage } = calcUsageForMonth(allReadings, prevYear, prevMonth);
  const prevCost = prevUsage * settings.tariffRate;
  const hasPrevData = prevUsage > 0;
  const changePercent =
    hasPrevData ? ((totalUsage - prevUsage) / prevUsage) * 100 : 0;

  // Readings log with deltas
  const sortedReadings = [...monthReadings].sort(
    (a, b) => a.timestamp - b.timestamp
  );

  const reportDate = new Date().toLocaleDateString("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const monthLabel = new Date(year, month, 1).toLocaleDateString("en", {
    month: "long",
    year: "numeric",
  });

  const prevMonthLabel = new Date(prevYear, prevMonth, 1).toLocaleDateString(
    "en",
    { month: "long" }
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex h-full grow flex-col bg-bg-dark font-display min-h-screen text-gray-50">
      {/* Screen-only toolbar */}
      <header className="app-header no-print sticky top-0 z-20 bg-[#0A0E1A]/95 backdrop-blur-md border-b border-white/[0.06] px-4 py-3 isolate">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-bold">Back</span>
          </button>
          <h1 className="text-white font-bold text-sm">Monthly Report</h1>
          <div className="flex items-center gap-2">
            {readingCount >= 2 && (
              <button
                onClick={() => setShowShareCard(true)}
                className="flex items-center gap-2 bg-white/[0.05] border border-white/[0.08] text-white font-bold text-sm py-2 px-3 rounded-xl hover:bg-white/[0.08] transition-all active:scale-[0.98]"
              >
                <Share2 size={16} />
              </button>
            )}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-violet-500 text-white font-bold text-sm py-2 px-4 rounded-xl hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-[0.98]"
            >
              <Download size={16} />
              PDF
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 pb-24">
        {/* Month selector - screen only */}
        <div className="no-print glass-card p-4 mb-6">
          <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
            Select Month
          </label>
          <select
            value={selectedMonthIdx}
            onChange={(e) => setSelectedMonthIdx(Number(e.target.value))}
            className="w-full h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-sm font-bold px-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 1rem center",
            }}
          >
            {monthOptions.map((opt, idx) => (
              <option key={idx} value={idx} className="bg-gray-900 text-white">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Report content - light themed for printing */}
        <div className="print-content bg-white rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 sm:p-8">
            {/* Report Header */}
            <div className="text-center border-b-2 border-gray-200 pb-6 mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                  <span className="text-white text-lg font-bold">&#9889;</span>
                </div>
                <span className="text-gray-900 text-xl font-extrabold tracking-tight">
                  ChopMetr
                </span>
              </div>
              <h2 className="text-gray-800 text-lg font-bold">
                Monthly Energy Report
              </h2>
              <p className="text-gray-500 text-sm font-medium mt-1">
                {monthLabel}
              </p>
              {activeMeter && (
                <p className="text-gray-400 text-sm mt-1">
                  Meter: {activeMeter.name}
                  {activeMeter.meterNumber
                    ? ` (${activeMeter.meterNumber})`
                    : ""}
                </p>
              )}
            </div>

            {/* Summary Section */}
            <section className="mb-6">
              <h3 className="text-gray-900 text-sm font-bold uppercase tracking-wider mb-3 border-b border-gray-100 pb-2">
                Summary
              </h3>
              {readingCount < 2 ? (
                <p className="text-gray-400 text-sm italic">
                  Not enough readings for this month to generate a summary.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 text-xs font-medium">
                      Total Usage
                    </p>
                    <p className="text-gray-900 text-lg font-bold">
                      {totalUsage.toFixed(1)} kWh
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">
                      Total Cost
                    </p>
                    <p className="text-gray-900 text-lg font-bold">
                      {country.currencySymbol} {totalCost.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">
                      Daily Average
                    </p>
                    <p className="text-gray-900 text-lg font-bold">
                      {dailyAverage.toFixed(2)} kWh
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">
                      Readings Taken
                    </p>
                    <p className="text-gray-900 text-lg font-bold">
                      {readingCount}
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* Budget Status */}
            {budgetStatus && (
              <section className="mb-6">
                <h3 className="text-gray-900 text-sm font-bold uppercase tracking-wider mb-3 border-b border-gray-100 pb-2">
                  Budget Status
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 text-xs font-medium">Budget</p>
                    <p className="text-gray-900 text-lg font-bold">
                      {country.currencySymbol} {budgetStatus.budget.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">
                      Spent ({budgetStatus.percentage.toFixed(1)}%)
                    </p>
                    <p className="text-gray-900 text-lg font-bold">
                      {country.currencySymbol} {budgetStatus.spent.toFixed(2)}
                    </p>
                  </div>
                </div>
                {/* Budget progress bar */}
                <div className="mt-3 w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-3 rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, budgetStatus.percentage)}%`,
                      backgroundColor:
                        budgetStatus.status === "on_track"
                          ? "#3B82F6"
                          : budgetStatus.status === "warning"
                          ? "#F59E0B"
                          : budgetStatus.status === "danger"
                          ? "#EF4444"
                          : "#DC2626",
                    }}
                  />
                </div>
                <p className="text-sm mt-2 font-semibold" style={{
                  color:
                    budgetStatus.status === "on_track"
                      ? "#22C55E"
                      : budgetStatus.status === "warning"
                      ? "#F59E0B"
                      : "#EF4444",
                }}>
                  {budgetStatus.status === "on_track"
                    ? "On Track"
                    : budgetStatus.status === "warning"
                    ? "Watch Spending"
                    : budgetStatus.status === "danger"
                    ? "Over Budget Risk"
                    : "Over Budget"}
                </p>
              </section>
            )}

            {/* Top-up History */}
            {monthTopUps.length > 0 && (
              <section className="mb-6">
                <h3 className="text-gray-900 text-sm font-bold uppercase tracking-wider mb-3 border-b border-gray-100 pb-2">
                  Top-up History
                </h3>
                <div className="space-y-2">
                  {monthTopUps.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-600">
                        {new Date(t.timestamp).toLocaleDateString("en", {
                          month: "short",
                          day: "numeric",
                        })}
                        {t.note ? ` - ${t.note}` : ""}
                      </span>
                      <span className="text-gray-900 font-bold">
                        {country.currencySymbol} {t.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between text-sm font-bold">
                  <span className="text-gray-600">Total Top-ups</span>
                  <span className="text-gray-900">
                    {country.currencySymbol} {totalTopUpAmount.toFixed(2)}
                  </span>
                </div>
              </section>
            )}

            {/* Readings Log */}
            {sortedReadings.length > 0 && (
              <section className="mb-6">
                <h3 className="text-gray-900 text-sm font-bold uppercase tracking-wider mb-3 border-b border-gray-100 pb-2">
                  Readings Log
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 text-xs uppercase tracking-wider">
                        <th className="pb-2 pr-4 font-semibold">Date</th>
                        <th className="pb-2 pr-4 font-semibold text-right">
                          Reading
                        </th>
                        <th className="pb-2 pr-4 font-semibold text-right">
                          Change
                        </th>
                        <th className="pb-2 font-semibold">Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedReadings.map((r, idx) => {
                        const prev = idx > 0 ? sortedReadings[idx - 1] : null;
                        const delta = prev
                          ? Math.abs(r.value - prev.value)
                          : null;
                        return (
                          <tr
                            key={r.id}
                            className="border-t border-gray-50"
                          >
                            <td className="py-1.5 pr-4 text-gray-600">
                              {new Date(r.timestamp).toLocaleDateString("en", {
                                month: "short",
                                day: "numeric",
                              })}
                            </td>
                            <td className="py-1.5 pr-4 text-gray-900 font-bold text-right">
                              {r.value.toFixed(1)}
                            </td>
                            <td className="py-1.5 pr-4 text-right text-gray-600">
                              {delta !== null
                                ? `+${delta.toFixed(1)} kWh`
                                : "--"}
                            </td>
                            <td className="py-1.5 text-gray-500 capitalize">
                              {r.source === "ocr" ? "OCR" : "Manual"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Comparison */}
            {readingCount >= 2 && (
              <section className="mb-6">
                <h3 className="text-gray-900 text-sm font-bold uppercase tracking-wider mb-3 border-b border-gray-100 pb-2">
                  Comparison
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      This month ({monthLabel.split(" ")[0]})
                    </span>
                    <span className="text-gray-900 font-bold">
                      {totalUsage.toFixed(1)} kWh ({country.currencySymbol}{" "}
                      {totalCost.toFixed(2)})
                    </span>
                  </div>
                  {hasPrevData ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Last month ({prevMonthLabel})
                        </span>
                        <span className="text-gray-900 font-bold">
                          {prevUsage.toFixed(1)} kWh ({country.currencySymbol}{" "}
                          {prevCost.toFixed(2)})
                        </span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-gray-100">
                        <span className="text-gray-600">Change</span>
                        <span
                          className="font-bold"
                          style={{
                            color: changePercent <= 0 ? "#22C55E" : "#EF4444",
                          }}
                        >
                          {changePercent <= 0 ? "\u25BC" : "\u25B2"}{" "}
                          {Math.abs(changePercent).toFixed(1)}%{" "}
                          {changePercent <= 0 ? "decrease" : "increase"}
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-400 text-sm italic">
                      No data for {prevMonthLabel} to compare.
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* Footer */}
            <div className="border-t-2 border-gray-200 pt-4 mt-6 text-center">
              <p className="text-gray-400 text-xs">
                Generated by ChopMetr (chopmeter.me)
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Report Date: {reportDate}
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons at bottom - screen only */}
        <div className="no-print mt-6 space-y-3">
          {readingCount >= 2 && (
            <button
              onClick={() => setShowShareCard(true)}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-violet-500 text-white font-bold py-3 px-6 rounded-xl text-sm hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-[0.98]"
            >
              <Share2 size={18} />
              Share Monthly Summary
            </button>
          )}
          <button
            onClick={handlePrint}
            className="w-full flex items-center justify-center gap-2 bg-white/[0.05] border border-white/[0.08] text-white font-bold py-3 px-6 rounded-xl text-sm hover:bg-white/[0.08] transition-all active:scale-[0.98]"
          >
            <Printer size={18} />
            Print / Save as PDF
          </button>
        </div>

        {/* Share Card Modal */}
        {showShareCard && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowShareCard(false); }}
          >
            <div className="max-w-sm w-full">
              <ShareCard
                type="monthly-summary"
                summary={{
                  month: monthLabel,
                  totalUsage,
                  totalCost,
                  dailyAverage,
                  readingCount,
                  changePercent: hasPrevData ? changePercent : 0,
                  changeDirection: !hasPrevData ? "flat" : changePercent < -2 ? "down" : changePercent > 2 ? "up" : "flat",
                  currencySymbol: country.currencySymbol,
                  userName: settings.displayName || "",
                  streakDays: getStreakData().currentStreak,
                  trackerLevel: getTrackerLevel(getStreakData().totalScans).name,
                }}
              />
              <button
                onClick={() => setShowShareCard(false)}
                className="w-full mt-3 text-gray-400 text-sm font-bold py-2 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </main>

      <BottomNav active="dashboard" />
    </div>
  );
}
