import type { MeterReading, TopUp } from "./types";
import type { Appliance } from "./appliances";

export interface ApplianceSelection {
  applianceId: string;
  hours: number;
  quantity: number;
}

export interface HealthCheckResult {
  // Expected (from appliance selections)
  expectedDailyKwh: number;
  expectedDailyCost: number;
  expectedMonthlyKwh: number;
  expectedMonthlyCost: number;

  // Actual (from meter readings)
  actualDailyKwh: number;
  actualDailyCost: number;
  actualMonthlyKwh: number;
  actualMonthlyCost: number;

  // Comparison
  discrepancyPercent: number;
  discrepancyKwh: number;
  discrepancyCost: number;

  // Top-up drain rate
  avgTopUpLifeDays: number | null;
  expectedTopUpLifeDays: number | null;

  // Verdict
  status: "healthy" | "watch" | "suspicious" | "alert";
  statusMessage: string;
  recommendation: string;

  // Data quality
  hasEnoughReadings: boolean;
  hasAppliances: boolean;
  readingDaysSpan: number;
}

export function runHealthCheck(options: {
  readings: MeterReading[];
  topups: TopUp[];
  applianceSelections: ApplianceSelection[];
  appliances: Appliance[];
  tariffRate: number;
  lastBalance: number;
}): HealthCheckResult {
  const { readings, topups, applianceSelections, appliances, tariffRate } = options;

  // --- Expected usage from appliance selections ---
  let expectedDailyKwh = 0;
  for (const sel of applianceSelections) {
    const appliance = appliances.find((a) => a.id === sel.applianceId);
    if (appliance) {
      expectedDailyKwh += (appliance.wattage * sel.hours * sel.quantity) / 1000;
    }
  }
  const expectedDailyCost = expectedDailyKwh * tariffRate;
  const expectedMonthlyKwh = expectedDailyKwh * 30;
  const expectedMonthlyCost = expectedDailyCost * 30;

  const hasAppliances = applianceSelections.length > 0 && expectedDailyKwh > 0;

  // --- Actual usage from meter readings ---
  const sorted = [...readings].sort((a, b) => a.timestamp - b.timestamp);
  const hasEnoughReadings = sorted.length >= 3;

  let readingDaysSpan = 0;
  let actualDailyKwh = 0;

  if (sorted.length >= 2) {
    const firstTs = sorted[0].timestamp;
    const lastTs = sorted[sorted.length - 1].timestamp;
    readingDaysSpan = (lastTs - firstTs) / (24 * 60 * 60 * 1000);

    const totalKwh = Math.abs(sorted[sorted.length - 1].value - sorted[0].value);
    actualDailyKwh = readingDaysSpan > 0 ? totalKwh / readingDaysSpan : 0;
  }

  const actualDailyCost = actualDailyKwh * tariffRate;
  const actualMonthlyKwh = actualDailyKwh * 30;
  const actualMonthlyCost = actualDailyCost * 30;

  // --- Discrepancy ---
  let discrepancyPercent = 0;
  let discrepancyKwh = 0;
  let discrepancyCost = 0;

  if (expectedDailyKwh > 0) {
    discrepancyPercent = ((actualDailyKwh - expectedDailyKwh) / expectedDailyKwh) * 100;
    discrepancyKwh = actualDailyKwh - expectedDailyKwh;
    discrepancyCost = discrepancyKwh * tariffRate;
  }

  // --- Top-up drain rate ---
  let avgTopUpLifeDays: number | null = null;
  let expectedTopUpLifeDays: number | null = null;

  const sortedTopups = [...topups].sort((a, b) => a.timestamp - b.timestamp);
  if (sortedTopups.length >= 2) {
    let totalDaysBetween = 0;
    let intervals = 0;
    for (let i = 1; i < sortedTopups.length; i++) {
      const daysBetween =
        (sortedTopups[i].timestamp - sortedTopups[i - 1].timestamp) / (24 * 60 * 60 * 1000);
      if (daysBetween > 0) {
        totalDaysBetween += daysBetween;
        intervals++;
      }
    }
    if (intervals > 0) {
      avgTopUpLifeDays = totalDaysBetween / intervals;
    }
  }

  if (sortedTopups.length > 0 && expectedDailyCost > 0) {
    const avgTopUpAmount =
      sortedTopups.reduce((sum, t) => sum + t.amount, 0) / sortedTopups.length;
    expectedTopUpLifeDays = avgTopUpAmount / expectedDailyCost;
  }

  // --- Verdict ---
  const absDiscrepancy = Math.abs(discrepancyPercent);
  let status: HealthCheckResult["status"];
  let statusMessage: string;
  let recommendation: string;

  if (!hasAppliances || !hasEnoughReadings || readingDaysSpan < 1) {
    status = "healthy";
    statusMessage = "Not enough data to determine meter health";
    recommendation = "Add your appliances and take at least 3 meter readings over several days";
  } else if (absDiscrepancy < 15 || discrepancyPercent < 0) {
    status = "healthy";
    statusMessage = "Your meter appears to be reading correctly";
    recommendation =
      "Keep tracking your usage to maintain confidence in your meter readings. Normal variance is expected.";
  } else if (absDiscrepancy < 30) {
    status = "watch";
    statusMessage = "Your usage is slightly higher than expected";
    recommendation =
      "Check for appliances you may have missed in your selection. Consider standby power from devices left plugged in. Monitor for a few more days.";
  } else if (absDiscrepancy < 50) {
    status = "suspicious";
    statusMessage = "Your meter may be over-reporting consumption";
    recommendation =
      "Document your readings daily and take photos of your meter. Contact ECG if this pattern persists over a week. Keep records of all top-ups.";
  } else {
    status = "alert";
    statusMessage = "Significant discrepancy detected in your meter readings";
    recommendation =
      "We recommend filing a formal complaint with ECG and requesting a meter audit from PURC (Public Utilities Regulatory Commission). Use your ChopMetr report as evidence.";
  }

  return {
    expectedDailyKwh,
    expectedDailyCost,
    expectedMonthlyKwh,
    expectedMonthlyCost,
    actualDailyKwh,
    actualDailyCost,
    actualMonthlyKwh,
    actualMonthlyCost,
    discrepancyPercent,
    discrepancyKwh,
    discrepancyCost,
    avgTopUpLifeDays,
    expectedTopUpLifeDays,
    status,
    statusMessage,
    recommendation,
    hasEnoughReadings,
    hasAppliances,
    readingDaysSpan,
  };
}
