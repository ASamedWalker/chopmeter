"use client";

import type { MeterReading } from "@/lib/types";

interface DailyUsage {
  label: string;
  shortLabel: string;
  kWh: number;
  cost: number;
}

interface UsageChartProps {
  readings: MeterReading[];
  tariffRate: number;
  currencySymbol: string;
}

function getDailyUsage(
  readings: MeterReading[],
  tariffRate: number,
  days: number = 7
): DailyUsage[] {
  const sorted = [...readings].sort((a, b) => a.timestamp - b.timestamp);
  const now = new Date();
  const result: DailyUsage[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const dayReadings = sorted.filter(
      (r) => r.timestamp >= date.getTime() && r.timestamp < nextDay.getTime()
    );

    let kWh = 0;
    for (let j = 0; j < dayReadings.length - 1; j++) {
      kWh += Math.abs(dayReadings[j + 1].value - dayReadings[j].value);
    }

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const isToday = i === 0;

    result.push({
      label: isToday
        ? "Today"
        : dayNames[date.getDay()],
      shortLabel: isToday
        ? "Today"
        : dayNames[date.getDay()],
      kWh: Math.round(kWh * 10) / 10,
      cost: Math.round(kWh * tariffRate * 100) / 100,
    });
  }

  return result;
}

const BAR_COLORS = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-blue-500",
];

export default function UsageChart({
  readings,
  tariffRate,
  currencySymbol,
}: UsageChartProps) {
  const daily = getDailyUsage(readings, tariffRate);
  const maxKwh = Math.max(...daily.map((d) => d.kWh), 0.1);
  const totalWeek = daily.reduce((sum, d) => sum + d.kWh, 0);
  const avgDaily = totalWeek / 7;

  // Compare this week vs last reading trend
  const todayUsage = daily[daily.length - 1]?.kWh ?? 0;
  const yesterdayUsage = daily[daily.length - 2]?.kWh ?? 0;
  const trend =
    yesterdayUsage > 0
      ? Math.round(((todayUsage - yesterdayUsage) / yesterdayUsage) * 100)
      : 0;

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-white text-base font-bold">Usage</h3>
        <div className="flex items-center gap-2">
          {trend !== 0 && todayUsage > 0 && (
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                trend > 0
                  ? "bg-red-500/10 text-red-400"
                  : "bg-green-500/10 text-green-400"
              }`}
            >
              {trend > 0 ? "+" : ""}
              {trend}%
            </span>
          )}
          <span className="text-xs text-gray-500 bg-white/[0.03] px-2 py-0.5 rounded-full border border-white/[0.06]">7 days</span>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="flex items-end gap-2.5 h-36 mb-3">
        {daily.map((day, i) => {
          const heightPct = maxKwh > 0 ? (day.kWh / maxKwh) * 100 : 0;
          const isToday = i === daily.length - 1;

          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center gap-1.5"
            >
              {/* Value on top */}
              {day.kWh > 0 && (
                <span className="text-[10px] text-gray-400 font-medium">
                  {day.kWh}
                </span>
              )}
              {/* Bar */}
              <div className="w-full flex-1 flex items-end">
                <div
                  className={`w-full rounded-lg transition-all duration-500 ${
                    isToday
                      ? "bg-gradient-to-t from-blue-500 to-violet-500 shadow-lg shadow-blue-500/20"
                      : BAR_COLORS[i % BAR_COLORS.length] + " opacity-70"
                  }`}
                  style={{
                    height: `${Math.max(heightPct, day.kWh > 0 ? 8 : 2)}%`,
                  }}
                />
              </div>
              {/* Label */}
              <span
                className={`text-[10px] font-semibold ${
                  isToday ? "text-blue-400" : "text-gray-500"
                }`}
              >
                {day.shortLabel}
              </span>
            </div>
          );
        })}
      </div>

      {/* Average line */}
      <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
        <div>
          <p className="text-gray-500 text-[10px] uppercase tracking-wider">
            Daily Average
          </p>
          <p className="text-white text-sm font-bold">
            {avgDaily.toFixed(1)} kWh
            <span className="text-gray-500 font-normal">
              {" "}
              / {currencySymbol}
              {(avgDaily * tariffRate).toFixed(2)}
            </span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-gray-500 text-[10px] uppercase tracking-wider">
            This Week
          </p>
          <p className="text-white text-sm font-bold">
            {totalWeek.toFixed(1)} kWh
          </p>
        </div>
      </div>
    </div>
  );
}
