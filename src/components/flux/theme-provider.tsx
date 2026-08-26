"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

export type FluxTheme = "dark" | "light" | "paper";
export type FluxLang = "en" | "hi";

interface ThemeCtx {
  theme: FluxTheme;
  lang: FluxLang;
  setTheme: (t: FluxTheme) => void;
  setLang: (l: FluxLang) => void;
  toggleTheme: () => void;
}

const Ctx = createContext<ThemeCtx | null>(null);

const THEME_KEY = "flux-theme";
const LANG_KEY = "flux-language";

export function FluxThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<FluxTheme>(() => {
    if (typeof localStorage !== "undefined") {
      const t = localStorage.getItem(THEME_KEY) as FluxTheme | null;
      if (t) return t;
    }
    return "dark";
  });
  const [lang, setLangState] = useState<FluxLang>(() => {
    if (typeof localStorage !== "undefined") {
      const l = localStorage.getItem(LANG_KEY) as FluxLang | null;
      if (l) return l;
    }
    return "en";
  });

  // apply theme to <html data-theme>
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme]);

  const setTheme = useCallback((t: FluxTheme) => {
    setThemeState(t);
    if (typeof localStorage !== "undefined") localStorage.setItem(THEME_KEY, t);
  }, []);

  const setLang = useCallback((l: FluxLang) => {
    setLangState(l);
    if (typeof localStorage !== "undefined") localStorage.setItem(LANG_KEY, l);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: FluxTheme = prev === "dark" ? "light" : prev === "light" ? "paper" : "dark";
      if (typeof localStorage !== "undefined") localStorage.setItem(THEME_KEY, next);
      return next;
    });
  }, []);

  return (
    <Ctx.Provider value={{ theme, lang, setTheme, setLang, toggleTheme }}>
      {children}
    </Ctx.Provider>
  );
}

export function useFluxTheme() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useFluxTheme must be used inside FluxThemeProvider");
  return ctx;
}
