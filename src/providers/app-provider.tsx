"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { fetchJson } from "@/lib/fetcher";
import type { BootstrapPayload } from "@/types/crm";

interface AppContextValue {
  actorLabel: string;
  setActorLabel: (value: string) => void;
  themeMode: "deep" | "midnight" | "contrast";
  setThemeMode: (value: "deep" | "midnight" | "contrast") => void;
  bootstrap: BootstrapPayload | null;
  bootstrapLoading: boolean;
  refreshBootstrap: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [actorLabel, setActorLabelState] = useState("Demo-Arbeitsplatz");
  const [themeMode, setThemeModeState] = useState<"deep" | "midnight" | "contrast">("deep");
  const [bootstrap, setBootstrap] = useState<BootstrapPayload | null>(null);
  const [bootstrapLoading, setBootstrapLoading] = useState(true);

  useEffect(() => {
    const stored = window.localStorage.getItem("crm-demo-actor");
    if (stored) {
      setActorLabelState(stored);
    }

    const storedTheme = window.localStorage.getItem("crm-demo-theme");
    if (storedTheme === "deep" || storedTheme === "midnight" || storedTheme === "contrast") {
      setThemeModeState(storedTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode;
    window.localStorage.setItem("crm-demo-theme", themeMode);
  }, [themeMode]);

  const refreshBootstrap = useCallback(async () => {
    setBootstrapLoading(true);
    try {
      const payload = await fetchJson<BootstrapPayload>("/api/bootstrap", undefined, actorLabel);
      setBootstrap(payload);
    } finally {
      setBootstrapLoading(false);
    }
  }, [actorLabel]);

  useEffect(() => {
    void refreshBootstrap();
  }, [refreshBootstrap]);

  const setActorLabel = (value: string) => {
    const nextValue = value.trim() || "Demo-Arbeitsplatz";
    window.localStorage.setItem("crm-demo-actor", nextValue);
    setActorLabelState(nextValue);
  };

  const setThemeMode = (value: "deep" | "midnight" | "contrast") => {
    setThemeModeState(value);
  };

  const contextValue = useMemo(
    () => ({
      actorLabel,
      setActorLabel,
      themeMode,
      setThemeMode,
      bootstrap,
      bootstrapLoading,
      refreshBootstrap,
    }),
    [actorLabel, bootstrap, bootstrapLoading, refreshBootstrap, themeMode],
  );

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppContext muss innerhalb des AppProvider verwendet werden.");
  }

  return context;
}
