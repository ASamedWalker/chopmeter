"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  getAllReadings,
  getSettings,
  getRecentReadings,
  deleteReading,
} from "@/lib/storage";
import type { MeterReading, UserSettings, DashboardMetrics } from "@/lib/types";
import { getCountry } from "@/lib/countries";
import BottomNav from "@/components/BottomNav";
import WhatsAppButton from "@/components/WhatsAppButton";

function computeMetrics(
  readings: MeterReading[],
  settings: UserSettings
): DashboardMetrics {
  const sorted = [...readings].sort((a, b) => b.timestamp - a.timestamp);
  const lastReading = sorted[0] ?? null;

  const weekReadings = sorted.filter(
    (r) => r.timestamp >= Date.now() - 7 * 24 * 60 * 60 * 1000
  );
  let weeklyUsage = 0;
  for (let i = 0; i < weekReadings.length - 1; i++) {
    weeklyUsage += Math.abs(weekReadings[i].value - weekReadings[i + 1].value);
  }
  const daysWithData = Math.max(
    1,
    weekReadings.length > 1
      ? (weekReadings[0].timestamp -
          weekReadings[weekReadings.length - 1].timestamp) /
          (24 * 60 * 60 * 1000)
      : 1
  );
  const dailyKwh = weekReadings.length > 1 ? weeklyUsage / daysWithData : 0;
  const dailyBurnRate = dailyKwh * settings.tariffRate;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayReadings = sorted.filter(
    (r) => r.timestamp >= todayStart.getTime()
  );
  let todayUsage = 0;
  for (let i = 0; i < todayReadings.length - 1; i++) {
    todayUsage += Math.abs(
      todayReadings[i].value - todayReadings[i + 1].value
    );
  }

  const elapsed =
    (Date.now() - settings.lastBalanceDate) / (24 * 60 * 60 * 1000);
  const currentBalance = Math.max(
    0,
    settings.lastBalance - elapsed * dailyBurnRate
  );

  const daysLeft =
    dailyBurnRate > 0 ? Math.round(currentBalance / dailyBurnRate) : null;

  return {
    currentBalance,
    dailyBurnRate,
    daysLeft,
    lastReading,
    todayUsage,
    weeklyUsage,
  };
}

/** Easing: easeOutCubic */
function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export default function DashboardPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentReadings, setRecentReadings] = useState<MeterReading[]>([]);
  const [settings, setSettingsState] = useState<UserSettings | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [expandedReading, setExpandedReading] = useState<string | null>(null);
  const [deletingReading, setDeletingReading] = useState<string | null>(null);
  const [displayBalance, setDisplayBalance] = useState(0);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const loadData = useCallback(() => {
    const s = getSettings();
    if (!s.onboardingComplete) {
      router.replace("/onboarding");
      return;
    }
    setSettingsState(s);
    const readings = getAllReadings();
    setMetrics(computeMetrics(readings, s));
    setRecentReadings(getRecentReadings(7).slice(0, 10));
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Animated balance counter
  useEffect(() => {
    if (!metrics) return;
    const target = metrics.currentBalance;
    const duration = 800;
    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      setDisplayBalance(target * easeOutCubic(progress));
      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [metrics]);

  const handleDeleteReading = (id: string) => {
    deleteReading(id);
    setDeletingReading(null);
    setExpandedReading(null);
    loadData();
  };

  const handleLongPressStart = (id: string) => {
    longPressTimer.current = setTimeout(() => {
      navigator.vibrate?.(50);
      setDeletingReading(id);
    }, 600);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const toggleCard = (key: string) => {
    setExpandedCard(expandedCard === key ? null : key);
  };

  // Skeleton loading state
  if (!metrics || !settings) {
    return (
      <div className="flex flex-col min-h-screen bg-bg-dark">
        {/* Skeleton header */}
        <header className="sticky top-0 z-10 bg-bg-dark/80 backdrop-blur-xl border-b border-white/[0.06] px-4 py-3">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full skeleton-shimmer" />
              <div className="h-5 w-28 rounded-lg skeleton-shimmer" />
            </div>
            <div className="flex items-center gap-2">
              <div className="size-10 rounded-full skeleton-shimmer" />
              <div className="size-10 rounded-full skeleton-shimmer" />
            </div>
          </div>
        </header>
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 pb-24">
          {/* Skeleton hero */}
          <div className="glass-card gradient-hero p-6 mb-4">
            <div className="h-4 w-32 rounded skeleton-shimmer mb-4" />
            <div className="h-10 w-48 rounded-lg skeleton-shimmer mb-6" />
            <div className="h-12 w-full rounded-xl skeleton-shimmer" />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="glass-card p-5 h-32 skeleton-shimmer" />
            <div className="glass-card p-5 h-32 skeleton-shimmer" />
          </div>
          <div className="h-5 w-36 rounded skeleton-shimmer mb-3" />
          <div className="space-y-2">
            <div className="glass-card p-4 h-16 skeleton-shimmer" />
            <div className="glass-card p-4 h-16 skeleton-shimmer" />
            <div className="glass-card p-4 h-16 skeleton-shimmer" />
          </div>
        </main>
        <BottomNav active="dashboard" />
      </div>
    );
  }

  const country = getCountry(settings.countryCode);
  const hasData = recentReadings.length > 0;

  // Runway color
  const runwayColor =
    metrics.daysLeft === null
      ? "text-gray-500"
      : metrics.daysLeft <= 3
      ? "text-danger"
      : metrics.daysLeft <= 7
      ? "text-yellow-400"
      : "text-white";

  const runwayBarColor =
    metrics.daysLeft === null
      ? "bg-gray-700"
      : metrics.daysLeft <= 3
      ? "bg-danger"
      : metrics.daysLeft <= 7
      ? "bg-yellow-400"
      : "bg-gradient-to-r from-blue-500 to-violet-500";

  return (
    <div className="flex h-full grow flex-col bg-bg-dark font-display min-h-screen text-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-bg-dark/80 backdrop-blur-xl border-b border-white/[0.06] px-4 py-3">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-full bg-gradient-to-br from-blue-500/20 to-violet-500/20 text-blue-400">
              <span className="material-symbols-outlined">electric_bolt</span>
            </div>
            <h2 className="text-white text-xl font-extrabold tracking-tight">
              ChopMeter
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/settings")}
              className="flex items-center justify-center size-10 rounded-full bg-white/[0.05] border border-white/[0.06] text-gray-400 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">settings</span>
            </button>
            <button
              onClick={() => router.push("/scanner")}
              className="flex items-center justify-center size-10 rounded-full bg-gradient-to-br from-blue-500/20 to-violet-500/20 text-blue-400 hover:from-blue-500/30 hover:to-violet-500/30 transition-colors"
            >
              <span className="material-symbols-outlined">
                qr_code_scanner
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 pb-24">
        {/* Hero Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Main Balance Card */}
          <div
            onClick={() => toggleCard("balance")}
            className="md:col-span-2 relative overflow-hidden glass-card gradient-hero p-6 shadow-xl cursor-pointer active:scale-[0.98] transition-transform"
          >
            <div className="absolute top-0 right-0 p-4 opacity-[0.07]">
              <span className="material-symbols-outlined text-8xl text-blue-400">
                account_balance_wallet
              </span>
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">
                    Estimated Balance
                  </p>
                  <span
                    className={`material-symbols-outlined text-gray-500 text-lg transition-transform ${
                      expandedCard === "balance" ? "rotate-180" : ""
                    }`}
                  >
                    expand_more
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2 animate-number-pop">
                  <span className="text-xl font-bold text-gray-500 align-top mt-1 inline-block">
                    {country.currencySymbol}
                  </span>{" "}
                  <span className="gradient-primary-text">
                    {displayBalance.toFixed(2)}
                  </span>
                </h1>
              </div>

              {/* Expanded details */}
              {expandedCard === "balance" && (
                <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-2 animate-fade-in-up">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Last updated</span>
                    <span className="text-gray-200">
                      {new Date(settings.lastBalanceDate).toLocaleDateString(
                        country.locale,
                        {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Daily burn rate</span>
                    <span className="text-gray-200">
                      {hasData
                        ? `${country.currencySymbol} ${metrics.dailyBurnRate.toFixed(2)}/day`
                        : "No data yet"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Tariff</span>
                    <span className="text-gray-200">
                      {country.currencySymbol} {settings.tariffRate}/kWh
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push("/scanner");
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-violet-500 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined">
                    qr_code_scanner
                  </span>
                  Scan Meter
                </button>
              </div>
            </div>
          </div>

          {/* Side cards */}
          <div className="flex flex-col gap-4">
            {/* Runway Card */}
            <div
              onClick={() => toggleCard("runway")}
              className="flex-1 glass-card p-5 flex flex-col justify-center relative overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
            >
              <div className="absolute -right-4 -bottom-4 size-28 bg-blue-500/10 rounded-full blur-2xl" />
              <div className="flex items-center justify-between mb-3">
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">
                  Est. Runway
                </p>
                <span className="material-symbols-outlined text-blue-400 text-xl">
                  timelapse
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className={`text-3xl font-bold ${runwayColor}`}>
                  {metrics.daysLeft !== null ? `~${metrics.daysLeft}` : "--"}
                </h3>
                <span className="text-lg text-gray-400 font-medium">Days</span>
              </div>

              {metrics.daysLeft !== null ? (
                <div className="w-full bg-white/[0.05] rounded-full h-2 mt-3">
                  <div
                    className={`${runwayBarColor} h-2 rounded-full transition-all`}
                    style={{
                      width: `${Math.min(100, (metrics.daysLeft / 30) * 100)}%`,
                    }}
                  />
                </div>
              ) : (
                <p className="text-gray-500 text-xs mt-2">
                  Scan meter to start tracking
                </p>
              )}

              {expandedCard === "runway" && metrics.daysLeft !== null && (
                <div className="mt-3 pt-3 border-t border-white/[0.06] text-xs text-gray-400 space-y-1 animate-fade-in-up">
                  <p>
                    Based on {country.currencySymbol}{" "}
                    {metrics.dailyBurnRate.toFixed(2)}/day burn rate
                  </p>
                  {metrics.daysLeft <= 3 && (
                    <p className="text-danger font-bold">
                      Top up soon to avoid blackout!
                    </p>
                  )}
                  {metrics.daysLeft > 3 && metrics.daysLeft <= 7 && (
                    <p className="text-yellow-400 font-bold">
                      Consider topping up this week
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Daily Avg Card */}
            <div
              onClick={() => toggleCard("daily")}
              className="flex-1 glass-card p-5 flex flex-col justify-center cursor-pointer active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">
                  Daily Avg
                </p>
                <span className="material-symbols-outlined text-blue-400 text-xl">
                  monitoring
                </span>
              </div>
              {hasData ? (
                <h3 className="text-2xl font-bold text-white">
                  {country.currencySymbol} {metrics.dailyBurnRate.toFixed(2)}
                </h3>
              ) : (
                <h3 className="text-2xl font-bold text-gray-500">--</h3>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {hasData
                  ? "Per day estimated"
                  : "Add readings to see daily average"}
              </p>

              {expandedCard === "daily" && hasData && (
                <div className="mt-3 pt-3 border-t border-white/[0.06] text-xs text-gray-400 space-y-1 animate-fade-in-up">
                  <div className="flex justify-between">
                    <span>Weekly usage</span>
                    <span className="text-gray-200">
                      {metrics.weeklyUsage.toFixed(1)} kWh
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Today usage</span>
                    <span className="text-gray-200">
                      {metrics.todayUsage.toFixed(1)} kWh
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Readings */}
        <div>
          <h2 className="text-white text-lg font-bold mb-3">
            Recent Readings
          </h2>
          {recentReadings.length > 0 ? (
            <div className="space-y-2">
              {recentReadings.map((r, idx) => {
                const isExpanded = expandedReading === r.id;
                const isDeleting = deletingReading === r.id;
                const prevReading = recentReadings[idx + 1];
                const delta = prevReading
                  ? Math.abs(r.value - prevReading.value)
                  : null;

                return (
                  <div
                    key={r.id}
                    className="relative"
                    style={{
                      animationDelay: `${idx * 80}ms`,
                      animation: "fade-in-up 0.4s ease-out both",
                    }}
                  >
                    {/* Delete Confirmation Overlay */}
                    {isDeleting && (
                      <div className="absolute inset-0 z-20 bg-bg-dark/95 backdrop-blur-sm rounded-2xl flex items-center justify-center gap-3 animate-fade-in-up">
                        <span className="text-gray-400 text-sm">Delete?</span>
                        <button
                          onClick={() => setDeletingReading(null)}
                          className="px-4 py-2 rounded-lg border border-white/[0.06] text-gray-300 text-sm font-bold hover:bg-white/[0.05] transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDeleteReading(r.id)}
                          className="px-4 py-2 rounded-lg bg-danger text-white text-sm font-bold hover:brightness-110 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    )}

                    <div
                      onClick={() =>
                        setExpandedReading(isExpanded ? null : r.id)
                      }
                      onTouchStart={() => handleLongPressStart(r.id)}
                      onTouchEnd={handleLongPressEnd}
                      onTouchCancel={handleLongPressEnd}
                      onMouseDown={() => handleLongPressStart(r.id)}
                      onMouseUp={handleLongPressEnd}
                      onMouseLeave={handleLongPressEnd}
                      className="glass-card p-4 cursor-pointer active:scale-[0.98] transition-all hover:border-blue-500/30"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-lg bg-white/[0.05] border border-white/[0.06] flex items-center justify-center text-gray-300">
                            <span className="material-symbols-outlined">
                              {r.source === "ocr"
                                ? "photo_camera"
                                : "keyboard"}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-bold text-sm">
                              {r.value.toFixed(1)} kWh
                            </p>
                            <p className="text-gray-500 text-xs">
                              {new Date(r.timestamp).toLocaleDateString(
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
                        <div className="flex items-center gap-2">
                          {delta !== null && (
                            <span className="text-xs text-blue-400 font-bold">
                              +{delta.toFixed(1)}
                            </span>
                          )}
                          <span
                            className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                              r.source === "ocr"
                                ? "bg-blue-500/10 text-blue-400"
                                : "bg-white/[0.05] text-gray-400"
                            }`}
                          >
                            {r.source}
                          </span>
                        </div>
                      </div>

                      {/* Expanded reading details */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-white/[0.06] text-xs text-gray-400 space-y-1 animate-fade-in-up">
                          <div className="flex justify-between">
                            <span>Full timestamp</span>
                            <span className="text-gray-200">
                              {new Date(r.timestamp).toLocaleString(
                                country.locale
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Source</span>
                            <span className="text-gray-200">
                              {r.source === "ocr"
                                ? "Camera scan"
                                : "Manual entry"}
                            </span>
                          </div>
                          {delta !== null && (
                            <div className="flex justify-between">
                              <span>Est. cost since previous</span>
                              <span className="text-blue-400 font-bold">
                                {country.currencySymbol}{" "}
                                {(delta * settings.tariffRate).toFixed(2)}
                              </span>
                            </div>
                          )}
                          <p className="text-gray-600 pt-1">
                            Long-press to delete this reading
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass-card p-8 text-center">
              <span className="material-symbols-outlined text-gray-600 text-4xl mb-3 block">
                electric_meter
              </span>
              <p className="text-gray-400 text-sm mb-4">
                No readings yet. Scan your meter to get started!
              </p>
              <button
                onClick={() => router.push("/scanner")}
                className="bg-gradient-to-r from-blue-500 to-violet-500 text-white font-bold py-2 px-6 rounded-xl text-sm hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-[0.98]"
              >
                Scan Now
              </button>
            </div>
          )}
        </div>
      </main>

      <WhatsAppButton />
      <BottomNav active="dashboard" />
    </div>
  );
}
