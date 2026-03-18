/** A single meter reading entry */
export interface MeterReading {
  id: string;
  /** kWh value read from meter */
  value: number;
  /** Unix timestamp (ms) */
  timestamp: number;
  /** How the reading was captured */
  source: "ocr" | "manual";
}

/** User preferences persisted in localStorage */
export interface UserSettings {
  onboardingComplete: boolean;
  meterNumber: string;
  /** Currency per kWh — default from selected country */
  tariffRate: number;
  /** Whether the user manually overrode the default tariff */
  tariffOverridden: boolean;
  /** ISO country code (e.g. "GH", "NG") */
  countryCode: string;
  /** Last known prepaid balance in local currency */
  lastBalance: number;
  /** When lastBalance was recorded (Unix ms) */
  lastBalanceDate: number;
  /** User's display name for personalized greeting */
  displayName: string;
  /** Monthly spending target in local currency (0 = not set) */
  monthlyBudget: number;
}

/** Cached weather data from Open-Meteo */
export interface WeatherCache {
  temperature: number;
  weatherCode: number;
  condition: string;
  cityName: string;
  cachedAt: number;
  latitude: number;
  longitude: number;
}

/** Computed dashboard metrics */
export interface DashboardMetrics {
  currentBalance: number;
  dailyBurnRate: number;
  /** null when insufficient data */
  daysLeft: number | null;
  lastReading: MeterReading | null;
  todayUsage: number;
  weeklyUsage: number;
  /** true when 2+ readings span at least 1 day */
  dataAdequate: boolean;
  /** days of reading data available */
  dataSpanDays: number;
}

/** A bookmarked energy tip ID */
export interface BookmarkedTip {
  tipId: string;
  timestamp: number;
}

/** A single prepaid electricity top-up */
export interface TopUp {
  id: string;
  /** Currency amount paid */
  amount: number;
  /** kWh received (0 if unknown) */
  units: number;
  /** Unix timestamp (ms) */
  timestamp: number;
  /** Optional note (e.g. "MTN MoMo", "vendor") */
  note: string;
}

/** A meter/property that the user tracks */
export interface Meter {
  id: string;
  name: string;           // e.g. "Home", "Shop", "Rental"
  meterNumber: string;    // meter ID number
  icon: string;           // lucide icon name: "home", "store", "building", "warehouse", "factory"
  color: string;          // hex color for identification
  isDefault: boolean;     // is this the active/selected meter
  createdAt: number;
}

/** Energy saving tip */
export interface EnergyTip {
  id: string;
  title: string;
  description: string;
  category: "cooling" | "kitchen" | "lighting" | "appliances" | "habits";
  icon: string;
  iconColor: string;
}

// ─── Engagement System ───────────────────────────────────────

/** Daily scanning streak data */
export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  /** "YYYY-MM-DD" of last scan */
  lastScanDate: string;
  /** Earned 1 per 7-day milestone, lets you skip a day */
  streakFreezes: number;
  totalScans: number;
  /** Last 7 days scanning activity [oldest → newest] */
  weeklyScans: boolean[];
}

/** Tracker level based on total engagement */
export type TrackerLevel = "starter" | "bronze" | "silver" | "gold" | "platinum";

export interface TrackerLevelInfo {
  level: TrackerLevel;
  name: string;
  minScans: number;
  color: string;
  icon: string;
}

/** Achievement / badge */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconColor: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
  /** null = locked */
  unlockedAt: number | null;
}

/** Aggregated user progress for achievement checks */
export interface UserProgress {
  totalScans: number;
  currentStreak: number;
  longestStreak: number;
  totalTopUps: number;
  budgetSet: boolean;
  budgetUnderCount: number;
  healthCheckRun: boolean;
  healthGrade: string | null;
  spikeDetected: boolean;
  monthlySavingsPercent: number;
}

/** Weekly usage insight */
export interface WeeklyInsight {
  weekUsage: number;
  weekCost: number;
  prevWeekCost: number;
  changePercent: number;
  changeDirection: "up" | "down" | "flat";
  savingsAmount: number;
  daysTracked: number;
  burnRateComparison: string;
}

/** Savings challenge */
export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: "weekly" | "monthly";
  target: number;
  current: number;
  unit: "currency" | "days" | "kWh";
  startDate: number;
  endDate: number;
  status: "active" | "completed" | "failed";
  rewardBadgeId: string | null;
}
