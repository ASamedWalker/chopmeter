export interface CountryConfig {
  code: string;
  name: string;
  flag: string;
  currencyCode: string;
  currencySymbol: string;
  /** Default residential tariff rate per kWh */
  defaultTariff: number;
  locale: string;
}

export const COUNTRIES: CountryConfig[] = [
  {
    code: "GH",
    name: "Ghana",
    flag: "\uD83C\uDDEC\uD83C\uDDED",
    currencyCode: "GHS",
    currencySymbol: "GH\u20B5",
    defaultTariff: 2.0,
    locale: "en-GH",
  },
  {
    code: "NG",
    name: "Nigeria",
    flag: "\uD83C\uDDF3\uD83C\uDDEC",
    currencyCode: "NGN",
    currencySymbol: "\u20A6",
    defaultTariff: 209.5,
    locale: "en-NG",
  },
  {
    code: "ZA",
    name: "South Africa",
    flag: "\uD83C\uDDFF\uD83C\uDDE6",
    currencyCode: "ZAR",
    currencySymbol: "R",
    defaultTariff: 3.5,
    locale: "en-ZA",
  },
  {
    code: "KE",
    name: "Kenya",
    flag: "\uD83C\uDDF0\uD83C\uDDEA",
    currencyCode: "KES",
    currencySymbol: "KSh",
    defaultTariff: 12.23,
    locale: "en-KE",
  },
  {
    code: "GB",
    name: "United Kingdom",
    flag: "\uD83C\uDDEC\uD83C\uDDE7",
    currencyCode: "GBP",
    currencySymbol: "\u00A3",
    defaultTariff: 0.2684,
    locale: "en-GB",
  },
  {
    code: "US",
    name: "United States",
    flag: "\uD83C\uDDFA\uD83C\uDDF8",
    currencyCode: "USD",
    currencySymbol: "$",
    defaultTariff: 0.1778,
    locale: "en-US",
  },
];

export function getCountry(code: string): CountryConfig {
  return COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[0];
}
