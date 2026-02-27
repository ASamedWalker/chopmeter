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
  /** GHS per kWh — default ECG residential Tier 1 rate */
  tariffRate: number;
  /** Last known prepaid balance in GHS */
  lastBalance: number;
  /** When lastBalance was recorded (Unix ms) */
  lastBalanceDate: number;
}

/** Computed dashboard metrics */
export interface DashboardMetrics {
  currentBalance: number;
  dailyBurnRate: number;
  daysLeft: number;
  lastReading: MeterReading | null;
  todayUsage: number;
  weeklyUsage: number;
  spikeDetected: boolean;
  spikePercent: number;
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
