import type { MeterReading, UserSettings, BookmarkedTip, WeatherCache } from "./types";

const READINGS_KEY = "chopmeter_readings";
const SETTINGS_KEY = "chopmeter_settings";
const BOOKMARKS_KEY = "chopmeter_bookmarks";
const WEATHER_CACHE_KEY = "chopmeter_weather";
const WEATHER_CACHE_TTL = 60 * 60 * 1000; // 1 hour

const DEFAULT_SETTINGS: UserSettings = {
  onboardingComplete: false,
  meterNumber: "",
  tariffRate: 2.0,
  tariffOverridden: false,
  countryCode: "GH",
  lastBalance: 0,
  lastBalanceDate: Date.now(),
  displayName: "",
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
  return raw;
}

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

// ---- Data management ----

export function clearAllData(): void {
  localStorage.removeItem(READINGS_KEY);
  localStorage.removeItem(SETTINGS_KEY);
  localStorage.removeItem(BOOKMARKS_KEY);
  localStorage.removeItem(WEATHER_CACHE_KEY);
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
