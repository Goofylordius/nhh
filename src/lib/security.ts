import { z } from "zod";

export const dangerousPattern =
  /<script[\s\S]*?>[\s\S]*?<\/script>|javascript:|onerror=|onload=|<iframe|<object|<embed/gi;

export function sanitizeText(value: unknown, maxLength = 5000) {
  const raw = typeof value === "string" ? value : "";
  return raw
    .replace(dangerousPattern, "")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, maxLength);
}

export function sanitizeArray(value: unknown, maxEntries = 25) {
  if (Array.isArray(value)) {
    return value
      .map((entry) => sanitizeText(entry, 120))
      .filter(Boolean)
      .slice(0, maxEntries);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((entry) => sanitizeText(entry, 120))
      .filter(Boolean)
      .slice(0, maxEntries);
  }

  return [];
}

export function sanitizeNullable(value: unknown, maxLength = 5000) {
  const sanitized = sanitizeText(value, maxLength);
  return sanitized || null;
}

export function sanitizeUrl(value: unknown) {
  const raw = sanitizeText(value, 250);
  if (!raw) {
    return null;
  }

  try {
    const url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    return url.toString();
  } catch {
    return null;
  }
}

export function assertPayloadSize(body: unknown) {
  const serialized = JSON.stringify(body ?? {});
  if (serialized.length > 100_000) {
    throw new Error("Die Anfrage ist zu gross.");
  }
}

export const actorHeaderSchema = z
  .string()
  .trim()
  .max(100)
  .transform((value) => value || "Demo-Arbeitsplatz");

