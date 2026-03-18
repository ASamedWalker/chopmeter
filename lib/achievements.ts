import type { Achievement, UserProgress } from "./types";

// ─── Constants ───────────────────────────────────────────────

const ACHIEVEMENTS_KEY = "chopmeter_achievements";

// ─── Badge Catalog ───────────────────────────────────────────

type BadgeDef = Omit<Achievement, "unlockedAt"> & {
  condition: (p: UserProgress) => boolean;
};

const BADGE_CATALOG: BadgeDef[] = [
  // ── First Steps (Bronze) ──
  {
    id: "first_scan",
    name: "First Scan",
    description: "Record your first meter reading",
    icon: "scan-line",
    iconColor: "#3B82F6",
    tier: "bronze",
    condition: (p) => p.totalScans >= 1,
  },
  {
    id: "budget_set",
    name: "Budget Planner",
    description: "Set a monthly budget",
    icon: "wallet",
    iconColor: "#8B5CF6",
    tier: "bronze",
    condition: (p) => p.budgetSet,
  },
  {
    id: "first_topup",
    name: "First Top-Up",
    description: "Log your first prepaid top-up",
    icon: "plus-circle",
    iconColor: "#10B981",
    tier: "bronze",
    condition: (p) => p.totalTopUps >= 1,
  },
  {
    id: "health_check",
    name: "Health Inspector",
    description: "Run your first meter health check",
    icon: "activity",
    iconColor: "#F59E0B",
    tier: "bronze",
    condition: (p) => p.healthCheckRun,
  },

  // ── Streak (Silver) ──
  {
    id: "week_warrior",
    name: "Week Warrior",
    description: "Maintain a 7-day scanning streak",
    icon: "flame",
    iconColor: "#EF4444",
    tier: "silver",
    condition: (p) => p.longestStreak >= 7,
  },
  {
    id: "monthly_master",
    name: "Monthly Master",
    description: "Maintain a 30-day scanning streak",
    icon: "flame",
    iconColor: "#F97316",
    tier: "silver",
    condition: (p) => p.longestStreak >= 30,
  },
  {
    id: "ten_scans",
    name: "Getting Serious",
    description: "Complete 10 meter scans",
    icon: "target",
    iconColor: "#6366F1",
    tier: "silver",
    condition: (p) => p.totalScans >= 10,
  },

  // ── Mastery (Gold) ──
  {
    id: "fifty_scans",
    name: "Scan Master",
    description: "Complete 50 meter scans",
    icon: "award",
    iconColor: "#FFD700",
    tier: "gold",
    condition: (p) => p.totalScans >= 50,
  },
  {
    id: "century_club",
    name: "Century Club",
    description: "Maintain a 100-day scanning streak",
    icon: "crown",
    iconColor: "#FFD700",
    tier: "gold",
    condition: (p) => p.longestStreak >= 100,
  },
  {
    id: "budget_boss",
    name: "Budget Boss",
    description: "Stay under budget for 3 months",
    icon: "shield-check",
    iconColor: "#10B981",
    tier: "gold",
    condition: (p) => p.budgetUnderCount >= 3,
  },
  {
    id: "eagle_eye",
    name: "Eagle Eye",
    description: "Detect an unusual usage spike",
    icon: "eye",
    iconColor: "#EF4444",
    tier: "gold",
    condition: (p) => p.spikeDetected,
  },
  {
    id: "meter_detective",
    name: "Meter Detective",
    description: "Achieve an 'A' grade on health check",
    icon: "search",
    iconColor: "#8B5CF6",
    tier: "gold",
    condition: (p) => p.healthGrade === "A",
  },

  // ── Elite (Platinum) ──
  {
    id: "year_streak",
    name: "Year of Fire",
    description: "Maintain a 365-day scanning streak",
    icon: "flame",
    iconColor: "#E5E4E2",
    tier: "platinum",
    condition: (p) => p.longestStreak >= 365,
  },
  {
    id: "two_hundred_scans",
    name: "Veteran Tracker",
    description: "Complete 200 meter scans",
    icon: "trophy",
    iconColor: "#E5E4E2",
    tier: "platinum",
    condition: (p) => p.totalScans >= 200,
  },
  {
    id: "saver_champion",
    name: "Saver Champion",
    description: "Save 30% or more vs the previous month",
    icon: "trending-down",
    iconColor: "#10B981",
    tier: "platinum",
    condition: (p) => p.monthlySavingsPercent >= 30,
  },
];

// ─── Storage ─────────────────────────────────────────────────

function getUnlockedMap(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveUnlockedMap(map: Record<string, number>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(map));
}

// ─── Public API ──────────────────────────────────────────────

/** Get all achievements with unlock status */
export function getAllAchievements(): Achievement[] {
  const unlocked = getUnlockedMap();
  return BADGE_CATALOG.map(({ condition, ...badge }) => ({
    ...badge,
    unlockedAt: unlocked[badge.id] ?? null,
  }));
}

/** Get only unlocked achievements */
export function getUnlockedAchievements(): Achievement[] {
  return getAllAchievements().filter((a) => a.unlockedAt !== null);
}

/**
 * Check all achievement conditions against current progress.
 * Returns array of NEWLY unlocked achievements (empty if none).
 */
export function checkAchievements(progress: UserProgress): Achievement[] {
  const unlocked = getUnlockedMap();
  const newlyUnlocked: Achievement[] = [];

  for (const badge of BADGE_CATALOG) {
    if (unlocked[badge.id]) continue; // already earned
    if (badge.condition(progress)) {
      unlocked[badge.id] = Date.now();
      const { condition, ...rest } = badge;
      newlyUnlocked.push({ ...rest, unlockedAt: unlocked[badge.id] });
    }
  }

  if (newlyUnlocked.length > 0) {
    saveUnlockedMap(unlocked);
  }

  return newlyUnlocked;
}

/** Get progress hint for a locked achievement */
export function getProgressHint(
  badgeId: string,
  progress: UserProgress
): string | null {
  const badge = BADGE_CATALOG.find((b) => b.id === badgeId);
  if (!badge) return null;

  switch (badgeId) {
    case "first_scan":
      return "Scan your meter to earn this badge";
    case "budget_set":
      return "Set a monthly budget in Settings";
    case "first_topup":
      return "Log a top-up to earn this badge";
    case "health_check":
      return "Run a health check from the dashboard";
    case "week_warrior":
      return `${Math.max(0, 7 - progress.currentStreak)} more days for this badge`;
    case "monthly_master":
      return `${Math.max(0, 30 - progress.currentStreak)} more days for this badge`;
    case "ten_scans":
      return `${Math.max(0, 10 - progress.totalScans)} more scans needed`;
    case "fifty_scans":
      return `${Math.max(0, 50 - progress.totalScans)} more scans needed`;
    case "century_club":
      return `${Math.max(0, 100 - progress.currentStreak)} more days for this badge`;
    case "budget_boss":
      return `${Math.max(0, 3 - progress.budgetUnderCount)} more months under budget`;
    case "eagle_eye":
      return "Keep tracking to detect usage spikes";
    case "meter_detective":
      return "Get an A grade on your health check";
    case "year_streak":
      return `${Math.max(0, 365 - progress.currentStreak)} more days for this badge`;
    case "two_hundred_scans":
      return `${Math.max(0, 200 - progress.totalScans)} more scans needed`;
    case "saver_champion":
      return "Save 30%+ vs last month to earn this";
    default:
      return null;
  }
}

/** Total badge count and unlocked count */
export function getAchievementStats(): { total: number; unlocked: number } {
  const unlocked = getUnlockedMap();
  return {
    total: BADGE_CATALOG.length,
    unlocked: Object.keys(unlocked).length,
  };
}

/** Clear all achievements (used by clearAllData) */
export function clearAchievements(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACHIEVEMENTS_KEY);
}
