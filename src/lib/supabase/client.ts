"use client";

import { createClient } from "@supabase/supabase-js";

import { publicEnv } from "@/lib/env.client";

let clientSingleton: ReturnType<typeof createClient> | null = null;

export function getBrowserSupabaseClient() {
  if (!clientSingleton) {
    clientSingleton = createClient(
      publicEnv.NEXT_PUBLIC_SUPABASE_URL,
      publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );
  }

  return clientSingleton;
}
