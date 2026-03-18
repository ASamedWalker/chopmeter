"use client";

import { TrendingDown, TrendingUp, Minus, Zap } from "lucide-react";
import type { WeeklyInsight } from "@/lib/types";

interface InsightsCardProps {
  insight: WeeklyInsight | null;
  currencySymbol: string;
  totalReadings: number;
}

export default function InsightsCard({
  insight,
  currencySymbol,
  totalReadings,
}: InsightsCardProps) {
  // Not enough data yet
  if (!insight) {
    const scansNeeded = Math.max(0, 4 - totalReadings);
    const progress = Math.min(100, (totalReadings / 4) * 100);

    return (
      <div className="glass-card p-5 mb-6 animate-fade-in-up">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={14} className="text-violet-400" />
          <span className="text-white text-xs font-bold uppercase tracking-wider">
            Weekly Insights
          </span>
        </div>
        <p className="text-gray-400 text-sm mb-3">
          Keep scanning to unlock weekly insights
        </p>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-gray-500 text-[10px]">
            {scansNeeded > 0
              ? `${scansNeeded} more scans needed`
              : "Almost there..."}
          </span>
        </div>
      </div>
    );
  }

  const TrendIcon =
    insight.changeDirection === "down"
      ? TrendingDown
      : insight.changeDirection === "up"
      ? TrendingUp
      : Minus;

  const trendColor =
    insight.changeDirection === "down"
      ? "text-emerald-400"
      : insight.changeDirection === "up"
      ? "text-red-400"
      : "text-gray-400";

  const trendBg =
    insight.changeDirection === "down"
      ? "bg-emerald-500/[0.08]"
      : insight.changeDirection === "up"
      ? "bg-red-500/[0.08]"
      : "bg-gray-500/[0.08]";

  const arrow = insight.changeDirection === "down" ? "↓" : insight.changeDirection === "up" ? "↑" : "→";

  return (
    <div className="glass-card p-5 mb-6 animate-fade-in-up">
      <div className="flex items-center gap-2 mb-4">
        <Zap size={14} className="text-violet-400" />
        <span className="text-white text-xs font-bold uppercase tracking-wider">
          Weekly Insights
        </span>
      </div>

      {/* Hero trend stat */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-10 h-10 rounded-xl ${trendBg} flex items-center justify-center`}
        >
          <TrendIcon size={20} className={trendColor} />
        </div>
        <div>
          <p className={`text-xl font-bold ${trendColor}`}>
            {arrow} {insight.changePercent}% this week
          </p>
          <p className="text-gray-400 text-xs">
            {currencySymbol}
            {insight.weekCost.toFixed(0)} used
            {insight.prevWeekCost > 0 && (
              <>
                {" · "}
                {insight.changeDirection === "down" ? (
                  <span className="text-emerald-400">
                    {currencySymbol}{insight.savingsAmount.toFixed(0)} saved
                  </span>
                ) : insight.changeDirection === "up" ? (
                  <span className="text-red-400">
                    {currencySymbol}
                    {(insight.weekCost - insight.prevWeekCost).toFixed(0)} more
                  </span>
                ) : (
                  "same as last week"
                )}
              </>
            )}
          </p>
        </div>
      </div>

      {/* Burn rate comparison */}
      {insight.burnRateComparison && (
        <div
          className={`text-xs py-2 px-3 rounded-lg ${
            insight.burnRateComparison.includes("faster")
              ? "bg-red-500/[0.06] text-red-400"
              : insight.burnRateComparison.includes("slower")
              ? "bg-emerald-500/[0.06] text-emerald-400"
              : "bg-white/[0.04] text-gray-400"
          }`}
        >
          {insight.burnRateComparison}
        </div>
      )}
    </div>
  );
}
