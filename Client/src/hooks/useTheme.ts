import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";
export const STORAGE_KEY = "todopro-theme"; 

/** Light is the default so the app looks the same until the user explicitly selects a different theme */
export function getInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") {
      return saved;
    }
  } catch {
    // Ignore localStorage errors
  }
  return "light";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Ignore localStorage errors
    }
}, [theme]);

const toggleTheme = useCallback(() => {setTheme((t) => (t === "light" ? "dark" : "light"));}, []);
  return { theme, toggleTheme };

}
