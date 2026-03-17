"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  getAllTopUps,
  saveTopUp,
  deleteTopUp,
  getSettings,
  generateId,
  getDefaultMeter,
} from "@/lib/storage";
import { getTopUpStats } from "@/lib/topups";
import type { TopUpStats } from "@/lib/topups";
import type { TopUp } from "@/lib/types";
import { getCountry } from "@/lib/countries";
import BottomNav from "@/components/BottomNav";
import {
  ArrowLeft,
  Plus,
  Wallet,
  TrendingUp,
  TrendingDown,
  Calendar,
  Trash2,
  Receipt,
} from "lucide-react";

export default function TopUpsPage() {
  const router = useRouter();
  const [topups, setTopups] = useState<TopUp[]>([]);
  const [stats, setStats] = useState<TopUpStats | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [units, setUnits] = useState("");
  const [note, setNote] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const settings = typeof window !== "undefined" ? getSettings() : null;
  const country = settings ? getCountry(settings.countryCode) : null;

  // Get the active meter ID for scoping topups
  const activeMeter = typeof window !== "undefined" ? getDefaultMeter() : null;
  const activeMeterId = activeMeter?.id;

  const loadData = useCallback(() => {
    const all = getAllTopUps(activeMeterId);
    setTopups(all);
    setStats(getTopUpStats(all));
  }, [activeMeterId]);

  useEffect(() => {
    loadData();
    setMounted(true);
  }, [loadData]);

  const savingRef = useRef(false);
  const handleAdd = () => {
    if (savingRef.current) return;
    savingRef.current = true;
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || parsedAmount > 999999.99) return;
    const parsedUnits = Math.min(99999, Math.max(0, parseFloat(units) || 0));

    const topup: TopUp = {
      id: generateId(),
      amount: parsedAmount,
      units: parsedUnits,
      timestamp: Date.now(),
      note: note.replace(/<[^>]*>/g, "").trim().slice(0, 100),
    };

    saveTopUp(topup, activeMeterId);
    setAmount("");
    setUnits("");
    setNote("");
    setShowForm(false);
    loadData();
    savingRef.current = false;
  };

  const handleDelete = (id: string) => {
    deleteTopUp(id, activeMeterId);
    setDeletingId(null);
    loadData();
  };

  // Group topups by month
  const groupedTopups: { label: string; topups: TopUp[] }[] = [];
  if (topups.length > 0) {
    const sorted = [...topups].sort((a, b) => b.timestamp - a.timestamp);
    let currentLabel = "";
    for (const t of sorted) {
      const d = new Date(t.timestamp);
      const label = d.toLocaleDateString("en", {
        month: "long",
        year: "numeric",
      });
      if (label !== currentLabel) {
        currentLabel = label;
        groupedTopups.push({ label, topups: [] });
      }
      groupedTopups[groupedTopups.length - 1].topups.push(t);
    }
  }

  if (!mounted || !stats || !country) {
    return (
      <div className="flex flex-col min-h-screen bg-bg-dark">
        <header className="app-header sticky top-0 z-10 bg-[#0A0E1A] border-b border-white/[0.06] px-4 py-3">
          <div className="max-w-7xl mx-auto w-full flex items-center gap-3">
            <div className="size-10 rounded-full skeleton-shimmer" />
            <div className="h-5 w-36 rounded-lg skeleton-shimmer" />
          </div>
        </header>
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 pb-24">
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="glass-card p-4 h-24 skeleton-shimmer" />
            <div className="glass-card p-4 h-24 skeleton-shimmer" />
            <div className="glass-card p-4 h-24 skeleton-shimmer" />
          </div>
          <div className="glass-card p-6 h-48 skeleton-shimmer mb-6" />
          <div className="space-y-2">
            <div className="glass-card p-4 h-16 skeleton-shimmer" />
            <div className="glass-card p-4 h-16 skeleton-shimmer" />
          </div>
        </main>
        <BottomNav active="dashboard" />
      </div>
    );
  }

  const maxTrend = Math.max(...stats.monthlyTrend.map((m) => m.total), 1);

  return (
    <div className="flex h-full grow flex-col bg-bg-dark font-display min-h-screen text-gray-50">
      {/* Header */}
      <header className="app-header sticky top-0 z-10 bg-[#0A0E1A]/95 backdrop-blur-xl border-b border-white/[0.06] px-4 py-3">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="size-10 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-gray-300 active:scale-[0.95] transition-transform"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-lg font-bold text-white">Top-up History</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="size-10 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center text-white active:scale-[0.95] transition-transform shadow-lg shadow-blue-500/20"
          >
            <Plus size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 pt-6 pb-24">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6 animate-fade-in-up">
          {/* Total Spent */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-4">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center mb-2">
              <Wallet size={16} className="text-blue-400" />
            </div>
            <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold mb-1">
              Total Spent
            </p>
            <p className="text-white text-sm font-bold truncate">
              {country.currencySymbol} {stats.totalSpent.toFixed(0)}
            </p>
          </div>

          {/* Average */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-4">
            <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center mb-2">
              <Receipt size={16} className="text-violet-400" />
            </div>
            <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold mb-1">
              Avg Top-up
            </p>
            <p className="text-white text-sm font-bold truncate">
              {country.currencySymbol} {stats.averageAmount.toFixed(0)}
            </p>
          </div>

          {/* Frequency */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-2">
              <Calendar size={16} className="text-emerald-400" />
            </div>
            <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold mb-1">
              Frequency
            </p>
            <p className="text-white text-sm font-bold truncate">
              {stats.averageFrequencyDays > 0
                ? `Every ${Math.round(stats.averageFrequencyDays)}d`
                : "--"}
            </p>
          </div>
        </div>

        {/* Add Top-up Form */}
        {showForm && (
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 mb-6 animate-fade-in-up">
            <h2 className="text-white font-bold text-base mb-4 flex items-center gap-2">
              <Plus size={18} className="text-blue-400" />
              Add Top-up
            </h2>

            <div className="space-y-3">
              {/* Amount */}
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1.5 block">
                  Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-bold">
                    {country.currencySymbol}
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="999999.99"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 50.00"
                    className="w-full h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-sm font-bold pl-12 pr-3 placeholder:text-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Units */}
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1.5 block">
                  Units received (optional)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="99999"
                    value={units}
                    onChange={(e) => setUnits(e.target.value)}
                    placeholder="e.g. 25 kWh"
                    className="w-full h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-sm font-bold pl-4 pr-14 placeholder:text-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
                    kWh
                  </span>
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1.5 block">
                  Note (optional)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={100}
                  placeholder="e.g. MTN MoMo"
                  className="w-full h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-sm font-bold pl-4 pr-3 placeholder:text-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <button
                onClick={handleAdd}
                disabled={!amount || parseFloat(amount) <= 0}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={18} />
                Add Top-up
              </button>
            </div>
          </div>
        )}

        {/* Monthly Trend Chart */}
        {stats.topUpCount > 0 && (
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 mb-6 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-blue-400" />
              <h2 className="text-white font-bold text-base">Monthly Spending</h2>
            </div>

            <div className="flex items-end gap-2 h-40">
              {stats.monthlyTrend.map((m, idx) => {
                const heightPercent =
                  maxTrend > 0 ? (m.total / maxTrend) * 100 : 0;
                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center justify-end h-full"
                  >
                    {m.total > 0 && (
                      <span className="text-[10px] text-gray-400 font-semibold mb-1 truncate w-full text-center">
                        {m.total >= 1000
                          ? `${(m.total / 1000).toFixed(1)}k`
                          : m.total.toFixed(0)}
                      </span>
                    )}
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-blue-500 to-violet-500 transition-all duration-500 min-h-[4px]"
                      style={{
                        height: `${Math.max(heightPercent, 3)}%`,
                        opacity: m.total > 0 ? 1 : 0.15,
                      }}
                    />
                    <span className="text-[10px] text-gray-500 font-medium mt-2">
                      {m.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* This Month vs Last Month */}
        {stats.topUpCount > 0 && (
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 mb-6 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-4">
              {stats.monthlyChange <= 0 ? (
                <TrendingDown size={18} className="text-emerald-400" />
              ) : (
                <TrendingUp size={18} className="text-orange-400" />
              )}
              <h2 className="text-white font-bold text-base">
                Spending Comparison
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              {/* This month */}
              <div className="rounded-xl bg-white/[0.06] border border-blue-500/20 p-3">
                <p className="text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  This Month
                </p>
                <p className="text-white text-xl font-bold">
                  {country.currencySymbol} {stats.thisMonthSpent.toFixed(2)}
                </p>
              </div>

              {/* Last month */}
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">
                  Last Month
                </p>
                <p className="text-gray-300 text-xl font-bold">
                  {country.currencySymbol} {stats.lastMonthSpent.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Change indicator */}
            <div className="flex items-center justify-center gap-1.5 py-1">
              {stats.lastMonthSpent === 0 ? (
                <span className="text-gray-500 text-sm font-medium">
                  No last month data
                </span>
              ) : stats.monthlyChange === 0 ? (
                <span className="text-gray-500 text-sm font-medium">
                  No change
                </span>
              ) : stats.monthlyChange < 0 ? (
                <>
                  <TrendingDown size={16} className="text-emerald-400" />
                  <span className="text-emerald-400 text-sm font-bold">
                    {Math.abs(stats.monthlyChange).toFixed(1)}% less than last
                    month
                  </span>
                </>
              ) : (
                <>
                  <TrendingUp size={16} className="text-orange-400" />
                  <span className="text-orange-400 text-sm font-bold">
                    {stats.monthlyChange.toFixed(1)}% more than last month
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {/* History List */}
        <div>
          <h2 className="text-white text-lg font-bold mb-3">History</h2>

          {groupedTopups.length > 0 ? (
            <div className="space-y-4">
              {groupedTopups.map((group) => (
                <div key={group.label}>
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2 px-1">
                    {group.label}
                  </p>
                  <div className="space-y-2">
                    {group.topups.map((t, idx) => (
                      <div
                        key={t.id}
                        className="relative"
                        style={{
                          animationDelay: `${idx * 60}ms`,
                          animation: "fade-in-up 0.4s ease-out both",
                        }}
                      >
                        {deletingId === t.id && (
                          <div className="absolute inset-0 z-20 bg-bg-dark/95 backdrop-blur-sm rounded-2xl flex items-center justify-center gap-3 animate-fade-in-up">
                            <span className="text-gray-400 text-sm">
                              Delete?
                            </span>
                            <button
                              onClick={() => setDeletingId(null)}
                              className="px-4 py-2 rounded-lg border border-white/[0.06] text-gray-300 text-sm font-bold hover:bg-white/[0.05] transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleDelete(t.id)}
                              className="px-4 py-2 rounded-lg bg-danger text-white text-sm font-bold hover:brightness-110 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        )}

                        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="size-10 rounded-lg bg-blue-500/10 border border-white/[0.06] flex items-center justify-center shrink-0">
                              <Receipt size={18} className="text-blue-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-white font-bold text-sm">
                                {country.currencySymbol}{" "}
                                {t.amount.toFixed(2)}
                              </p>
                              <div className="flex items-center gap-2">
                                <p className="text-gray-500 text-xs">
                                  {new Date(t.timestamp).toLocaleDateString(
                                    country.locale,
                                    {
                                      weekday: "short",
                                      day: "numeric",
                                      month: "short",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              {t.units > 0 && (
                                <p className="text-blue-400 text-xs font-bold">
                                  {t.units} kWh
                                </p>
                              )}
                              {t.note && (
                                <p className="text-gray-500 text-xs truncate max-w-[80px]">
                                  {t.note}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => setDeletingId(t.id)}
                              className="size-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-gray-600 hover:text-red-400 hover:border-red-500/30 transition-colors active:scale-[0.95]"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8 text-center">
              <Receipt size={40} className="text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-sm mb-4">
                No top-ups recorded yet
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-blue-500 to-violet-500 text-white font-bold py-2 px-6 rounded-xl text-sm hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-[0.98]"
              >
                Add Your First Top-up
              </button>
            </div>
          )}
        </div>
      </main>

      <BottomNav active="dashboard" />
    </div>
  );
}
