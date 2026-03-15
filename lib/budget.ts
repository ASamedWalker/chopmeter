import type { MeterReading } from "./types";

export interface BudgetStatus {
  budget: number;
  spent: number;
  percentage: number;
  daysElapsed: number;
  daysLeft: number;
  dailyAverage: number;
  safeDailyLimit: number;
  status: "on_track" | "warning" | "danger" | "over";
}

/**
 * Calculate budget tracking status for the current calendar month.
 * Returns null if budget is 0 or not set.
 */
export function getBudgetStatus(
  readings: MeterReading[],
  tariffRate: number,
  monthlyBudget: number
): BudgetStatus | null {
  if (monthlyBudget <= 0) return null;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // Start and end of current month
  const monthStart = new Date(year, month, 1).getTime();
  const monthEnd = new Date(year, month + 1, 0).getDate(); // total days in month

  // Days elapsed (at least 1 to avoid division by zero)
  const dayOfMonth = now.getDate();
  const daysElapsed = Math.max(1, dayOfMonth);
  const daysLeft = Math.max(0, monthEnd - dayOfMonth);

  // Filter readings in current month and sort chronologically
  const monthReadings = readings
    .filter((r) => r.timestamp >= monthStart && r.timestamp <= now.getTime())
    .sort((a, b) => a.timestamp - b.timestamp);

  // Calculate total kWh used this month from consecutive reading differences
  let totalKwh = 0;
  for (let i = 1; i < monthReadings.length; i++) {
    totalKwh += Math.abs(monthReadings[i].value - monthReadings[i - 1].value);
  }

  const spent = totalKwh * tariffRate;
  const percentage = Math.min((spent / monthlyBudget) * 100, 999); // cap display
  const dailyAverage = spent / daysElapsed;
  const safeDailyLimit =
    daysLeft > 0 ? Math.max(0, (monthlyBudget - spent) / daysLeft) : 0;

  let status: BudgetStatus["status"];
  if (percentage > 100) {
    status = "over";
  } else if (percentage > 90) {
    status = "danger";
  } else if (percentage > 75) {
    status = "warning";
  } else {
    status = "on_track";
  }

  return {
    budget: monthlyBudget,
    spent,
    percentage,
    daysElapsed,
    daysLeft,
    dailyAverage,
    safeDailyLimit,
    status,
  };
}
