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
}

/** A bookmarked energy tip ID */
export interface BookmarkedTip {
  tipId: string;
  timestamp: number;
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
