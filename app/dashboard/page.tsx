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
  getMeters,
  getDefaultMeter,
  setDefaultMeter,
} from "@/lib/storage";
import {
  checkLowBalanceNotification,
  checkDailyReminder,
  checkWeeklyReport,
} from "@/lib/notifications";
import type { MeterReading, UserSettings, DashboardMetrics, WeatherCache, Meter } from "@/lib/types";
import { getCountry } from "@/lib/countries";
import { getGreeting } from "@/lib/greeting";
import { getWeeklyComparison, getMonthlyComparison } from "@/lib/comparison";
import { getBudgetStatus } from "@/lib/budget";
import type { BudgetStatus } from "@/lib/budget";
import type { PeriodComparison } from "@/lib/comparison";
import { fetchWeather, decodeWeatherCode } from "@/lib/weather";
import BottomNav from "@/components/BottomNav";
import PullToRefresh from "@/components/PullToRefresh";
import UsageChart from "@/components/UsageChart";
import LowBalanceAlert from "@/components/LowBalanceAlert";
import MeterSwitcher from "@/components/MeterSwitcher";

import Link from "next/link";
import {
  ScanLine,
  Wallet,
  ChevronDown,
  Timer,
  TrendingUp,
  TrendingDown,
  ArrowDownRight,
  ArrowUpRight,
  Camera,
  Keyboard,
  Gauge,
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  Snowflake,
  CloudLightning,
  Calculator,
  ChevronRight,
  Target,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const WEATHER_ICON_MAP: Record<string, LucideIcon> = {
  Sun, CloudSun, Cloud, CloudFog, CloudDrizzle, CloudRain, Snowflake, CloudLightning,
};

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
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Multi-meter state
  const [meters, setMetersState] = useState<Meter[]>([]);
  const [activeMeter, setActiveMeter] = useState<Meter | null>(null);

  const loadData = useCallback((meterId?: string) => {
    const s = getSettings();
    if (!s.onboardingComplete) {
      router.replace("/onboarding");
      return;
    }
    setSettingsState(s);

    // Load meters
    const allMeters = getMeters();
    setMetersState(allMeters);
    const currentMeter = meterId
      ? allMeters.find((m) => m.id === meterId) ?? getDefaultMeter()
      : getDefaultMeter();
    setActiveMeter(currentMeter);

    const mid = currentMeter?.id;
    const readings = getAllReadings(mid);
    setAllReadings(readings);
    setMetrics(computeMetrics(readings, s));
    setRecentReadings(getRecentReadings(7, mid).slice(0, 10));
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
  }, [metrics, settings]);

  const handleSwitchMeter = (meter: Meter) => {
    setDefaultMeter(meter.id);
    setActiveMeter(meter);
    loadData(meter.id);
  };

  const handleDeleteReading = (id: string) => {
    deleteReading(id, activeMeter?.id);
    setDeletingReading(null);
    setExpandedReading(null);
    loadData(activeMeter?.id);
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
        <header className="sticky top-0 z-10 bg-[#0A0E1A] border-b border-white/[0.06] px-4 py-3">
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
          </div>
        </main>
        <BottomNav active="dashboard" />
      </div>
    );
  }

  const country = getCountry(settings.countryCode);
  const hasData = recentReadings.length > 0;

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
      <PullToRefresh onRefresh={() => loadData(activeMeter?.id)}>
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 pt-6 pb-24">
        {/* Greeting + Weather Row */}
        <div className="flex items-start justify-between mb-4 animate-fade-in-up">
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

        {/* Meter Switcher */}
        {activeMeter && (
          <MeterSwitcher
            meters={meters}
            activeMeter={activeMeter}
            onSwitch={handleSwitchMeter}
            onAddNew={() => router.push("/settings?addMeter=1")}
          />
        )}

        {/* Hero Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Main Balance Card */}
          <div
            onClick={() => toggleCard("balance")}
            className="md:col-span-2 relative overflow-hidden glass-card gradient-hero p-6 shadow-xl cursor-pointer active:scale-[0.98] transition-transform"
          >
            <div className="absolute top-0 right-0 p-4 opacity-[0.07]">
              <Wallet size={96} className="text-blue-400" />
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">
                    Estimated Balance
                  </p>
                  <ChevronDown
                    size={18}
                    className={`text-gray-500 transition-transform ${
                      expandedCard === "balance" ? "rotate-180" : ""
                    }`}
                  />
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

                  {/* Quick balance update */}
                  <div className="pt-2 border-t border-white/[0.06]">
                    <label className="flex items-center gap-1.5 text-gray-400 text-xs uppercase tracking-wider mb-1.5">
                      <Wallet size={12} />
                      Update Balance
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-bold">
                          {country.currencySymbol}
                        </span>
                        <input
                          type="number"
                          inputMode="decimal"
                          value={balanceInput}
                          onChange={(e) => {
                            setBalanceInput(e.target.value);
                            setBalanceSaved(false);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="e.g. 500.00"
                          className="w-full h-10 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white text-sm font-bold pl-10 pr-3 placeholder:text-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const val = parseFloat(balanceInput);
                          if (isNaN(val) || val <= 0) return;
                          saveSettings({
                            lastBalance: val,
                            lastBalanceDate: Date.now(),
                          });
                          setBalanceSaved(true);
                          loadData(activeMeter?.id);
                        }}
                        className="h-10 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 text-white text-sm font-bold hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-[0.95]"
                      >
                        {balanceSaved ? "Saved!" : "Save"}
                      </button>
                    </div>
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
                  <ScanLine size={20} />
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
                <Timer size={20} className="text-blue-400" />
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
                  <div className="flex justify-between">
                    <span>Burn rate</span>
                    <span className="text-gray-200">
                      {country.currencySymbol}
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

            {/* Daily Avg Card */}
            <div
              onClick={() => toggleCard("daily")}
              className="flex-1 glass-card p-5 flex flex-col justify-center cursor-pointer active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">
                  Daily Avg
                </p>
                <TrendingUp size={20} className="text-blue-400" />
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

        {/* Low Balance Alert */}
        {metrics && (
          <LowBalanceAlert
            daysLeft={metrics.daysLeft}
            currentBalance={metrics.currentBalance}
            dailyBurnRate={metrics.dailyBurnRate}
            currencySymbol={country.currencySymbol}
            onScanNow={() => router.push("/scanner")}
          />
        )}

        {/* Budget Progress */}
        {(() => {
          const budgetStatus = getBudgetStatus(
            allReadings,
            settings.tariffRate,
            settings.monthlyBudget
          );
          if (!budgetStatus) {
            // No budget set — show subtle link
            return (
              <Link
                href="/settings"
                className="glass-card p-4 mb-6 animate-fade-in-up flex items-center gap-3 active:scale-[0.98] transition-transform"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-display font-semibold text-sm">Set a Monthly Budget</p>
                  <p className="text-gray-500 text-xs font-display">Track your electricity spending target</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </Link>
            );
          }

          const statusConfig = {
            on_track: {
              icon: CheckCircle,
              label: "On track",
              color: "text-emerald-400",
              barColor: "from-blue-500 to-violet-500",
            },
            warning: {
              icon: AlertTriangle,
              label: "Watch spending",
              color: "text-yellow-400",
              barColor: "from-yellow-400 to-orange-500",
            },
            danger: {
              icon: AlertCircle,
              label: "Over budget risk",
              color: "text-red-400",
              barColor: "from-orange-500 to-red-500",
            },
            over: {
              icon: XCircle,
              label: "Over budget!",
              color: "text-red-500",
              barColor: "from-red-500 to-red-600",
            },
          };

          const cfg = statusConfig[budgetStatus.status];
          const StatusIcon = cfg.icon;

          return (
            <div className="glass-card p-5 mb-6 animate-fade-in-up">
              <div className="flex items-center gap-2 mb-4">
                <Target size={20} className="text-blue-400" />
                <h2 className="text-white text-lg font-bold">Monthly Budget</h2>
              </div>

              {/* Spent / Budget */}
              <div className="flex items-baseline justify-between mb-2">
                <p className="text-white font-bold text-lg">
                  <span className="text-gray-500 text-sm">{country.currencySymbol}</span>{" "}
                  {budgetStatus.spent.toFixed(2)}
                  <span className="text-gray-500 text-sm font-medium">
                    {" "}/ {country.currencySymbol} {budgetStatus.budget.toFixed(2)}
                  </span>
                </p>
                <span className="text-gray-400 text-sm font-bold">
                  {budgetStatus.percentage.toFixed(0)}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-white/[0.06] mb-4">
                <div
                  className={`h-2 rounded-full bg-gradient-to-r ${cfg.barColor} transition-all duration-500`}
                  style={{
                    width: `${Math.min(100, budgetStatus.percentage)}%`,
                  }}
                />
              </div>

              {/* Status + details */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <StatusIcon size={16} className={cfg.color} />
                  <span className={`text-sm font-semibold ${cfg.color}`}>
                    {cfg.label}
                  </span>
                  <span className="text-gray-600 text-sm">·</span>
                  <span className="text-gray-400 text-sm">
                    {budgetStatus.daysLeft} day{budgetStatus.daysLeft !== 1 ? "s" : ""} left
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2.5">
                    <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold mb-0.5">
                      Daily Average
                    </p>
                    <p className="text-white text-sm font-bold">
                      {country.currencySymbol} {budgetStatus.dailyAverage.toFixed(2)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2.5">
                    <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold mb-0.5">
                      Safe Daily Limit
                    </p>
                    <p className={`text-sm font-bold ${budgetStatus.safeDailyLimit > 0 ? "text-white" : "text-red-400"}`}>
                      {country.currencySymbol} {budgetStatus.safeDailyLimit.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Quick Tools */}
        <div className="space-y-2 mb-6 animate-fade-in-up">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Quick Tools</p>
          <div className="glass-card p-4">
            <Link href="/calculator" className="flex items-center gap-3 active:scale-[0.98] transition-transform">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <Calculator className="w-5 h-5 text-violet-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-display font-semibold text-sm">Appliance Calculator</p>
                <p className="text-gray-500 text-xs font-display">See which appliances cost you the most</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </Link>
          </div>
          <div className="glass-card p-4">
            <Link href="/topups" className="flex items-center gap-3 active:scale-[0.98] transition-transform">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-display font-semibold text-sm">Top-up History</p>
                <p className="text-gray-500 text-xs font-display">Track your recharges &amp; spending</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </Link>
          </div>
        </div>

        {/* Usage Comparison */}
        {(() => {
          const weekly = getWeeklyComparison(allReadings, settings.tariffRate);
          const monthly = getMonthlyComparison(allReadings, settings.tariffRate);

          function ComparisonRow({ comparison, periodType }: { comparison: PeriodComparison; periodType: string }) {
            if (!comparison.hasSufficientData) {
              return (
                <div className="glass-card p-4 text-center">
                  <p className="text-gray-500 text-sm">Need more readings to compare {periodType.toLowerCase()} usage</p>
                </div>
              );
            }

            const decreased = comparison.changePercent < 0;
            const noChange = comparison.changePercent === 0;
            const absPercent = Math.abs(comparison.changePercent).toFixed(1);

            return (
              <div>
                <div className="grid grid-cols-2 gap-3 mb-2">
                  {/* Current period */}
                  <div className="rounded-xl bg-white/[0.06] border border-blue-500/20 p-3">
                    <p className="text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
                      {comparison.currentPeriodLabel}
                    </p>
                    <p className="text-white text-xl font-bold">
                      {comparison.currentPeriodUsage.toFixed(1)} <span className="text-sm text-gray-400 font-medium">kWh</span>
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      {country.currencySymbol} {comparison.currentPeriodCost.toFixed(2)}
                    </p>
                  </div>
                  {/* Previous period */}
                  <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                    <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">
                      {comparison.previousPeriodLabel}
                    </p>
                    <p className="text-gray-300 text-xl font-bold">
                      {comparison.previousPeriodUsage.toFixed(1)} <span className="text-sm text-gray-500 font-medium">kWh</span>
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      {country.currencySymbol} {comparison.previousPeriodCost.toFixed(2)}
                    </p>
                  </div>
                </div>
                {/* Change indicator */}
                <div className="flex items-center justify-center gap-1.5 py-1">
                  {noChange ? (
                    <span className="text-gray-500 text-sm font-medium">No change</span>
                  ) : decreased ? (
                    <>
                      <ArrowDownRight size={16} className="text-emerald-400" />
                      <span className="text-emerald-400 text-sm font-bold">
                        {absPercent}% less than last {periodType.toLowerCase()}
                      </span>
                    </>
                  ) : (
                    <>
                      <ArrowUpRight size={16} className="text-orange-400" />
                      <span className="text-orange-400 text-sm font-bold">
                        {absPercent}% more than last {periodType.toLowerCase()}
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          }

          return (
            <div className="glass-card p-5 mb-6 animate-fade-in-up">
              <div className="flex items-center gap-2 mb-4">
                {weekly.hasSufficientData && weekly.changePercent <= 0 ? (
                  <TrendingDown size={20} className="text-emerald-400" />
                ) : (
                  <TrendingUp size={20} className="text-orange-400" />
                )}
                <h2 className="text-white text-lg font-bold">Usage Comparison</h2>
              </div>

              <div className="space-y-5">
                <div>
                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Weekly</p>
                  <ComparisonRow comparison={weekly} periodType="Week" />
                </div>
                <div className="border-t border-white/[0.06] pt-5">
                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Monthly</p>
                  <ComparisonRow comparison={monthly} periodType="Month" />
                </div>
              </div>
            </div>
          );
        })()}

        {/* Usage Chart */}
        {allReadings.length > 1 && (
          <UsageChart
            readings={allReadings}
            tariffRate={settings.tariffRate}
            currencySymbol={country.currencySymbol}
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
              <Gauge size={40} className="text-gray-600 mx-auto mb-3" />
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
      </PullToRefresh>

      <BottomNav active="dashboard" />
    </div>
  );
}
