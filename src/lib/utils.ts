import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function euro(value: number | string | null | undefined) {
  const numeric = Number(value ?? 0);
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(Number.isFinite(numeric) ? numeric : 0);
}

export function percent(value: number | null | undefined) {
  return `${Math.max(0, Math.min(100, Number(value ?? 0)))} %`;
}

export function compactDate(
  value: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions,
) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    ...(options ?? {}),
  }).format(new Date(value));
}

export function compactDateTime(value: string | Date | null | undefined) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function arrayify(value: string | string[] | null | undefined) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function ensureNumber(value: unknown, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

export function ensureString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

export function humanizeStatus(value: string | null | undefined) {
  const source = String(value ?? "").trim().toLowerCase();
  const labels: Record<string, string> = {
    lead: "Lead",
    aktiv: "Aktiv",
    inaktiv: "Inaktiv",
    neu: "Neu",
    kontaktiert: "Kontaktiert",
    angebot: "Angebot",
    verhandlung: "Verhandlung",
    gewonnen: "Gewonnen",
    verloren: "Verloren",
    entwurf: "Entwurf",
    versendet: "Versendet",
    angenommen: "Angenommen",
    faellig: "Fällig",
    ueberfaellig: "Überfällig",
    bezahlt: "Bezahlt",
    storniert: "Storniert",
    geplant: "Geplant",
    pausiert: "Pausiert",
    abgeschlossen: "Abgeschlossen",
    offen: "Offen",
    in_arbeit: "In Arbeit",
    wartet: "Wartet",
    erledigt: "Erledigt",
    kritisch: "Kritisch",
    mittel: "Mittel",
    niedrig: "Niedrig",
    hoch: "Hoch",
    anruf: "Anruf",
    email: "E-Mail",
    meeting: "Meeting",
    notiz: "Notiz",
  };

  if (labels[source]) {
    return labels[source];
  }

  return source
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}
