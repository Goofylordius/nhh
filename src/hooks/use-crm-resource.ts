"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { fetchJson } from "@/lib/fetcher";
import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";
import { useAppContext } from "@/providers/app-provider";
import type { ResourceKey, ResourceRecordMap } from "@/types/crm";

type RecordFor<K extends ResourceKey> = ResourceRecordMap[K];

export function useCrmResource<K extends ResourceKey>(resource: K) {
  const { actorLabel, refreshBootstrap } = useAppContext();
  const [records, setRecords] = useState<Array<RecordFor<K>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const payload = await fetchJson<Array<RecordFor<K>>>(`/api/${resource}`, undefined, actorLabel);
      setRecords(payload);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Laden fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  }, [actorLabel, resource]);

  useEffect(() => {
    void load();
  }, [load]);

  useRealtimeRefresh([resource], async () => {
    await load();
    await refreshBootstrap();
  });

  const resourceApi = useMemo(
    () => ({
      records,
      loading,
      error,
      async create(payload: Partial<RecordFor<K>>) {
        await fetchJson<RecordFor<K>>(
          `/api/${resource}`,
          {
            method: "POST",
            body: JSON.stringify(payload),
          },
          actorLabel,
        );
        await load();
        await refreshBootstrap();
      },
      async update(id: string, payload: Partial<RecordFor<K>>) {
        await fetchJson<RecordFor<K>>(
          `/api/${resource}/${id}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          },
          actorLabel,
        );
        await load();
        await refreshBootstrap();
      },
      async remove(id: string) {
        await fetchJson<{ success: true }>(
          `/api/${resource}/${id}`,
          {
            method: "DELETE",
          },
          actorLabel,
        );
        await load();
        await refreshBootstrap();
      },
      reload: load,
    }),
    [actorLabel, error, loading, records, resource, load, refreshBootstrap],
  );

  return resourceApi;
}
