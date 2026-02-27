import type { MeterReading, UserSettings } from "./types";

const READINGS_KEY = "chopmeter_readings";
const SETTINGS_KEY = "chopmeter_settings";

const DEFAULT_SETTINGS: UserSettings = {
  onboardingComplete: false,
  meterNumber: "",
  tariffRate: 0.75,
  lastBalance: 0,
  lastBalanceDate: Date.now(),
};

// ---- Readings ----

export function saveReading(reading: MeterReading): void {
  const readings = getAllReadings();
  readings.unshift(reading);
  localStorage.setItem(READINGS_KEY, JSON.stringify(readings));
}

export function getAllReadings(): MeterReading[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(READINGS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as MeterReading[];
  } catch {
    return [];
  }
}

export function getRecentReadings(days: number): MeterReading[] {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return getAllReadings().filter((r) => r.timestamp >= cutoff);
}

export function deleteReading(id: string): void {
  const readings = getAllReadings().filter((r) => r.id !== id);
  localStorage.setItem(READINGS_KEY, JSON.stringify(readings));
}

// ---- Settings ----

export function getSettings(): UserSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) return DEFAULT_SETTINGS;
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(partial: Partial<UserSettings>): void {
  const current = getSettings();
  const updated = { ...current, ...partial };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
}

// ---- ID generation ----

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
