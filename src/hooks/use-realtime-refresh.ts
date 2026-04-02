"use client";

import { useEffect, useRef } from "react";

import { getBrowserSupabaseClient } from "@/lib/supabase/client";

export function useRealtimeRefresh(
  tables: string[],
  onChange: () => void | Promise<void>,
) {
  const onChangeRef = useRef(onChange);
  const tableKey = tables.join("|");

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

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
          void onChangeRef.current();
        },
      );
    }

    channel.subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [tableKey]);
}
