"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  getAllReadings,
  getSettings,
  saveSettings,
  getRecentReadings,
  deleteReading,
  getReminderSettings,
} from "@/lib/storage";
import {
  checkLowBalanceNotification,
  checkDailyReminder,
  checkWeeklyReport,
  checkStreakReminder,
  checkUsageSpike,
} from "@/lib/notifications";
import type { MeterReading, UserSettings, DashboardMetrics, WeatherCache } from "@/lib/types";
import { getCountry, getEffectiveRate, getDailyServiceCharge } from "@/lib/countries";
import { getGreeting } from "@/lib/greeting";
import { getBudgetStatus } from "@/lib/budget";
import type { BudgetStatus } from "@/lib/budget";
import { fetchWeather, decodeWeatherCode } from "@/lib/weather";
import { refreshWeeklyScans, checkStreakStatus, getTrackerLevel, getNextLevel } from "@/lib/streak";
import { checkAchievements, getAllAchievements } from "@/lib/achievements";
import { getWeeklyInsight } from "@/lib/insights";
import { getActiveChallenge, generateChallenge } from "@/lib/challenges";
import type { StreakData, Achievement, WeeklyInsight, Challenge } from "@/lib/types";
import BottomNav from "@/components/BottomNav";
import PullToRefresh from "@/components/PullToRefresh";
import UsageChart from "@/components/UsageChart";
import LowBalanceAlert from "@/components/LowBalanceAlert";
import StreakCard from "@/components/StreakCard";
import AchievementToast from "@/components/AchievementToast";
import InsightsCard from "@/components/InsightsCard";
import ChallengeCard from "@/components/ChallengeCard";
import SplashScreen from "@/components/SplashScreen";

import Link from "next/link";
import {
  ScanLine,
  Wallet,
  ChevronDown,
  TrendingUp,
  Camera,
  Keyboard,
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  Snowflake,
  CloudLightning,
  Calculator,
  FileText,
  Lightbulb,
  Activity,
  Plus,
  X,
  Info,
  Flame,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const WEATHER_ICON_MAP: Record<string, LucideIcon> = {
  Sun, CloudSun, Cloud, CloudFog, CloudDrizzle, CloudRain, Snowflake, CloudLightning,
};

function computeMetrics(
  readings: MeterReading[],
  settings: UserSettings,
  countryCode: string
): DashboardMetrics {
  const country = getCountry(countryCode);
  const sorted = [...readings].sort((a, b) => b.timestamp - a.timestamp);
  const lastReading = sorted[0] ?? null;

  const weekReadings = sorted.filter(
    (r) => r.timestamp >= Date.now() - 7 * 24 * 60 * 60 * 1000
  );
  let weeklyUsage = 0;
  for (let i = 0; i < weekReadings.length - 1; i++) {
    weeklyUsage += Math.abs(weekReadings[i].value - weekReadings[i + 1].value);
  }
  const dataSpanDays =
    weekReadings.length > 1
      ? (weekReadings[0].timestamp -
          weekReadings[weekReadings.length - 1].timestamp) /
          (24 * 60 * 60 * 1000)
      : 0;
  const daysWithData = Math.max(1, dataSpanDays);
  const dataAdequate = weekReadings.length >= 2 && dataSpanDays >= 1;
  const dailyKwh = weekReadings.length > 1 ? weeklyUsage / daysWithData : 0;

  // Use tiered billing: estimate monthly kWh to get effective rate
  const estimatedMonthlyKwh = dailyKwh * 30;
  const effectiveRate = country.tariffTiers
    ? getEffectiveRate(estimatedMonthlyKwh, country)
    : settings.tariffRate;
  // Daily burn = energy cost + prorated monthly service charge
  const dailyBurnRate = dailyKwh * effectiveRate + getDailyServiceCharge(country);

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
    dailyBurnRate > 0 && dataAdequate
      ? Math.round(currentBalance / dailyBurnRate)
      : null;

  return {
    currentBalance,
    dailyBurnRate,
    daysLeft,
    lastReading,
    todayUsage,
    weeklyUsage,
    dataAdequate,
    dataSpanDays: Math.round(dataSpanDays * 10) / 10,
  };
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export default function DashboardPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [allReadings, setAllReadings] = useState<MeterReading[]>([]);
  const [recentReadings, setRecentReadings] = useState<MeterReading[]>([]);
  const [settings, setSettingsState] = useState<UserSettings | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [expandedReading, setExpandedReading] = useState<string | null>(null);
  const [deletingReading, setDeletingReading] = useState<string | null>(null);
  const [displayBalance, setDisplayBalance] = useState(0);
  const [balanceInput, setBalanceInput] = useState("");
  const [balanceSaved, setBalanceSaved] = useState(false);
  const [weather, setWeather] = useState<WeatherCache | null>(null);
  const [fabOpen, setFabOpen] = useState(false);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [streakStatus, setStreakStatus] = useState<"active" | "at_risk" | "lost">("lost");
  const [weeklyInsight, setWeeklyInsight] = useState<WeeklyInsight | null>(null);
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [achievementToast, setAchievementToast] = useState<Achievement | null>(null);
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window === "undefined") return false;
    const shown = sessionStorage.getItem("chopmeter_splash_shown");
    return !shown;
  });
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
    setAllReadings(readings);
    setMetrics(computeMetrics(readings, s, s.countryCode));
    setRecentReadings(getRecentReadings(7).slice(0, 10));

    // Engagement: streak, insights, challenges
    const streakData = refreshWeeklyScans();
    setStreak(streakData);
    setStreakStatus(checkStreakStatus());

    const insight = getWeeklyInsight(readings, s.countryCode, s.tariffRate);
    setWeeklyInsight(insight);

    // Check for new badge from scanner
    const pendingBadge = sessionStorage.getItem("chopmeter_new_badge");
    if (pendingBadge) {
      try {
        setAchievementToast(JSON.parse(pendingBadge));
      } catch {}
      sessionStorage.removeItem("chopmeter_new_badge");
    }

    let challenge = getActiveChallenge();
    if (!challenge && readings.length >= 2) {
      const country = getCountry(s.countryCode);
      challenge = generateChallenge({
        lastWeekCost: insight?.prevWeekCost ?? 0,
        currencySymbol: country.currencySymbol,
        currentStreak: streakData.currentStreak,
        monthlyBudget: s.monthlyBudget,
        dailyBurnRate: computeMetrics(readings, s, s.countryCode)?.dailyBurnRate ?? 0,
      });
    }
    setActiveChallenge(challenge);
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Fetch weather
  useEffect(() => {
    if (settings?.countryCode) {
      fetchWeather(settings.countryCode).then(setWeather);
    }
  }, [settings?.countryCode]);

  // Animated balance counter — only animate on actual value change
  const prevBalanceRef = useRef<number | null>(null);
  useEffect(() => {
    if (!metrics) return;
    const target = metrics.currentBalance;
    const from = prevBalanceRef.current;

    // Skip animation if value hasn't changed (e.g. pull-to-refresh with no new data)
    if (from !== null && Math.abs(from - target) < 0.01) {
      setDisplayBalance(target);
      return;
    }

    // First load: snap to value, no animation
    if (from === null) {
      setDisplayBalance(target);
      prevBalanceRef.current = target;
      return;
    }

    // Animate from previous value to new value
    prevBalanceRef.current = target;
    const duration = 600;
    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      setDisplayBalance(from + (target - from) * easeOutCubic(progress));
      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [metrics?.currentBalance]);

  // Check notification reminders when dashboard loads
  useEffect(() => {
    if (!metrics || !settings) return;
    const reminderSettings = getReminderSettings();
    if (!reminderSettings.enabled) return;

    // Low balance check (once per session)
    if (reminderSettings.lowBalanceAlert) {
      const alreadyShown = sessionStorage.getItem("chopmeter_low_balance_shown");
      if (!alreadyShown && metrics.daysLeft !== null && metrics.daysLeft <= reminderSettings.lowBalanceThreshold) {
        sessionStorage.setItem("chopmeter_low_balance_shown", "true");
        checkLowBalanceNotification(metrics.daysLeft, reminderSettings.lowBalanceThreshold);
      }
    }

    // Daily check reminder
    if (reminderSettings.dailyCheckReminder) {
      checkDailyReminder(reminderSettings.dailyCheckTime);
    }

    // Weekly report
    if (reminderSettings.weeklyReport) {
      const country = getCountry(settings.countryCode);
      checkWeeklyReport(metrics.weeklyUsage, country.currencySymbol, metrics.dailyBurnRate);
    }

    // Streak at-risk reminder (evening)
    if (streak) {
      checkStreakReminder(streak.currentStreak, streakStatus === "active");
    }

    // Usage spike detection
    if (metrics.dataAdequate && metrics.todayUsage > 0) {
      const avgDaily = metrics.weeklyUsage / Math.max(metrics.dataSpanDays, 1);
      checkUsageSpike(metrics.todayUsage, avgDaily);
    }
  }, [metrics, settings, streak, streakStatus]);

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
        <header className="app-header sticky top-0 z-10 bg-[#0A0E1A] border-b border-white/[0.06] px-4 py-3">
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
          <div className="h-7 w-48 rounded skeleton-shimmer mb-1" />
          <div className="h-4 w-32 rounded skeleton-shimmer mb-6" />
          <div className="rounded-3xl bg-[#0F1729] p-6 mb-6">
            <div className="h-4 w-24 rounded skeleton-shimmer mb-3" />
            <div className="h-14 w-56 rounded-lg skeleton-shimmer mb-2" />
            <div className="h-3 w-40 rounded skeleton-shimmer mb-5" />
            <div className="h-12 w-full rounded-2xl skeleton-shimmer" />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="glass-card p-5 h-32 skeleton-shimmer" />
            <div className="glass-card p-5 h-32 skeleton-shimmer" />
          </div>
          <div className="glass-card p-5 h-52 skeleton-shimmer mb-6" />
          <div className="glass-card p-4 h-16 skeleton-shimmer mb-6" />
        </main>
        <BottomNav active="dashboard" />
      </div>
    );
  }

  const country = getCountry(settings.countryCode);
  const hasData = recentReadings.length > 0;
  const currencySymbol = country.currencySymbol;

  const runwayColor =
    metrics.daysLeft === null
      ? "text-gray-500"
      : metrics.daysLeft <= 3
      ? "text-danger"
      : metrics.daysLeft <= 7
      ? "text-yellow-400"
      : "text-white";

  const budget = getBudgetStatus(
    allReadings,
    settings.tariffRate,
    settings.monthlyBudget
  );

  return (
    <div className="flex h-full grow flex-col bg-bg-dark font-display min-h-screen text-gray-50">
      {showSplash && (
        <SplashScreen onFinish={() => {
          setShowSplash(false);
          sessionStorage.setItem("chopmeter_splash_shown", "1");
        }} />
      )}
      <AchievementToast
        achievement={achievementToast}
        onDismiss={() => setAchievementToast(null)}
        onViewAll={() => router.push("/settings")}
      />
      <PullToRefresh onRefresh={() => loadData()}>
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 pt-6 pb-24">
        {/* Greeting + Weather Row */}
        <div className="flex items-start justify-between mb-6 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {getGreeting()}
              {settings.displayName ? `, ${settings.displayName}` : ""}
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Here&apos;s your energy overview
            </p>
          </div>

          {weather && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] shrink-0">
              {(() => {
                const { icon } = decodeWeatherCode(weather.weatherCode);
                const WeatherIcon = WEATHER_ICON_MAP[icon] ?? Cloud;
                return <WeatherIcon size={20} className="text-blue-400" />;
              })()}
              <div className="flex flex-col">
                <span className="text-white text-sm font-bold leading-tight">
                  {weather.temperature}&deg;C
                </span>
                <span className="text-gray-500 text-[10px] leading-tight">
                  {weather.cityName}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Streak Card */}
        {streak && (
          <StreakCard
            streak={streak}
            level={getTrackerLevel(streak.totalScans)}
            nextLevel={getNextLevel(streak.totalScans)}
            status={streakStatus}
            onScanNow={() => router.push("/scanner")}
          />
        )}

        {/* Active Challenge */}
        <ChallengeCard challenge={activeChallenge} currencySymbol={currencySymbol} />

        {/* Hero Balance Card — THE focal point */}
        <div
          onClick={() => toggleCard("balance")}
          className="keep-dark relative overflow-hidden rounded-3xl bg-[#0F1729] p-6 pb-5 shadow-2xl shadow-blue-950/40 border border-white/[0.04] mb-6 cursor-pointer active:scale-[0.99] transition-transform"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/[0.06] rounded-full blur-3xl -translate-y-12 translate-x-12" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-violet-500/[0.04] rounded-full blur-2xl translate-y-8 -translate-x-8" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-1">
              <p className="text-gray-400 text-sm font-semibold tracking-wide">
                Balance
              </p>
              <ChevronDown
                size={18}
                className={`text-gray-500 transition-transform ${
                  expandedCard === "balance" ? "rotate-180" : ""
                }`}
              />
            </div>

            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mt-2 mb-1 animate-number-pop">
              <span className="text-2xl sm:text-3xl font-bold text-gray-400 align-top inline-block mr-1">
                {currencySymbol}
              </span>
              <span className="text-white">
                {displayBalance.toFixed(2)}
              </span>
            </h1>

            <p className="text-gray-500 text-xs mt-1">
              {!hasData
                ? "Scan your meter to start tracking"
                : !metrics.dataAdequate
                ? "Collecting data for estimates..."
                : `${currencySymbol} ${metrics.dailyBurnRate.toFixed(2)}/day burn rate`}
            </p>

            {expandedCard === "balance" && (
              <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-2 animate-fade-in-up">
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
                  <span className="text-gray-400">Tariff</span>
                  <span className="text-gray-200">
                    {currencySymbol} {settings.tariffRate}/kWh
                  </span>
                </div>

                {/* Quick balance update */}
                <div className="pt-2 border-t border-white/[0.06]">
                  <label className="flex items-center gap-1.5 text-gray-400 text-xs uppercase tracking-wider mb-1.5">
                    <Wallet size={12} />
                    Update Balance
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-bold">
                        {currencySymbol}
                      </span>
                      <input
                        type="number"
                        inputMode="decimal"
                        min="0"
                        max="999999.99"
                        value={balanceInput}
                        onChange={(e) => {
                          setBalanceInput(e.target.value);
                          setBalanceSaved(false);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="e.g. 500.00"
                        className="w-full h-10 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white text-sm font-bold pl-10 pr-3 placeholder:text-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      disabled={balanceSaved}
                      onClick={(e) => {
                        e.stopPropagation();
                        const val = parseFloat(balanceInput);
                        if (isNaN(val) || val <= 0 || val > 999999.99) return;
                        saveSettings({
                          lastBalance: val,
                          lastBalanceDate: Date.now(),
                        });
                        setBalanceSaved(true);
                        loadData();
                      }}
                      className="h-10 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 text-white text-sm font-bold hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-[0.95]"
                    >
                      {balanceSaved ? "Saved!" : "Save"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-5 flex gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push("/scanner");
                }}
                className="flex-1 bg-gradient-to-r from-blue-500 to-violet-500 text-white font-bold py-3.5 px-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-[0.98]"
              >
                <ScanLine size={20} />
                Scan Meter
              </button>
            </div>
          </div>
        </div>

        {/* Runway Card — full width with semicircular gauge */}
        <div
          onClick={() => toggleCard("runway")}
          className="glass-card p-5 mb-6 relative overflow-hidden cursor-pointer active:scale-[0.99] transition-transform"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
                Est. Runway
              </p>
              <p className="text-gray-500 text-xs">
                Meter Usage Runway
              </p>
              {hasData && !metrics.dataAdequate && (
                <p className="text-gray-500 text-xs mt-1">
                  {metrics.dataSpanDays < 1 ? "<1 day" : `${metrics.dataSpanDays}d`} of data
                </p>
              )}
              {!hasData && (
                <p className="text-gray-500 text-xs mt-1">
                  Scan your meter to start tracking
                </p>
              )}

              {expandedCard === "runway" && metrics.daysLeft !== null && (
                <div className="mt-3 pt-3 border-t border-white/[0.06] text-xs text-gray-400 space-y-1 animate-fade-in-up">
                  <div className="flex justify-between">
                    <span>Burn rate</span>
                    <span className="text-gray-200">
                      {currencySymbol}
                      {metrics.dailyBurnRate.toFixed(2)}/day
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Projected empty</span>
                    <span className="text-gray-200">
                      {(() => {
                        const d = new Date();
                        d.setDate(d.getDate() + metrics.daysLeft!);
                        return d.toLocaleDateString(country.locale, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        });
                      })()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Semicircular Gauge */}
            <div className="relative w-28 h-16 flex items-center justify-center">
              <svg viewBox="0 0 120 70" className="w-full h-full">
                {/* Background arc */}
                <path
                  d="M 10 65 A 50 50 0 0 1 110 65"
                  fill="none"
                  className="stroke-white/[0.06] gauge-arc-bg"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                {/* Filled arc */}
                <path
                  d="M 10 65 A 50 50 0 0 1 110 65"
                  fill="none"
                  stroke="url(#gaugeGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(metrics.daysLeft !== null ? Math.min(100, (metrics.daysLeft / 30) * 100) : 0) * 1.57} 157`}
                  className="transition-all duration-700"
                />
                <defs>
                  <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute bottom-0 text-center">
                <span className={`text-lg font-extrabold ${runwayColor}`}>
                  {metrics.daysLeft !== null ? `${Math.min(100, Math.round((metrics.daysLeft / 30) * 100))}%` : "0%"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Metric cards row — Daily Avg + Daily Trend */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Daily Avg Card */}
          <div
            onClick={() => toggleCard("daily")}
            className="glass-card p-5 flex flex-col justify-between cursor-pointer active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                Daily Avg
              </p>
              <TrendingUp size={18} className="text-blue-400" />
            </div>
            {hasData ? (
              <h3 className="text-xl font-bold text-white">
                {currencySymbol} {metrics.dailyBurnRate.toFixed(2)}
              </h3>
            ) : (
              <h3 className="text-xl font-bold text-gray-500">--</h3>
            )}
            <p className="text-[10px] text-gray-500 mt-1">
              {hasData
                ? "Per day estimated"
                : "Add readings to see daily average"}
            </p>

            {expandedCard === "daily" && hasData && (
              <div className="mt-3 pt-3 border-t border-white/[0.06] text-xs text-gray-400 space-y-1 animate-fade-in-up">
                <div className="flex justify-between">
                  <span>Weekly</span>
                  <span className="text-gray-200">
                    {metrics.weeklyUsage.toFixed(1)} kWh
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Today</span>
                  <span className="text-gray-200">
                    {metrics.todayUsage.toFixed(1)} kWh
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Daily Average Trend Card — mini sparkline bars */}
          <div className="glass-card p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                Daily Average Trend
              </p>
              <Activity size={18} className="text-violet-400" />
            </div>

            {/* Mini sparkline bars */}
            <div className="flex items-end gap-1 h-10 mt-1">
              {(() => {
                if (!hasData || allReadings.length < 2) {
                  return Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="flex-1 bg-white/[0.04] rounded-sm h-2" />
                  ));
                }
                const sorted = [...allReadings].sort((a, b) => a.timestamp - b.timestamp);
                const now = new Date();
                const bars: number[] = [];
                for (let d = 6; d >= 0; d--) {
                  const date = new Date(now);
                  date.setDate(date.getDate() - d);
                  date.setHours(0, 0, 0, 0);
                  const next = new Date(date);
                  next.setDate(next.getDate() + 1);
                  const dayR = sorted.filter(r => r.timestamp >= date.getTime() && r.timestamp < next.getTime());
                  let kWh = 0;
                  for (let j = 0; j < dayR.length - 1; j++) {
                    kWh += Math.abs(dayR[j + 1].value - dayR[j].value);
                  }
                  bars.push(kWh);
                }
                const maxBar = Math.max(...bars, 0.1);
                return bars.map((v, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-sm transition-all ${
                      v > 0
                        ? i === bars.length - 1
                          ? "bg-gradient-to-t from-violet-500 to-blue-400"
                          : "bg-white/[0.15]"
                        : "bg-white/[0.04]"
                    }`}
                    style={{ height: `${Math.max(v > 0 ? 20 : 8, (v / maxBar) * 100)}%` }}
                  />
                ));
              })()}
            </div>

            <p className="text-[10px] text-gray-500 mt-2">
              {hasData && allReadings.length >= 2
                ? "7-day usage pattern"
                : "Add readings to see daily average"}
            </p>
          </div>
        </div>

        {/* Usage Chart — right after balance like the mockup */}
        {allReadings.length > 1 && (
          <div className="mb-6">
            <UsageChart
              readings={allReadings}
              tariffRate={settings.tariffRate}
              currencySymbol={currencySymbol}
            />
          </div>
        )}

        {/* Weekly Insights */}
        <InsightsCard
          insight={weeklyInsight}
          currencySymbol={currencySymbol}
          totalReadings={allReadings.length}
        />

        {/* Meter Health Check Card — with trend badge */}
        <Link href="/health" className="block glass-card p-4 mb-6 animate-fade-in-up hover:border-blue-500/20 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-white font-display font-bold text-sm">Health check</p>
              <p className="text-gray-500 text-xs font-display">Is your meter running fast? Find out &rarr;</p>
            </div>
            {hasData && metrics.dataAdequate && metrics.todayUsage > 0 && (() => {
              const avgDaily = metrics.weeklyUsage / Math.max(1, metrics.dataSpanDays);
              if (avgDaily <= 0) return null;
              const pctChange = Math.round(((metrics.todayUsage - avgDaily) / avgDaily) * 100);
              if (pctChange === 0) return null;
              return (
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  pctChange > 20
                    ? "bg-red-500/10 text-red-400"
                    : pctChange > 0
                    ? "bg-amber-500/10 text-amber-400"
                    : "bg-emerald-500/10 text-emerald-400"
                }`}>
                  {pctChange > 0 ? "+" : ""}{pctChange}%
                </span>
              );
            })()}
          </div>
        </Link>

        {/* Monthly Budget Tracker */}
        {budget && (
          <div className="glass-card p-4 mb-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Wallet size={14} className="text-blue-400" />
                <span className="text-white text-xs font-bold uppercase tracking-wider">Monthly Budget</span>
              </div>
              <div className="flex items-center gap-1.5">
                {budget.percentage >= 50 && (
                  <Flame
                    size={budget.percentage >= 90 ? 16 : budget.percentage >= 70 ? 14 : 12}
                    className={`${
                      budget.percentage >= 90 ? "text-red-400 animate-pulse" :
                      budget.percentage >= 70 ? "text-amber-400 animate-bounce-subtle" :
                      "text-yellow-400"
                    } transition-all duration-500`}
                  />
                )}
                <span className={`text-xs font-bold ${
                  budget.status === "on_track" ? "text-emerald-400" :
                  budget.status === "warning" ? "text-amber-400" :
                  "text-red-400"
                }`}>
                  {budget.percentage.toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="h-2.5 bg-black/[0.08] dark:bg-white/[0.06] rounded-full overflow-hidden mb-2 budget-track">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  budget.status === "on_track" ? "bg-gradient-to-r from-emerald-500 to-emerald-400" :
                  budget.status === "warning" ? "bg-gradient-to-r from-amber-500 to-orange-400" :
                  "bg-gradient-to-r from-red-500 to-red-400"
                }`}
                style={{ width: `${Math.min(100, budget.percentage)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-400">
                {currencySymbol}{budget.spent.toFixed(0)} spent
              </span>
              <span className="text-gray-500">
                {currencySymbol}{budget.budget.toFixed(0)} budget
              </span>
            </div>
            {budget.percentage >= 90 && (
              <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-black/[0.06] dark:border-white/[0.06]">
                <Flame size={14} className={`${budget.status === "over" ? "text-red-400" : "text-amber-400"} animate-pulse`} />
                <span className={`text-xs font-semibold ${budget.status === "over" ? "text-red-400" : "text-amber-400"}`}>
                  {budget.status === "over" ? "Over budget! Slow down" : "Budget running hot"}
                  {budget.safeDailyLimit > 0 && ` · ${currencySymbol}${budget.safeDailyLimit.toFixed(0)}/day safe limit`}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Low Balance Alert */}
        {metrics && (
          <LowBalanceAlert
            daysLeft={metrics.daysLeft}
            currentBalance={metrics.currentBalance}
            dailyBurnRate={metrics.dailyBurnRate}
            currencySymbol={currencySymbol}
            onScanNow={() => router.push("/scanner")}
          />
        )}

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
                            {r.source === "ocr" ? (
                              <Camera size={20} />
                            ) : (
                              <Keyboard size={20} />
                            )}
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
                                {currencySymbol}{" "}
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
              <FileText size={40} className="text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-sm mb-4">
                No recent readings. Log your first to see your history.
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

        {/* Tariff disclaimer */}
        {country.tariffEffective && (
          <div className="mx-2 mt-6 mb-2 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-start gap-2.5">
              <Info size={14} className="text-gray-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-gray-500 leading-relaxed">
                <span className="font-bold text-gray-400">Disclaimer:</span>{" "}
                Estimates based on <span className="font-bold text-gray-400">PURC {country.tariffEffective} rates</span> incl. levies.{" "}
                <span className="font-bold text-gray-400">Not an official billing tool.</span>{" "}
                For official billing, contact ECG/PDS.
              </p>
            </div>
          </div>
        )}
      </main>
      </PullToRefresh>

      {/* FAB System */}
      {fabOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-[fadeIn_200ms_ease-out]"
          onClick={() => setFabOpen(false)}
        />
      )}

      {fabOpen && (
        <div className="fixed right-5 z-50 flex flex-col items-end gap-4" style={{ bottom: "10rem" }}>
          {[
            { href: "/health", icon: Activity, label: "Health Check", color: "#EF4444" },
            { href: "/calculator", icon: Calculator, label: "Calculator", color: "#8B5CF6" },
            { href: "/topups", icon: Wallet, label: "Top-ups", color: "#10B981" },
            { href: "/report", icon: FileText, label: "Report", color: "#3B82F6" },
            { href: "/tips", icon: Lightbulb, label: "Tips", color: "#F59E0B" },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setFabOpen(false)}
                className="flex items-center gap-3 animate-[fabItem_350ms_cubic-bezier(0.34,1.56,0.64,1)_both]"
                style={{ animationDelay: `${(3 - i) * 80}ms` }}
              >
                <span className="text-white text-sm font-display font-semibold bg-[#1a1a2e]/90 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-xl border border-white/[0.08]">
                  {item.label}
                </span>
                <div
                  className="w-12 h-12 rounded-full shadow-xl flex items-center justify-center active:scale-90 transition-transform"
                  style={{ backgroundColor: item.color, boxShadow: `0 4px 15px ${item.color}50` }}
                >
                  <Icon size={20} className="text-white" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <button
        onClick={() => setFabOpen(!fabOpen)}
        className={`fixed z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center active:scale-90 ${fabOpen ? "animate-[fabButtonPop_250ms_ease-out_both]" : ""}`}
        style={{
          right: 20,
          bottom: "6rem",
          background: fabOpen ? "#EF4444" : "linear-gradient(135deg, #3B82F6, #8B5CF6)",
          boxShadow: fabOpen ? "0 4px 24px rgba(239,68,68,0.5)" : "0 4px 24px rgba(59,130,246,0.4)",
          transition: "background 200ms ease, box-shadow 200ms ease",
          transform: fabOpen ? "rotate(45deg)" : "rotate(0deg)",
        }}
      >
        {fabOpen ? <X size={24} className="text-white" /> : <Plus size={24} className="text-white" />}
      </button>

      <BottomNav active="dashboard" />
    </div>
  );
}
