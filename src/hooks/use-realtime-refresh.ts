"use client";

import { useEffect, useEffectEvent } from "react";

import { getBrowserSupabaseClient } from "@/lib/supabase/client";

export function useRealtimeRefresh(
  tables: string[],
  onChange: () => void | Promise<void>,
) {
  const handleChange = useEffectEvent(async () => {
    await onChange();
  });
  const tableKey = tables.join("|");

  useEffect(() => {
    const supabase = getBrowserSupabaseClient();
    const tableList = tableKey.split("|").filter(Boolean);
    const channel = supabase.channel(`crm-sync-${tableKey.replaceAll("|", "-")}`);

    for (const table of tableList) {
      channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
        },
        () => {
          void handleChange();
        },
      );
    }

    channel.subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [tableKey]);
}
