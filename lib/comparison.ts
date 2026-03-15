import { MeterReading } from "./types";

export interface PeriodComparison {
  currentPeriodUsage: number;
  previousPeriodUsage: number;
  changePercent: number;
  currentPeriodLabel: string;
  previousPeriodLabel: string;
  currentPeriodCost: number;
  previousPeriodCost: number;
  hasSufficientData: boolean;
}

function calcUsageInRange(
  readings: MeterReading[],
  startMs: number,
  endMs: number
): { usage: number; count: number } {
  const sorted = readings
    .filter((r) => r.timestamp >= startMs && r.timestamp < endMs)
    .sort((a, b) => a.timestamp - b.timestamp);

  let usage = 0;
  for (let i = 1; i < sorted.length; i++) {
    usage += Math.abs(sorted[i].value - sorted[i - 1].value);
  }
  return { usage, count: sorted.length };
}

function formatShortDate(d: Date): string {
  return d.toLocaleDateString("en", { month: "short", day: "numeric" });
}

export function getWeeklyComparison(
  readings: MeterReading[],
  tariffRate: number
): PeriodComparison {
  const now = Date.now();
  const oneWeekMs = 7 * 24 * 60 * 60 * 1000;

  const thisWeekStart = now - oneWeekMs;
  const lastWeekStart = now - 2 * oneWeekMs;

  const current = calcUsageInRange(readings, thisWeekStart, now);
  const previous = calcUsageInRange(readings, lastWeekStart, thisWeekStart);

  const hasSufficientData = current.count >= 2 && previous.count >= 2;

  const changePercent =
    previous.usage > 0
      ? ((current.usage - previous.usage) / previous.usage) * 100
      : 0;

  const thisStart = new Date(thisWeekStart);
  const thisEnd = new Date(now);
  const prevStart = new Date(lastWeekStart);
  const prevEnd = new Date(thisWeekStart);

  return {
    currentPeriodUsage: current.usage,
    previousPeriodUsage: previous.usage,
    changePercent: hasSufficientData ? changePercent : 0,
    currentPeriodLabel: `${formatShortDate(thisStart)}\u2013${formatShortDate(thisEnd)}`,
    previousPeriodLabel: `${formatShortDate(prevStart)}\u2013${formatShortDate(prevEnd)}`,
    currentPeriodCost: current.usage * tariffRate,
    previousPeriodCost: previous.usage * tariffRate,
    hasSufficientData,
  };
}

export function getMonthlyComparison(
  readings: MeterReading[],
  tariffRate: number
): PeriodComparison {
  const now = new Date();

  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const thisMonthEnd = now.getTime();

  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
  const prevMonthEnd = thisMonthStart;

  const current = calcUsageInRange(readings, thisMonthStart, thisMonthEnd);
  const previous = calcUsageInRange(readings, prevMonthStart, prevMonthEnd);

  const hasSufficientData = current.count >= 2 && previous.count >= 2;

  const changePercent =
    previous.usage > 0
      ? ((current.usage - previous.usage) / previous.usage) * 100
      : 0;

  const thisMonthName = now.toLocaleDateString("en", { month: "long" });
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthName = prevMonth.toLocaleDateString("en", { month: "long" });

  return {
    currentPeriodUsage: current.usage,
    previousPeriodUsage: previous.usage,
    changePercent: hasSufficientData ? changePercent : 0,
    currentPeriodLabel: thisMonthName,
    previousPeriodLabel: prevMonthName,
    currentPeriodCost: current.usage * tariffRate,
    previousPeriodCost: previous.usage * tariffRate,
    hasSufficientData,
  };
}
