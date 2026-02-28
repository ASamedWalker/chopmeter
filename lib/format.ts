import { getCountry } from "./countries";
import { getSettings } from "./storage";

/** Format a value as the active country's currency */
export function formatCurrency(value: number): string {
  const { countryCode } = getSettings();
  const country = getCountry(countryCode);
  return `${country.currencySymbol} ${value.toFixed(2)}`;
}

/** Format a timestamp using the active country's locale */
export function formatDate(
  timestamp: number,
  options?: Intl.DateTimeFormatOptions
): string {
  const { countryCode } = getSettings();
  const country = getCountry(countryCode);
  const defaults: Intl.DateTimeFormatOptions = {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(timestamp).toLocaleDateString(
    country.locale,
    options ?? defaults
  );
}

/** Get the currency symbol for the active country */
export function getCurrencySymbol(): string {
  const { countryCode } = getSettings();
  return getCountry(countryCode).currencySymbol;
}
