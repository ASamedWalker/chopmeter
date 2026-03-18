import type { MeterReading, WeeklyInsight } from "./types";
import { getCountry, getEffectiveRate, getDailyServiceCharge } from "./countries";

// ─── Helpers ─────────────────────────────────────────────────

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function daysAgo(n: number): number {
  return startOfDay(Date.now()) - n * 86400000;
}

/**
 * Get daily usage from readings for a date range.
 * Returns array of { date, usage } sorted oldest → newest.
 */
function getDailyUsage(
  readings: MeterReading[],
  fromTs: number,
  toTs: number
): { date: string; usage: number }[] {
  const sorted = [...readings]
    .filter((r) => r.timestamp >= fromTs && r.timestamp <= toTs)
    .sort((a, b) => a.timestamp - b.timestamp);

  if (sorted.length < 2) return [];

  const dailyMap = new Map<string, number>();

  for (let i = 1; i < sorted.length; i++) {
    const diff = sorted[i].value - sorted[i - 1].value;
    if (diff < 0) continue; // skip resets
    const day = new Date(sorted[i].timestamp).toISOString().slice(0, 10);
    dailyMap.set(day, (dailyMap.get(day) || 0) + diff);
  }

  return Array.from(dailyMap.entries())
    .map(([date, usage]) => ({ date, usage }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// ─── Public API ──────────────────────────────────────────────

/**
 * Compute weekly insight comparing this week vs last week.
 */
export function getWeeklyInsight(
  readings: MeterReading[],
  countryCode: string,
  tariffRate: number
): WeeklyInsight | null {
  const now = Date.now();
  const thisWeekStart = daysAgo(7);
  const lastWeekStart = daysAgo(14);

  const thisWeek = getDailyUsage(readings, thisWeekStart, now);
  const lastWeek = getDailyUsage(readings, lastWeekStart, thisWeekStart);

  if (thisWeek.length < 2) return null;

  const thisUsage = thisWeek.reduce((s, d) => s + d.usage, 0);
  const lastUsage = lastWeek.reduce((s, d) => s + d.usage, 0);

  const country = getCountry(countryCode);
  const rate = country.tariffTiers ? getEffectiveRate(thisUsage, country) : tariffRate;
  const serviceDaily = getDailyServiceCharge(country);

  const thisWeekCost = thisUsage * rate + serviceDaily * thisWeek.length;
  const lastWeekCost =
    lastWeek.length > 0
      ? lastUsage * rate + serviceDaily * lastWeek.length
      : 0;

  let changePercent = 0;
  let changeDirection: "up" | "down" | "flat" = "flat";

  if (lastWeekCost > 0) {
    changePercent = Math.abs(
      ((thisWeekCost - lastWeekCost) / lastWeekCost) * 100
    );
    if (thisWeekCost < lastWeekCost * 0.98) changeDirection = "down";
    else if (thisWeekCost > lastWeekCost * 1.02) changeDirection = "up";
  }

  const savingsAmount =
    changeDirection === "down" ? lastWeekCost - thisWeekCost : 0;

  // Burn rate comparison
  let burnRateComparison = "";
  if (lastWeek.length >= 2 && thisWeek.length >= 2) {
    const lastAvgDaily = lastUsage / lastWeek.length;
    const thisAvgDaily = thisUsage / thisWeek.length;
    if (lastAvgDaily > 0) {
      const burnChange = ((thisAvgDaily - lastAvgDaily) / lastAvgDaily) * 100;
      if (burnChange > 10) {
        burnRateComparison = `Depleting ${Math.round(burnChange)}% faster than last week`;
      } else if (burnChange < -10) {
        burnRateComparison = `Depleting ${Math.round(Math.abs(burnChange))}% slower — nice!`;
      } else {
        burnRateComparison = "Credit depleting at a steady rate";
      }
    }
  }

  return {
    weekUsage: thisUsage,
    weekCost: thisWeekCost,
    prevWeekCost: lastWeekCost,
    changePercent: Math.round(changePercent),
    changeDirection,
    savingsAmount,
    daysTracked: thisWeek.length,
    burnRateComparison,
  };
}

/**
 * Get today vs yesterday comparison.
 */
export function getDailyComparison(
  readings: MeterReading[]
): {
  todayUsage: number;
  yesterdayUsage: number;
  changePercent: number;
  direction: "up" | "down" | "flat";
} | null {
  const today = getDailyUsage(readings, daysAgo(1), Date.now());
  const yesterday = getDailyUsage(readings, daysAgo(2), daysAgo(1));

  const todayUsage = today.reduce((s, d) => s + d.usage, 0);
  const yesterdayUsage = yesterday.reduce((s, d) => s + d.usage, 0);

  if (todayUsage === 0 && yesterdayUsage === 0) return null;

  let changePercent = 0;
  let direction: "up" | "down" | "flat" = "flat";

  if (yesterdayUsage > 0) {
    changePercent = Math.abs(
      ((todayUsage - yesterdayUsage) / yesterdayUsage) * 100
    );
    if (todayUsage < yesterdayUsage * 0.9) direction = "down";
    else if (todayUsage > yesterdayUsage * 1.1) direction = "up";
  }

  return { todayUsage, yesterdayUsage, changePercent: Math.round(changePercent), direction };
}
