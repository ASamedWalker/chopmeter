import type { Challenge } from "./types";

// ─── Constants ───────────────────────────────────────────────

const CHALLENGES_KEY = "chopmeter_challenges";

// ─── Storage ─────────────────────────────────────────────────

export function getChallenges(): Challenge[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CHALLENGES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveChallenges(challenges: Challenge[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CHALLENGES_KEY, JSON.stringify(challenges));
}

// ─── Public API ──────────────────────────────────────────────

/** Get the currently active challenge, or null */
export function getActiveChallenge(): Challenge | null {
  const all = getChallenges();
  return all.find((c) => c.status === "active") ?? null;
}

/**
 * Generate a new challenge based on user data.
 * Only generates if no active challenge exists.
 */
export function generateChallenge(params: {
  lastWeekCost: number;
  currencySymbol: string;
  currentStreak: number;
  monthlyBudget: number;
  dailyBurnRate: number;
}): Challenge | null {
  if (getActiveChallenge()) return null;

  const { lastWeekCost, currencySymbol, currentStreak, monthlyBudget, dailyBurnRate } = params;
  const now = Date.now();

  // Pick a challenge type based on what data we have
  const candidates: Challenge[] = [];

  // Spending challenge (need at least 1 week of data)
  if (lastWeekCost > 0) {
    const target = Math.round(lastWeekCost * 0.9); // 10% less
    candidates.push({
      id: `spend_${now}`,
      title: `Spend under ${currencySymbol}${target} this week`,
      description: "Use 10% less than last week",
      type: "weekly",
      target,
      current: 0,
      unit: "currency",
      startDate: now,
      endDate: now + 7 * 86400000,
      status: "active",
      rewardBadgeId: null,
    });
  }

  // Streak challenge (if streak is low)
  if (currentStreak < 7) {
    candidates.push({
      id: `streak_${now}`,
      title: "Scan every day this week",
      description: "Build a 7-day scanning streak",
      type: "weekly",
      target: 7,
      current: Math.min(currentStreak, 6),
      unit: "days",
      startDate: now,
      endDate: now + 7 * 86400000,
      status: "active",
      rewardBadgeId: "week_warrior",
    });
  }

  // Budget challenge (if budget is set)
  if (monthlyBudget > 0) {
    const daysInMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0
    ).getDate();
    const dayOfMonth = new Date().getDate();
    const remaining = monthlyBudget - dailyBurnRate * dayOfMonth;

    if (remaining > 0) {
      candidates.push({
        id: `budget_${now}`,
        title: "Stay under budget this month",
        description: `Keep spending below ${currencySymbol}${Math.round(monthlyBudget)}`,
        type: "monthly",
        target: monthlyBudget,
        current: Math.round(dailyBurnRate * dayOfMonth),
        unit: "currency",
        startDate: now,
        endDate: new Date(
          new Date().getFullYear(),
          new Date().getMonth() + 1,
          0
        ).getTime(),
        status: "active",
        rewardBadgeId: "budget_boss",
      });
    }
  }

  if (candidates.length === 0) {
    // Default: scan streak challenge
    candidates.push({
      id: `scan_${now}`,
      title: "Complete 5 scans this week",
      description: "Build the tracking habit",
      type: "weekly",
      target: 5,
      current: 0,
      unit: "days",
      startDate: now,
      endDate: now + 7 * 86400000,
      status: "active",
      rewardBadgeId: null,
    });
  }

  // Pick a random candidate
  const challenge = candidates[Math.floor(Math.random() * candidates.length)];
  const all = getChallenges();
  all.push(challenge);
  saveChallenges(all);
  return challenge;
}

/**
 * Update the active challenge progress.
 * Returns the challenge if it was just completed, null otherwise.
 */
export function updateChallengeProgress(params: {
  weekCost?: number;
  streakDays?: number;
  monthSpend?: number;
}): Challenge | null {
  const challenge = getActiveChallenge();
  if (!challenge) return null;

  const now = Date.now();

  // Check if expired
  if (now > challenge.endDate) {
    challenge.status = challenge.current >= challenge.target ? "completed" : "failed";
    const all = getChallenges().map((c) =>
      c.id === challenge.id ? challenge : c
    );
    saveChallenges(all);
    return challenge.status === "completed" ? challenge : null;
  }

  // Update progress
  if (challenge.unit === "currency" && params.weekCost !== undefined) {
    challenge.current = Math.round(params.weekCost);
  } else if (challenge.unit === "days" && params.streakDays !== undefined) {
    challenge.current = params.streakDays;
  } else if (
    challenge.unit === "currency" &&
    challenge.type === "monthly" &&
    params.monthSpend !== undefined
  ) {
    challenge.current = Math.round(params.monthSpend);
  }

  // Check completion
  if (challenge.unit === "days" && challenge.current >= challenge.target) {
    challenge.status = "completed";
  }
  // For currency challenges, "completed" means staying UNDER target at end

  const all = getChallenges().map((c) =>
    c.id === challenge.id ? challenge : c
  );
  saveChallenges(all);

  return challenge.status === "completed" ? challenge : null;
}

/** Get completed challenge count */
export function getCompletedCount(): number {
  return getChallenges().filter((c) => c.status === "completed").length;
}
