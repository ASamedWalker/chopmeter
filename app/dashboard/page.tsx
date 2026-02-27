"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllReadings, getSettings, getRecentReadings } from "@/lib/storage";
import type { MeterReading, UserSettings } from "@/lib/types";
import BottomNav from "@/components/BottomNav";
import WhatsAppButton from "@/components/WhatsAppButton";

function computeMetrics(readings: MeterReading[], settings: UserSettings) {
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
  const dailyKwh = weeklyUsage / daysWithData;
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
    dailyBurnRate > 0 ? Math.round(currentBalance / dailyBurnRate) : 999;

  return {
    currentBalance,
    dailyBurnRate,
    daysLeft,
    lastReading,
    todayUsage,
    weeklyUsage,
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<ReturnType<
    typeof computeMetrics
  > | null>(null);
  const [recentReadings, setRecentReadings] = useState<MeterReading[]>([]);

  useEffect(() => {
    const settings = getSettings();
    if (!settings.onboardingComplete) {
      router.replace("/onboarding");
      return;
    }
    const readings = getAllReadings();
    const m = computeMetrics(readings, settings);
    setMetrics(m);
    setRecentReadings(getRecentReadings(7).slice(0, 5));
  }, [router]);

  if (!metrics) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-bg-dark">
        <span className="material-symbols-outlined text-primary text-5xl animate-pulse">
          electric_bolt
        </span>
      </div>
    );
  }

  return (
    <div className="flex h-full grow flex-col bg-bg-dark font-display min-h-screen text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-bg-dark/95 backdrop-blur-md border-b border-surface-border px-4 py-3">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-full bg-primary/20 text-primary">
              <span className="material-symbols-outlined">electric_bolt</span>
            </div>
            <h2 className="text-white text-xl font-extrabold tracking-tight">
              ChopMeter
            </h2>
          </div>
          <button
            onClick={() => router.push("/scanner")}
            className="flex items-center justify-center size-10 rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
          >
            <span className="material-symbols-outlined">qr_code_scanner</span>
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 pb-24">
        {/* Hero Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Main Balance Card */}
          <div className="md:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface-dark to-bg-dark border border-surface-border p-6 shadow-xl">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="material-symbols-outlined text-8xl text-primary">
                account_balance_wallet
              </span>
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">
                  Estimated Balance
                </p>
                <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-2">
                  <span className="text-xl font-bold text-slate-400 align-top mt-1 inline-block">
                    GHS
                  </span>{" "}
                  {metrics.currentBalance.toFixed(2)}
                </h1>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => router.push("/scanner")}
                  className="flex-1 bg-primary hover:brightness-110 text-bg-dark font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
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
            <div className="flex-1 rounded-2xl bg-surface-dark border border-surface-border p-5 flex flex-col justify-center relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 size-28 bg-primary/10 rounded-full blur-2xl" />
              <div className="flex items-center justify-between mb-3">
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                  Est. Runway
                </p>
                <span className="material-symbols-outlined text-primary text-xl">
                  timelapse
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-white">
                  ~{metrics.daysLeft}
                </h3>
                <span className="text-lg text-slate-400 font-medium">Days</span>
              </div>
              <div className="w-full bg-bg-dark rounded-full h-2 mt-3">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{
                    width: `${Math.min(100, (metrics.daysLeft / 30) * 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="flex-1 rounded-2xl bg-surface-dark border border-surface-border p-5 flex flex-col justify-center">
              <div className="flex items-center justify-between mb-2">
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                  Daily Avg
                </p>
                <span className="material-symbols-outlined text-primary text-xl">
                  monitoring
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white">
                GHS {metrics.dailyBurnRate.toFixed(2)}
              </h3>
              <p className="text-xs text-slate-400 mt-1">Per day estimated</p>
            </div>
          </div>
        </div>

        {/* Recent Readings */}
        <div>
          <h2 className="text-white text-lg font-bold mb-3">Recent Readings</h2>
          {recentReadings.length > 0 ? (
            <div className="space-y-2">
              {recentReadings.map((r) => (
                <div
                  key={r.id}
                  className="bg-surface-dark border border-surface-border rounded-xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-surface-border flex items-center justify-center text-slate-300">
                      <span className="material-symbols-outlined">
                        {r.source === "ocr" ? "photo_camera" : "keyboard"}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">
                        {r.value.toFixed(1)} kWh
                      </p>
                      <p className="text-slate-400 text-xs">
                        {new Date(r.timestamp).toLocaleDateString("en-GH", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                      r.source === "ocr"
                        ? "bg-primary/10 text-primary"
                        : "bg-slate-700 text-slate-300"
                    }`}
                  >
                    {r.source}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-surface-dark border border-surface-border rounded-xl p-8 text-center">
              <span className="material-symbols-outlined text-slate-600 text-4xl mb-3 block">
                electric_meter
              </span>
              <p className="text-slate-400 text-sm mb-4">
                No readings yet. Scan your meter to get started!
              </p>
              <button
                onClick={() => router.push("/scanner")}
                className="bg-primary text-bg-dark font-bold py-2 px-6 rounded-xl text-sm hover:brightness-110 transition-all"
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
