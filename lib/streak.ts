import type { StreakData, TrackerLevel, TrackerLevelInfo } from "./types";

// ─── Constants ───────────────────────────────────────────────

const STREAK_KEY = "chopmeter_streak";

const DEFAULT_STREAK: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastScanDate: "",
  streakFreezes: 0,
  totalScans: 0,
  weeklyScans: [false, false, false, false, false, false, false],
};

// ─── Tracker Levels ──────────────────────────────────────────

export const TRACKER_LEVELS: TrackerLevelInfo[] = [
  { level: "starter", name: "Starter", minScans: 0, color: "#6B7280", icon: "circle-dot" },
  { level: "bronze", name: "Bronze Tracker", minScans: 7, color: "#CD7F32", icon: "shield" },
  { level: "silver", name: "Silver Tracker", minScans: 30, color: "#C0C0C0", icon: "shield-check" },
  { level: "gold", name: "Gold Tracker", minScans: 90, color: "#FFD700", icon: "trophy" },
  { level: "platinum", name: "Platinum Tracker", minScans: 180, color: "#E5E4E2", icon: "crown" },
];

export function getTrackerLevel(totalScans: number): TrackerLevelInfo {
  for (let i = TRACKER_LEVELS.length - 1; i >= 0; i--) {
    if (totalScans >= TRACKER_LEVELS[i].minScans) return TRACKER_LEVELS[i];
  }
  return TRACKER_LEVELS[0];
}

export function getNextLevel(totalScans: number): TrackerLevelInfo | null {
  const current = getTrackerLevel(totalScans);
  const idx = TRACKER_LEVELS.findIndex((l) => l.level === current.level);
  return idx < TRACKER_LEVELS.length - 1 ? TRACKER_LEVELS[idx + 1] : null;
}

// ─── Helpers ─────────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00");
  const db = new Date(b + "T00:00:00");
  return Math.round(Math.abs(db.getTime() - da.getTime()) / 86400000);
}

// ─── Storage ─────────────────────────────────────────────────

export function getStreakData(): StreakData {
  if (typeof window === "undefined") return { ...DEFAULT_STREAK };
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    return raw ? { ...DEFAULT_STREAK, ...JSON.parse(raw) } : { ...DEFAULT_STREAK };
  } catch {
    return { ...DEFAULT_STREAK };
  }
}

export function saveStreakData(data: StreakData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STREAK_KEY, JSON.stringify(data));
}

// ─── Core Logic ──────────────────────────────────────────────

/**
 * Record a scan. Call this after every successful meter reading save.
 * Returns the updated streak data + whether a milestone was hit.
 */
export function recordScan(): {
  streak: StreakData;
  milestoneHit: number | null;
  isNewDay: boolean;
} {
  const data = getStreakData();
  const today = todayStr();

  // Already scanned today — just increment total
  if (data.lastScanDate === today) {
    data.totalScans += 1;
    saveStreakData(data);
    return { streak: data, milestoneHit: null, isNewDay: false };
  }

  const yesterday = yesterdayStr();
  const prevStreak = data.currentStreak;

  if (data.lastScanDate === yesterday || data.lastScanDate === "") {
    // Consecutive day or first ever scan
    data.currentStreak += 1;
  } else if (data.lastScanDate !== "" && daysBetween(data.lastScanDate, today) === 2 && data.streakFreezes > 0) {
    // Missed exactly 1 day but have a freeze
    data.streakFreezes -= 1;
    data.currentStreak += 1;
  } else {
    // Streak broken
    data.currentStreak = 1;
  }

  data.totalScans += 1;
  data.lastScanDate = today;
  data.longestStreak = Math.max(data.longestStreak, data.currentStreak);

  // Update weekly scans (shift left, add today)
  data.weeklyScans = [...data.weeklyScans.slice(1), true];

  // Award streak freeze at every 7-day milestone
  const milestones = [7, 14, 21, 30, 60, 100, 150, 200, 365];
  let milestoneHit: number | null = null;
  for (const m of milestones) {
    if (data.currentStreak === m && prevStreak < m) {
      data.streakFreezes += 1;
      milestoneHit = m;
      break;
    }
  }

  saveStreakData(data);
  return { streak: data, milestoneHit, isNewDay: true };
}

/**
 * Check current streak status for UI display.
 */
export function checkStreakStatus(): "active" | "at_risk" | "lost" {
  const data = getStreakData();
  const today = todayStr();

  if (data.lastScanDate === today) return "active";
  if (data.lastScanDate === yesterdayStr()) {
    // Scanned yesterday but not today — at risk (streak alive until midnight)
    return "at_risk";
  }
  if (data.currentStreak > 0 && data.lastScanDate !== "") return "lost";
  return "lost";
}

/**
 * Manually use a streak freeze (e.g. from UI).
 * Returns true if freeze was used successfully.
 */
export function useStreakFreeze(): boolean {
  const data = getStreakData();
  if (data.streakFreezes <= 0) return false;
  // Only useful if streak would be lost (missed yesterday)
  const today = todayStr();
  if (data.lastScanDate === today) return false;
  if (daysBetween(data.lastScanDate, today) > 2) return false;

  data.streakFreezes -= 1;
  // Don't increment streak, just preserve it by updating date
  data.lastScanDate = yesterdayStr();
  saveStreakData(data);
  return true;
}

/**
 * Advance weekly scan dots when day passes without a scan.
 * Call this on dashboard load to keep the 7-day dots accurate.
 */
export function refreshWeeklyScans(): StreakData {
  const data = getStreakData();
  if (!data.lastScanDate) return data;

  const today = todayStr();
  const gap = daysBetween(data.lastScanDate, today);

  if (gap > 0 && data.lastScanDate !== today) {
    // Fill in missed days with false
    const missedDays = Math.min(gap, 7);
    for (let i = 0; i < missedDays; i++) {
      data.weeklyScans = [...data.weeklyScans.slice(1), false];
    }
    saveStreakData(data);
  }

  return data;
}
