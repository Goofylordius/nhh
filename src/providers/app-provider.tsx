"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { fetchJson } from "@/lib/fetcher";
import type { BootstrapPayload } from "@/types/crm";

interface AppContextValue {
  actorLabel: string;
  setActorLabel: (value: string) => void;
  bootstrap: BootstrapPayload | null;
  bootstrapLoading: boolean;
  refreshBootstrap: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [actorLabel, setActorLabelState] = useState("Demo-Arbeitsplatz");
  const [bootstrap, setBootstrap] = useState<BootstrapPayload | null>(null);
  const [bootstrapLoading, setBootstrapLoading] = useState(true);

  useEffect(() => {
    const stored = window.localStorage.getItem("crm-demo-actor");
    if (stored) {
      setActorLabelState(stored);
    }
  }, []);

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

  const contextValue = useMemo(
    () => ({
      actorLabel,
      setActorLabel,
      bootstrap,
      bootstrapLoading,
      refreshBootstrap,
    }),
    [actorLabel, bootstrap, bootstrapLoading, refreshBootstrap],
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
