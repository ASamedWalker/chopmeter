import type { MeterReading, TopUp } from "./types";
import type { Appliance } from "./appliances";

export interface ApplianceSelection {
  applianceId: string;
  hours: number;
  quantity: number;
}

/* ─── Health Score (0-100) ─── */
export interface HealthScore {
  overall: number;
  discrepancyScore: number;   // 0-100: lower discrepancy = higher
  consistencyScore: number;   // 0-100: consistent daily readings = higher
  nightDrainScore: number;    // 0-100: normal overnight = higher
  dataQualityScore: number;   // 0-100: more readings, longer span = higher
  grade: "A" | "B" | "C" | "D" | "F";
  gradeLabel: string;
}

/* ─── Night Drain / Ghost Consumption ─── */
export interface NightDrainResult {
  detected: boolean;
  overnightKwh: number;
  expectedStandbyKwh: number;
  excessKwh: number;
  excessPercent: number;
  nightPairs: NightPair[];
  averageOvernightKwh: number;
}

export interface NightPair {
  eveningReading: MeterReading;
  morningReading: MeterReading;
  hoursElapsed: number;
  kwhConsumed: number;
  expectedKwh: number;
  isSuspicious: boolean;
}

/* ─── Spike Detection ─── */
export interface SpikeResult {
  hasSpikes: boolean;
  spikes: DailySpike[];
  averageDailyKwh: number;
  spikeThreshold: number;
}

export interface DailySpike {
  date: string;
  kwhUsed: number;
  percentAboveAvg: number;
}

/* ─── Household Benchmarks ─── */
export interface HouseholdBenchmark {
  id: string;
  label: string;
  typicalMonthlyKwh: number;
  typicalDailyKwh: number;
  description: string;
}

export const HOUSEHOLD_BENCHMARKS: HouseholdBenchmark[] = [
  { id: "single_room", label: "Single Room", typicalMonthlyKwh: 50, typicalDailyKwh: 1.7, description: "Fan, lights, phone charger, small TV" },
  { id: "1bed_no_ac", label: "1-Bed (No AC)", typicalMonthlyKwh: 90, typicalDailyKwh: 3.0, description: "Fridge, fans, lights, TV, electronics" },
  { id: "2bed_no_ac", label: "2-Bed (No AC)", typicalMonthlyKwh: 150, typicalDailyKwh: 5.0, description: "Fridge, fans, lights, TV, washing machine" },
  { id: "2bed_ac", label: "2-Bed (With AC)", typicalMonthlyKwh: 300, typicalDailyKwh: 10.0, description: "AC (8hrs), fridge, fans, TV, electronics" },
  { id: "3bed_ac", label: "3-Bed (With AC)", typicalMonthlyKwh: 450, typicalDailyKwh: 15.0, description: "2× AC, fridge, freezer, full electronics" },
  { id: "large_house", label: "Large House", typicalMonthlyKwh: 650, typicalDailyKwh: 21.7, description: "3+ AC, water heater, full appliances" },
];

/* ─── Main Result Interface ─── */
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

  // NEW: Enhanced analysis
  healthScore: HealthScore;
  nightDrain: NightDrainResult;
  spikes: SpikeResult;
  closestBenchmark: HouseholdBenchmark | null;
  benchmarkComparison: string;
}

/* ─── Health Score Calculation ─── */
function calcHealthScore(
  discrepancyPercent: number,
  readings: MeterReading[],
  readingDaysSpan: number,
  nightDrain: NightDrainResult,
  hasEnoughData: boolean
): HealthScore {
  if (!hasEnoughData) {
    return {
      overall: 0,
      discrepancyScore: 0,
      consistencyScore: 0,
      nightDrainScore: 0,
      dataQualityScore: 0,
      grade: "F",
      gradeLabel: "No data",
    };
  }

  // 1. Discrepancy score (40% weight) — lower is better
  const absDisc = Math.abs(discrepancyPercent);
  const discrepancyScore = Math.max(0, Math.min(100, 100 - absDisc * 2));

  // 2. Consistency score (20% weight) — how evenly spaced are readings
  let consistencyScore = 50;
  if (readings.length >= 3 && readingDaysSpan >= 1) {
    const sorted = [...readings].sort((a, b) => a.timestamp - b.timestamp);
    const gaps: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
      gaps.push((sorted[i].timestamp - sorted[i - 1].timestamp) / (3600000));
    }
    const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    const variance = gaps.reduce((sum, g) => sum + Math.pow(g - avgGap, 2), 0) / gaps.length;
    const cv = avgGap > 0 ? Math.sqrt(variance) / avgGap : 1;
    // cv of 0 = perfectly consistent, cv > 1.5 = very inconsistent
    consistencyScore = Math.max(0, Math.min(100, 100 - cv * 50));
  }

  // 3. Night drain score (20% weight) — lower excess = better
  let nightDrainScore = 100;
  if (nightDrain.nightPairs.length > 0) {
    const excessPct = nightDrain.excessPercent;
    if (excessPct > 0) {
      nightDrainScore = Math.max(0, Math.min(100, 100 - excessPct));
    }
  }

  // 4. Data quality score (20% weight) — more data = better
  const readingCountScore = Math.min(100, (readings.length / 14) * 100);
  const spanScore = Math.min(100, (readingDaysSpan / 7) * 100);
  const dataQualityScore = (readingCountScore + spanScore) / 2;

  // Weighted overall
  const overall = Math.round(
    discrepancyScore * 0.4 +
    consistencyScore * 0.2 +
    nightDrainScore * 0.2 +
    dataQualityScore * 0.2
  );

  const clamped = Math.max(0, Math.min(100, overall));

  let grade: HealthScore["grade"];
  let gradeLabel: string;
  if (clamped >= 85) { grade = "A"; gradeLabel = "Excellent"; }
  else if (clamped >= 70) { grade = "B"; gradeLabel = "Good"; }
  else if (clamped >= 50) { grade = "C"; gradeLabel = "Fair"; }
  else if (clamped >= 30) { grade = "D"; gradeLabel = "Poor"; }
  else { grade = "F"; gradeLabel = "Critical"; }

  return {
    overall: clamped,
    discrepancyScore: Math.round(discrepancyScore),
    consistencyScore: Math.round(consistencyScore),
    nightDrainScore: Math.round(nightDrainScore),
    dataQualityScore: Math.round(dataQualityScore),
    grade,
    gradeLabel,
  };
}

/* ─── Night Drain Detection ─── */
function detectNightDrain(
  readings: MeterReading[],
  applianceSelections: ApplianceSelection[],
  appliances: Appliance[]
): NightDrainResult {
  const sorted = [...readings].sort((a, b) => a.timestamp - b.timestamp);
  const nightPairs: NightPair[] = [];

  // Calculate expected standby: fridge + freezer + any 24h appliance
  const alwaysOnIds = ["fridge", "freezer"];
  let standbyWatts = 0;
  for (const sel of applianceSelections) {
    const app = appliances.find((a) => a.id === sel.applianceId);
    if (app && (alwaysOnIds.includes(app.id) || sel.hours >= 20)) {
      standbyWatts += app.wattage * sel.quantity;
    }
  }
  // Add baseline phantom load (~30W for chargers, router, etc.)
  standbyWatts += 30;

  // Find evening→morning pairs
  for (let i = 0; i < sorted.length - 1; i++) {
    const r1 = sorted[i];
    const r2 = sorted[i + 1];
    const d1 = new Date(r1.timestamp);
    const d2 = new Date(r2.timestamp);
    const h1 = d1.getHours();
    const h2 = d2.getHours();

    // Evening reading (8pm-midnight) followed by morning reading (5am-10am)
    const isEvening = h1 >= 20 || h1 < 1;
    const isMorning = h2 >= 5 && h2 <= 10;
    const nextDay = d2.getDate() !== d1.getDate() || (d2.getTime() - d1.getTime()) > 4 * 3600000;

    if (isEvening && isMorning && nextDay) {
      const hoursElapsed = (r2.timestamp - r1.timestamp) / 3600000;
      if (hoursElapsed >= 4 && hoursElapsed <= 14) {
        const kwhConsumed = Math.abs(r2.value - r1.value);
        const expectedKwh = (standbyWatts * hoursElapsed) / 1000;
        const isSuspicious = kwhConsumed > expectedKwh * 2 && kwhConsumed > 0.5;

        nightPairs.push({
          eveningReading: r1,
          morningReading: r2,
          hoursElapsed,
          kwhConsumed,
          expectedKwh,
          isSuspicious,
        });
      }
    }
  }

  const avgOvernight = nightPairs.length > 0
    ? nightPairs.reduce((sum, p) => sum + p.kwhConsumed, 0) / nightPairs.length
    : 0;
  const avgExpected = nightPairs.length > 0
    ? nightPairs.reduce((sum, p) => sum + p.expectedKwh, 0) / nightPairs.length
    : 0;
  const excessKwh = Math.max(0, avgOvernight - avgExpected);
  const excessPercent = avgExpected > 0 ? (excessKwh / avgExpected) * 100 : 0;
  const suspiciousCount = nightPairs.filter((p) => p.isSuspicious).length;

  return {
    detected: suspiciousCount > 0,
    overnightKwh: avgOvernight,
    expectedStandbyKwh: avgExpected,
    excessKwh,
    excessPercent,
    nightPairs,
    averageOvernightKwh: avgOvernight,
  };
}

/* ─── Spike Detection ─── */
function detectSpikes(readings: MeterReading[]): SpikeResult {
  if (readings.length < 3) {
    return { hasSpikes: false, spikes: [], averageDailyKwh: 0, spikeThreshold: 0 };
  }

  const sorted = [...readings].sort((a, b) => a.timestamp - b.timestamp);

  // Bucket readings into days
  const dailyMap = new Map<string, MeterReading[]>();
  for (const r of sorted) {
    const day = new Date(r.timestamp).toISOString().slice(0, 10);
    const arr = dailyMap.get(day) ?? [];
    arr.push(r);
    dailyMap.set(day, arr);
  }

  // Calculate daily usage
  const dailyUsage: { date: string; kwh: number }[] = [];
  const days = [...dailyMap.entries()].sort(([a], [b]) => a.localeCompare(b));

  for (let i = 0; i < days.length - 1; i++) {
    const todayReadings = days[i][1];
    const tomorrowReadings = days[i + 1][1];
    const lastToday = todayReadings[todayReadings.length - 1];
    const firstTomorrow = tomorrowReadings[0];
    const kwh = Math.abs(firstTomorrow.value - lastToday.value);
    if (kwh > 0 && kwh < 100) { // sanity check
      dailyUsage.push({ date: days[i][0], kwh });
    }
  }

  if (dailyUsage.length < 2) {
    return { hasSpikes: false, spikes: [], averageDailyKwh: 0, spikeThreshold: 0 };
  }

  const avgDaily = dailyUsage.reduce((s, d) => s + d.kwh, 0) / dailyUsage.length;
  const spikeThreshold = avgDaily * 2;

  const spikes: DailySpike[] = dailyUsage
    .filter((d) => d.kwh > spikeThreshold)
    .map((d) => ({
      date: d.date,
      kwhUsed: d.kwh,
      percentAboveAvg: ((d.kwh - avgDaily) / avgDaily) * 100,
    }));

  return {
    hasSpikes: spikes.length > 0,
    spikes,
    averageDailyKwh: avgDaily,
    spikeThreshold,
  };
}

/* ─── Benchmark Matching ─── */
function findClosestBenchmark(actualMonthlyKwh: number): {
  benchmark: HouseholdBenchmark | null;
  comparison: string;
} {
  if (actualMonthlyKwh <= 0) return { benchmark: null, comparison: "" };

  let closest: HouseholdBenchmark | null = null;
  let minDiff = Infinity;

  for (const b of HOUSEHOLD_BENCHMARKS) {
    const diff = Math.abs(b.typicalMonthlyKwh - actualMonthlyKwh);
    if (diff < minDiff) {
      minDiff = diff;
      closest = b;
    }
  }

  if (!closest) return { benchmark: null, comparison: "" };

  const ratio = actualMonthlyKwh / closest.typicalMonthlyKwh;
  let comparison: string;
  if (ratio < 0.8) {
    comparison = `Your usage is below typical for a ${closest.label} household. Good energy management.`;
  } else if (ratio <= 1.2) {
    comparison = `Your usage matches a typical ${closest.label} household (${closest.description}).`;
  } else {
    // Find what profile they match
    const matchProfile = HOUSEHOLD_BENCHMARKS.find((b) => actualMonthlyKwh <= b.typicalMonthlyKwh * 1.1);
    if (matchProfile && matchProfile.id !== closest.id) {
      comparison = `Your usage is more like a ${matchProfile.label} — higher than expected for a ${closest.label}.`;
    } else {
      comparison = `Your usage is ${Math.round((ratio - 1) * 100)}% above typical for a ${closest.label} household.`;
    }
  }

  return { benchmark: closest, comparison };
}

/* ─── Main Health Check ─── */
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

  // --- Enhanced Analysis ---
  const nightDrain = detectNightDrain(readings, applianceSelections, appliances);
  const spikes = detectSpikes(readings);
  const hasEnoughData = hasEnoughReadings && hasAppliances && readingDaysSpan >= 1;

  const healthScore = calcHealthScore(
    discrepancyPercent,
    readings,
    readingDaysSpan,
    nightDrain,
    hasEnoughData
  );

  const { benchmark: closestBenchmark, comparison: benchmarkComparison } =
    findClosestBenchmark(actualMonthlyKwh);

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

  // Append night drain info to recommendation if detected
  if (nightDrain.detected) {
    recommendation += ` Your meter also shows suspicious overnight consumption — ${nightDrain.averageOvernightKwh.toFixed(1)} kWh vs expected ${nightDrain.expectedStandbyKwh.toFixed(1)} kWh standby.`;
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
    healthScore,
    nightDrain,
    spikes,
    closestBenchmark,
    benchmarkComparison,
  };
}
