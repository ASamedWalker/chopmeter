"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

type Theme = "dark" | "light" | "system";

interface ThemeContextValue {
  theme: Theme;
  isDark: boolean;
  setTheme: (t: Theme) => void;
}

const STORAGE_KEY = "chopmeter_theme";

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  isDark: true,
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [isDark, setIsDark] = useState(true);

  // Resolve actual dark/light from theme preference
  const resolve = useCallback((t: Theme): boolean => {
    if (t === "system") {
      return typeof window !== "undefined"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
        : true;
    }
    return t === "dark";
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
    const pref = saved ?? "dark";
    setThemeState(pref);
    const dark = resolve(pref);
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.classList.toggle("light", !dark);
  }, [resolve]);

  // Listen for system preference changes when in "system" mode
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
      document.documentElement.classList.toggle("dark", e.matches);
      document.documentElement.classList.toggle("light", !e.matches);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = useCallback(
    (t: Theme) => {
      setThemeState(t);
      localStorage.setItem(STORAGE_KEY, t);
      const dark = resolve(t);
      setIsDark(dark);
      document.documentElement.classList.toggle("dark", dark);
      document.documentElement.classList.toggle("light", !dark);
    },
    [resolve]
  );

  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
