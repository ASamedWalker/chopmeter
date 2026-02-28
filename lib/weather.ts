import type { WeatherCache } from "./types";
import { getWeatherCache, setWeatherCache } from "./storage";
import { getCountry } from "./countries";

/** Map WMO weather code to human-readable condition + Lucide icon name */
export function decodeWeatherCode(code: number): {
  condition: string;
  icon: string;
} {
  if (code === 0) return { condition: "Clear sky", icon: "Sun" };
  if (code <= 1) return { condition: "Mainly clear", icon: "Sun" };
  if (code <= 2) return { condition: "Partly cloudy", icon: "CloudSun" };
  if (code <= 3) return { condition: "Overcast", icon: "Cloud" };
  if (code <= 48) return { condition: "Foggy", icon: "CloudFog" };
  if (code <= 57) return { condition: "Drizzle", icon: "CloudDrizzle" };
  if (code <= 67) return { condition: "Rain", icon: "CloudRain" };
  if (code <= 77) return { condition: "Snow", icon: "Snowflake" };
  if (code <= 82) return { condition: "Showers", icon: "CloudRain" };
  if (code <= 99) return { condition: "Thunderstorm", icon: "CloudLightning" };
  return { condition: "Unknown", icon: "Cloud" };
}

interface GeoPosition {
  latitude: number;
  longitude: number;
  cityName: string;
}

/** Try browser geolocation, fall back to country capital */
async function getPosition(countryCode: string): Promise<GeoPosition> {
  const country = getCountry(countryCode);

  if (typeof navigator !== "undefined" && navigator.geolocation) {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 5000,
          maximumAge: 600000,
        });
      });
      return {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        cityName: country.capitalName,
      };
    } catch {
      // Fall through to capital
    }
  }

  return {
    latitude: country.capitalLat,
    longitude: country.capitalLon,
    cityName: country.capitalName,
  };
}

/** Fetch weather data, using 1-hour cache */
export async function fetchWeather(
  countryCode: string
): Promise<WeatherCache | null> {
  const cached = getWeatherCache();
  if (cached) return cached;

  try {
    const pos = await getPosition(countryCode);
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${pos.latitude}&longitude=${pos.longitude}&current=temperature_2m,weather_code`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();

    const { condition } = decodeWeatherCode(data.current.weather_code);
    const weather: WeatherCache = {
      temperature: Math.round(data.current.temperature_2m),
      weatherCode: data.current.weather_code,
      condition,
      cityName: pos.cityName,
      cachedAt: Date.now(),
      latitude: pos.latitude,
      longitude: pos.longitude,
    };

    setWeatherCache(weather);
    return weather;
  } catch {
    return null;
  }
}
