import { z } from "zod";

import { sanitizeArray, sanitizeNullable, sanitizeText, sanitizeUrl } from "@/lib/security";

const requiredText = (label: string, max = 180) =>
  z
    .string({ required_error: `${label} ist erforderlich.` })
    .transform((value) => sanitizeText(value, max))
    .refine((value) => value.length > 0, `${label} ist erforderlich.`);

const optionalText = (max = 5000) =>
  z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => sanitizeNullable(value, max));

const optionalEmail = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => sanitizeNullable(value, 180))
  .refine(
    (value) =>
      !value || /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/.test(value),
    "Die E-Mail-Adresse ist ungueltig.",
  )
  .transform((value) => (value ? value.toLowerCase() : null));

const optionalUrl = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => sanitizeUrl(value));

const optionalNumber = z
  .union([z.number(), z.string(), z.null(), z.undefined()])
  .transform((value) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
  });

const optionalInteger = z
  .union([z.number(), z.string(), z.null(), z.undefined()])
  .transform((value) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? Math.round(numeric) : null;
  });

const optionalDate = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => {
    const sanitized = sanitizeNullable(value, 40);
    return sanitized || null;
  });

const arrayField = z
  .union([z.array(z.string()), z.string(), z.null(), z.undefined()])
  .transform((value) => sanitizeArray(value));

export const customerSchema = z.object({
  company_name: requiredText("Firma oder Name"),
  contact_name: optionalText(180),
  address_line1: optionalText(250),
  address_line2: optionalText(250),
  postal_code: optionalText(20),
  city: optionalText(120),
  state: optionalText(120),
  country: optionalText(120),
  email: optionalEmail,
  phone: optionalText(50),
  website: optionalUrl,
  industry: optionalText(120),
  status: z.enum(["lead", "aktiv", "inaktiv"]).default("lead"),
  notes: optionalText(4000),
  tags: arrayField,
});

export const contactSchema = z.object({
  customer_id: z.string().uuid("Der Kunde ist ungueltig."),
  first_name: requiredText("Vorname", 120),
  last_name: requiredText("Nachname", 120),
  role_title: optionalText(120),
  email: optionalEmail,
  phone: optionalText(50),
  mobile: optionalText(50),
  birth_date: optionalDate,
  notes: optionalText(3000),
  is_primary: z.coerce.boolean().default(false),
});

export const opportunitySchema = z.object({
  customer_id: z.string().uuid("Der Kunde ist ungueltig."),
  title: requiredText("Titel", 180),
  description: optionalText(4000),
  stage: z.enum(["neu", "kontaktiert", "angebot", "verhandlung", "gewonnen", "verloren"]),
  probability: optionalInteger.transform((value) => Math.max(0, Math.min(100, value ?? 0))),
  expected_value: optionalNumber,
  actual_value: optionalNumber,
  owner_name: optionalText(120),
  expected_close_date: optionalDate,
  closed_at: optionalDate,
  tags: arrayField,
});

export const projectSchema = z.object({
  customer_id: z.string().uuid("Der Kunde ist ungueltig."),
  title: requiredText("Projekttitel", 180),
  description: optionalText(4000),
  status: z.enum(["geplant", "aktiv", "pausiert", "abgeschlossen"]).default("geplant"),
  priority: z.enum(["niedrig", "mittel", "hoch", "kritisch"]).default("mittel"),
  start_date: optionalDate,
  end_date: optionalDate,
  owner_name: optionalText(120),
  budget: optionalNumber,
  progress: optionalInteger.transform((value) => Math.max(0, Math.min(100, value ?? 0))),
  phase: optionalText(120),
});

export const taskSchema = z.object({
  customer_id: z.union([z.string().uuid(), z.literal(""), z.null(), z.undefined()]).transform((value) =>
    value || null,
  ),
  project_id: z.union([z.string().uuid(), z.literal(""), z.null(), z.undefined()]).transform((value) =>
    value || null,
  ),
  title: requiredText("Aufgabentitel", 180),
  description: optionalText(3000),
  priority: z.enum(["niedrig", "mittel", "hoch", "kritisch"]).default("mittel"),
  status: z.enum(["offen", "in_arbeit", "wartet", "erledigt"]).default("offen"),
  due_date: optionalDate,
  owner_name: optionalText(120),
  reminder_at: optionalDate,
  recurrence_rule: optionalText(30),
  recurrence_interval: optionalInteger,
  completed_at: optionalDate,
});

export const calendarEventSchema = z.object({
  customer_id: z.union([z.string().uuid(), z.literal(""), z.null(), z.undefined()]).transform((value) =>
    value || null,
  ),
  project_id: z.union([z.string().uuid(), z.literal(""), z.null(), z.undefined()]).transform((value) =>
    value || null,
  ),
  title: requiredText("Termin", 180),
  description: optionalText(3000),
  event_type: requiredText("Terminart", 80),
  location: optionalText(180),
  starts_at: requiredText("Startzeit", 40),
  ends_at: requiredText("Endzeit", 40),
  participants: arrayField,
  reminder_minutes: optionalInteger,
  recurrence_rule: optionalText(30),
});

export const activitySchema = z.object({
  customer_id: z.union([z.string().uuid(), z.literal(""), z.null(), z.undefined()]).transform((value) =>
    value || null,
  ),
  project_id: z.union([z.string().uuid(), z.literal(""), z.null(), z.undefined()]).transform((value) =>
    value || null,
  ),
  opportunity_id: z.union([z.string().uuid(), z.literal(""), z.null(), z.undefined()]).transform((value) =>
    value || null,
  ),
  task_id: z.union([z.string().uuid(), z.literal(""), z.null(), z.undefined()]).transform((value) =>
    value || null,
  ),
  activity_type: z.enum(["anruf", "email", "meeting", "notiz"]),
  title: requiredText("Titel", 180),
  description: optionalText(3000),
  starts_at: requiredText("Zeitpunkt", 40),
  duration_minutes: optionalInteger,
});

export const documentSchema = z.object({
  customer_id: z.union([z.string().uuid(), z.literal(""), z.null(), z.undefined()]).transform((value) =>
    value || null,
  ),
  project_id: z.union([z.string().uuid(), z.literal(""), z.null(), z.undefined()]).transform((value) =>
    value || null,
  ),
  title: requiredText("Dokumenttitel", 180),
  category: z.enum(["vertrag", "angebot", "rechnung", "projekt", "foto", "sonstiges"]),
});

const lineItemSchema = z.object({
  description: requiredText("Positionsbeschreibung", 240),
  quantity: optionalNumber.transform((value) => Math.max(0.01, value)),
  unit_price: optionalNumber.transform((value) => Math.max(0, value)),
  tax_rate: optionalNumber.transform((value) => Math.max(0, value)),
});

export const quoteSchema = z.object({
  customer_id: z.string().uuid("Der Kunde ist ungueltig."),
  title: requiredText("Angebotstitel", 180),
  status: z.enum(["entwurf", "versendet", "angenommen", "faellig", "bezahlt", "ueberfaellig", "storniert"]),
  issue_date: requiredText("Ausstellungsdatum", 40),
  valid_until: optionalDate,
  payment_terms: optionalText(500),
  currency: requiredText("Waehrung", 8).default("EUR"),
  tax_rate: optionalNumber,
  notes: optionalText(4000),
  items: z.array(lineItemSchema).min(1, "Mindestens eine Position ist erforderlich."),
});

export const invoiceSchema = z.object({
  customer_id: z.string().uuid("Der Kunde ist ungueltig."),
  source_quote_id: z.union([z.string().uuid(), z.literal(""), z.null(), z.undefined()]).transform((value) =>
    value || null,
  ),
  title: requiredText("Rechnungstitel", 180),
  status: z.enum(["entwurf", "versendet", "angenommen", "faellig", "bezahlt", "ueberfaellig", "storniert"]),
  issue_date: requiredText("Rechnungsdatum", 40),
  due_date: optionalDate,
  paid_at: optionalDate,
  payment_terms: optionalText(500),
  currency: requiredText("Waehrung", 8).default("EUR"),
  tax_rate: optionalNumber,
  notes: optionalText(4000),
  items: z.array(lineItemSchema).min(1, "Mindestens eine Position ist erforderlich."),
});

export const settingSchema = z.object({
  setting_group: requiredText("Gruppe", 80),
  setting_key: requiredText("Schluessel", 120),
  setting_value: z.record(z.any()).default({}),
  description: optionalText(1000),
});

export const resourceSchemas = {
  customers: customerSchema,
  contacts: contactSchema,
  opportunities: opportunitySchema,
  quotes: quoteSchema,
  invoices: invoiceSchema,
  projects: projectSchema,
  tasks: taskSchema,
  calendar_events: calendarEventSchema,
  documents: documentSchema,
  activities: activitySchema,
  settings: settingSchema,
} as const;
