"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getCookie, setCookie } from "@portfolio/lib/lib/cookies";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Matches the server render. The actual class on <html> is set before first
  // paint by the inline script in the root layout, so this state only needs to
  // catch up for consumers that read `theme` (the switcher icon, sonner, the
  // glitch canvas) — it never drives whether anything renders.
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    const savedTheme = getCookie("theme") as Theme | null;
    if (savedTheme === "light" || savedTheme === "dark") {
      setThemeState(savedTheme);
      document.documentElement.classList.toggle(
        "light",
        savedTheme === "light",
      );
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    setCookie("theme", newTheme);
    document.documentElement.classList.toggle("light", newTheme === "light");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
