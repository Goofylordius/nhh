import { publicEnv } from "@/lib/env.client";

export async function fetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
  actorLabel?: string,
): Promise<T> {
  const isFormData = typeof FormData !== "undefined" && init?.body instanceof FormData;
  const response = await fetch(input, {
    ...init,
    headers: {
      Accept: "application/json",
      "X-Actor-Label": actorLabel ?? publicEnv.NEXT_PUBLIC_APP_NAME,
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(payload?.message ?? "Die Anfrage konnte nicht verarbeitet werden.");
  }

  return (await response.json()) as T;
}
