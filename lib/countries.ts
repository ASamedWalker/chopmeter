/** A tariff tier with a kWh ceiling and rate */
export interface TariffTier {
  /** Max kWh for this tier (Infinity for the last tier) */
  upTo: number;
  /** Cost per kWh in local currency */
  rate: number;
  label: string;
}

export interface CountryConfig {
  code: string;
  name: string;
  flag: string;
  currencyCode: string;
  currencySymbol: string;
  /** Default residential tariff rate per kWh (flat fallback) */
  defaultTariff: number;
  /** Tiered tariff structure — if present, used instead of flat rate */
  tariffTiers?: TariffTier[];
  /** Levy percentage added on top of energy charge (e.g. 0.10 = 10%) */
  levyPercent?: number;
  locale: string;
  /** Fallback city for weather when geolocation is unavailable */
  capitalName: string;
  capitalLat: number;
  capitalLon: number;
}

export const COUNTRIES: CountryConfig[] = [
  {
    code: "GH",
    name: "Ghana",
    flag: "\uD83C\uDDEC\uD83C\uDDED",
    currencyCode: "GHS",
    currencySymbol: "GH\u20B5",
    defaultTariff: 1.97,
    tariffTiers: [
      { upTo: 30, rate: 0.87, label: "Lifeline (0-30 kWh)" },
      { upTo: 300, rate: 1.97, label: "Residential (31-300 kWh)" },
      { upTo: Infinity, rate: 2.60, label: "High Usage (301+ kWh)" },
    ],
    levyPercent: 0.10,
    locale: "en-GH",
    capitalName: "Accra",
    capitalLat: 5.6037,
    capitalLon: -0.187,
  },
  {
    code: "NG",
    name: "Nigeria",
    flag: "\uD83C\uDDF3\uD83C\uDDEC",
    currencyCode: "NGN",
    currencySymbol: "\u20A6",
    defaultTariff: 209.5,
    locale: "en-NG",
    capitalName: "Lagos",
    capitalLat: 6.5244,
    capitalLon: 3.3792,
  },
  {
    code: "ZA",
    name: "South Africa",
    flag: "\uD83C\uDDFF\uD83C\uDDE6",
    currencyCode: "ZAR",
    currencySymbol: "R",
    defaultTariff: 3.5,
    locale: "en-ZA",
    capitalName: "Johannesburg",
    capitalLat: -26.2041,
    capitalLon: 28.0473,
  },
  {
    code: "KE",
    name: "Kenya",
    flag: "\uD83C\uDDF0\uD83C\uDDEA",
    currencyCode: "KES",
    currencySymbol: "KSh",
    defaultTariff: 12.23,
    locale: "en-KE",
    capitalName: "Nairobi",
    capitalLat: -1.2921,
    capitalLon: 36.8219,
  },
  {
    code: "GB",
    name: "United Kingdom",
    flag: "\uD83C\uDDEC\uD83C\uDDE7",
    currencyCode: "GBP",
    currencySymbol: "\u00A3",
    defaultTariff: 0.2684,
    locale: "en-GB",
    capitalName: "London",
    capitalLat: 51.5074,
    capitalLon: -0.1278,
  },
  {
    code: "US",
    name: "United States",
    flag: "\uD83C\uDDFA\uD83C\uDDF8",
    currencyCode: "USD",
    currencySymbol: "$",
    defaultTariff: 0.1778,
    locale: "en-US",
    capitalName: "New York",
    capitalLat: 40.7128,
    capitalLon: -74.006,
  },
];

export function getCountry(code: string): CountryConfig {
  return COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[0];
}

/**
 * Calculate cost for a given kWh amount using tiered billing.
 * If country has no tiers, falls back to flat tariffRate.
 * Monthly kWh consumed so far determines which tier applies.
 */
export function calcTieredCost(
  kWh: number,
  country: CountryConfig,
  monthlyKwhSoFar: number = 0
): number {
  const tiers = country.tariffTiers;
  if (!tiers || tiers.length === 0) {
    return kWh * country.defaultTariff;
  }

  let remaining = kWh;
  let consumed = monthlyKwhSoFar;
  let cost = 0;

  for (const tier of tiers) {
    if (remaining <= 0) break;
    const tierCap = tier.upTo;
    const available = Math.max(0, tierCap - consumed);
    const used = Math.min(remaining, available);
    cost += used * tier.rate;
    consumed += used;
    remaining -= used;
  }

  // Apply levies
  if (country.levyPercent) {
    cost *= 1 + country.levyPercent;
  }

  return cost;
}

/**
 * Get the effective blended rate per kWh for a given monthly consumption.
 * Useful for daily burn rate estimates.
 */
export function getEffectiveRate(
  monthlyKwh: number,
  country: CountryConfig
): number {
  if (monthlyKwh <= 0) return country.defaultTariff;
  const totalCost = calcTieredCost(monthlyKwh, country);
  return totalCost / monthlyKwh;
}
