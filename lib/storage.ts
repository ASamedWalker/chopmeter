import type { MeterReading, UserSettings, BookmarkedTip, WeatherCache, TopUp, Meter } from "./types";
import type { ReminderSettings } from "./notifications";
import type { ApplianceSelection } from "./healthcheck";
import { DEFAULT_REMINDER_SETTINGS } from "./notifications";

const READINGS_KEY = "chopmeter_readings";
const SETTINGS_KEY = "chopmeter_settings";
const BOOKMARKS_KEY = "chopmeter_bookmarks";
const WEATHER_CACHE_KEY = "chopmeter_weather";
const REMINDERS_KEY = "chopmeter_reminders";
const TOPUPS_KEY = "chopmeter_topups";
const METERS_KEY = "chopmeter_meters";
const APPLIANCE_SELECTIONS_KEY = "chopmeter_appliance_selections";
const WEATHER_CACHE_TTL = 60 * 60 * 1000; // 1 hour

/** The fixed ID used for the auto-created default meter (legacy migration). */
const DEFAULT_METER_ID = "default";

const DEFAULT_SETTINGS: UserSettings = {
  onboardingComplete: false,
  meterNumber: "",
  tariffRate: 2.0,
  tariffOverridden: false,
  countryCode: "GH",
  lastBalance: 0,
  lastBalanceDate: Date.now(),
  displayName: "",
  monthlyBudget: 0,
};

// ---- Legacy migration ----

function migrateSettings(raw: Record<string, unknown>): Record<string, unknown> {
  // Migrate old 0.75 tariff to new 2.00 Ghana default
  if (raw.tariffRate === 0.75 && !raw.tariffOverridden) {
    raw.tariffRate = 2.0;
  }
  // Add countryCode if missing (old installs)
  if (!raw.countryCode) {
    raw.countryCode = "GH";
  }
  if (raw.tariffOverridden === undefined) {
    raw.tariffOverridden = false;
  }
  if (raw.displayName === undefined) {
    raw.displayName = "";
  }
  if (raw.monthlyBudget === undefined) {
    raw.monthlyBudget = 0;
  }
  return raw;
}

// ---- Meters ----

/**
 * Returns the storage key for a meter's readings.
 * The default meter uses the legacy key for backwards compatibility.
 */
function readingsKeyFor(meterId?: string): string {
  if (!meterId || meterId === DEFAULT_METER_ID) return READINGS_KEY;
  return `chopmeter_readings_${meterId}`;
}

/**
 * Returns the storage key for a meter's top-ups.
 * The default meter uses the legacy key for backwards compatibility.
 */
function topupsKeyFor(meterId?: string): string {
  if (!meterId || meterId === DEFAULT_METER_ID) return TOPUPS_KEY;
  return `chopmeter_topups_${meterId}`;
}

/**
 * Ensures at least one meter exists. On first load with no meters,
 * creates a default "Home" meter using settings.meterNumber.
 */
function ensureDefaultMeter(): void {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem(METERS_KEY);
  if (raw) {
    try {
      const meters = JSON.parse(raw) as Meter[];
      if (meters.length > 0) return;
    } catch {
      // corrupt data — recreate
    }
  }
  // Create the default meter from existing settings
  const settings = getSettings();
  const defaultMeter: Meter = {
    id: DEFAULT_METER_ID,
    name: "Home",
    meterNumber: settings.meterNumber || "",
    icon: "home",
    color: "#3B82F6",
    isDefault: true,
    createdAt: Date.now(),
  };
  localStorage.setItem(METERS_KEY, JSON.stringify([defaultMeter]));
}

export function getMeters(): Meter[] {
  if (typeof window === "undefined") return [];
  ensureDefaultMeter();
  const raw = localStorage.getItem(METERS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Meter[];
  } catch {
    return [];
  }
}

export function saveMeter(meter: Meter): void {
  const meters = getMeters();
  const idx = meters.findIndex((m) => m.id === meter.id);
  if (idx >= 0) {
    meters[idx] = meter;
  } else {
    meters.push(meter);
  }
  localStorage.setItem(METERS_KEY, JSON.stringify(meters));
}

export function deleteMeter(id: string): void {
  let meters = getMeters().filter((m) => m.id !== id);
  // If we deleted the default, promote the first remaining meter
  if (meters.length > 0 && !meters.some((m) => m.isDefault)) {
    meters[0].isDefault = true;
  }
  localStorage.setItem(METERS_KEY, JSON.stringify(meters));
  // Clean up meter-specific storage
  localStorage.removeItem(readingsKeyFor(id));
  localStorage.removeItem(topupsKeyFor(id));
}

export function setDefaultMeter(id: string): void {
  const meters = getMeters().map((m) => ({
    ...m,
    isDefault: m.id === id,
  }));
  localStorage.setItem(METERS_KEY, JSON.stringify(meters));
}

export function getDefaultMeter(): Meter | null {
  const meters = getMeters();
  return meters.find((m) => m.isDefault) ?? meters[0] ?? null;
}

// ---- Readings ----

export function saveReading(reading: MeterReading, meterId?: string): void {
  const key = readingsKeyFor(meterId);
  const readings = getAllReadings(meterId);
  readings.unshift(reading);
  localStorage.setItem(key, JSON.stringify(readings));
}

export function getAllReadings(meterId?: string): MeterReading[] {
  if (typeof window === "undefined") return [];
  const key = readingsKeyFor(meterId);
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as MeterReading[];
  } catch {
    return [];
  }
}

export function getRecentReadings(days: number, meterId?: string): MeterReading[] {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return getAllReadings(meterId).filter((r) => r.timestamp >= cutoff);
}

export function deleteReading(id: string, meterId?: string): void {
  const key = readingsKeyFor(meterId);
  const readings = getAllReadings(meterId).filter((r) => r.id !== id);
  localStorage.setItem(key, JSON.stringify(readings));
}

// ---- Settings ----

export function getSettings(): UserSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) return DEFAULT_SETTINGS;
  try {
    const parsed = migrateSettings(JSON.parse(raw));
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(partial: Partial<UserSettings>): void {
  const current = getSettings();
  const updated = { ...current, ...partial };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
}

// ---- Bookmarks ----

function getBookmarks(): BookmarkedTip[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(BOOKMARKS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as BookmarkedTip[];
  } catch {
    return [];
  }
}

export function toggleBookmark(tipId: string): boolean {
  const bookmarks = getBookmarks();
  const idx = bookmarks.findIndex((b) => b.tipId === tipId);
  if (idx >= 0) {
    bookmarks.splice(idx, 1);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    return false; // unbookmarked
  } else {
    bookmarks.push({ tipId, timestamp: Date.now() });
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    return true; // bookmarked
  }
}

export function isBookmarked(tipId: string): boolean {
  return getBookmarks().some((b) => b.tipId === tipId);
}

export function getBookmarkedTipIds(): string[] {
  return getBookmarks().map((b) => b.tipId);
}

// ---- Reminder Settings ----

export function getReminderSettings(): ReminderSettings {
  if (typeof window === "undefined") return DEFAULT_REMINDER_SETTINGS;
  const raw = localStorage.getItem(REMINDERS_KEY);
  if (!raw) return DEFAULT_REMINDER_SETTINGS;
  try {
    return { ...DEFAULT_REMINDER_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_REMINDER_SETTINGS;
  }
}

export function saveReminderSettings(partial: Partial<ReminderSettings>): void {
  const current = getReminderSettings();
  const updated = { ...current, ...partial };
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(updated));
}

// ---- Top-ups ----

export function saveTopUp(topup: TopUp, meterId?: string): void {
  const key = topupsKeyFor(meterId);
  const topups = getAllTopUps(meterId);
  topups.unshift(topup);
  localStorage.setItem(key, JSON.stringify(topups));
}

export function getAllTopUps(meterId?: string): TopUp[] {
  if (typeof window === "undefined") return [];
  const key = topupsKeyFor(meterId);
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as TopUp[];
  } catch {
    return [];
  }
}

export function deleteTopUp(id: string, meterId?: string): void {
  const key = topupsKeyFor(meterId);
  const topups = getAllTopUps(meterId).filter((t) => t.id !== id);
  localStorage.setItem(key, JSON.stringify(topups));
}

// ---- Appliance Selections ----

export function getApplianceSelections(): ApplianceSelection[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(APPLIANCE_SELECTIONS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as ApplianceSelection[];
  } catch {
    return [];
  }
}

export function saveApplianceSelections(selections: ApplianceSelection[]): void {
  localStorage.setItem(APPLIANCE_SELECTIONS_KEY, JSON.stringify(selections));
}

// ---- Data management ----

export function clearAllData(): void {
  // Clear legacy keys
  localStorage.removeItem(READINGS_KEY);
  localStorage.removeItem(SETTINGS_KEY);
  localStorage.removeItem(BOOKMARKS_KEY);
  localStorage.removeItem(WEATHER_CACHE_KEY);
  localStorage.removeItem(REMINDERS_KEY);
  localStorage.removeItem(TOPUPS_KEY);
  localStorage.removeItem(APPLIANCE_SELECTIONS_KEY);

  // Clear meter-specific keys
  const meters = getMeters();
  for (const meter of meters) {
    localStorage.removeItem(readingsKeyFor(meter.id));
    localStorage.removeItem(topupsKeyFor(meter.id));
  }
  localStorage.removeItem(METERS_KEY);
}

// ---- Weather cache ----

export function getWeatherCache(): WeatherCache | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(WEATHER_CACHE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as WeatherCache;
    if (Date.now() - parsed.cachedAt > WEATHER_CACHE_TTL) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setWeatherCache(data: WeatherCache): void {
  localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(data));
}

// ---- ID generation ----

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
