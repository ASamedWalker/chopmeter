import type { TopUp } from "./types";

export interface TopUpStats {
  totalSpent: number;
  totalUnits: number;
  averageAmount: number;
  topUpCount: number;
  averageFrequencyDays: number;
  thisMonthSpent: number;
  lastMonthSpent: number;
  monthlyChange: number;
  recentTopUps: TopUp[];
  monthlyTrend: { month: string; total: number }[];
}

export function getTopUpStats(topups: TopUp[]): TopUpStats {
  const sorted = [...topups].sort((a, b) => b.timestamp - a.timestamp);

  const totalSpent = sorted.reduce((sum, t) => sum + t.amount, 0);
  const totalUnits = sorted.reduce((sum, t) => sum + t.units, 0);
  const topUpCount = sorted.length;
  const averageAmount = topUpCount > 0 ? totalSpent / topUpCount : 0;

  // Average frequency in days between top-ups
  let averageFrequencyDays = 0;
  if (sorted.length >= 2) {
    const gaps: number[] = [];
    for (let i = 0; i < sorted.length - 1; i++) {
      const diffMs = sorted[i].timestamp - sorted[i + 1].timestamp;
      gaps.push(diffMs / (24 * 60 * 60 * 1000));
    }
    averageFrequencyDays =
      gaps.reduce((sum, g) => sum + g, 0) / gaps.length;
  }

  // This month and last month spending
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();

  const thisMonthSpent = sorted
    .filter((t) => t.timestamp >= thisMonthStart)
    .reduce((sum, t) => sum + t.amount, 0);

  const lastMonthSpent = sorted
    .filter((t) => t.timestamp >= lastMonthStart && t.timestamp < thisMonthStart)
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyChange =
    lastMonthSpent > 0
      ? ((thisMonthSpent - lastMonthSpent) / lastMonthSpent) * 100
      : 0;

  // Recent top-ups (last 10)
  const recentTopUps = sorted.slice(0, 10);

  // Monthly trend (last 6 months)
  const monthlyTrend: { month: string; total: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStart = d.getTime();
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime();
    const total = sorted
      .filter((t) => t.timestamp >= monthStart && t.timestamp < monthEnd)
      .reduce((sum, t) => sum + t.amount, 0);
    const month = d.toLocaleDateString("en", { month: "short" });
    monthlyTrend.push({ month, total });
  }

  return {
    totalSpent,
    totalUnits,
    averageAmount,
    topUpCount,
    averageFrequencyDays,
    thisMonthSpent,
    lastMonthSpent,
    monthlyChange,
    recentTopUps,
    monthlyTrend,
  };
}
