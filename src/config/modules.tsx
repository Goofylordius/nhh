"use client";

import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import {
  activityTypeOptions,
  customerStatusOptions,
  priorityOptions,
  projectStatusOptions,
  taskStatusOptions,
} from "@/config/options";
import { compactDate, compactDateTime, euro, percent } from "@/lib/utils";
import type { BootstrapPayload, ResourceKey } from "@/types/crm";

export type FieldType =
  | "text"
  | "email"
  | "tel"
  | "url"
  | "textarea"
  | "select"
  | "date"
  | "datetime-local"
  | "number"
  | "currency"
  | "tags"
  | "checkbox"
  | "json";

export interface ModuleField {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
  optionsFrom?: keyof Pick<
    BootstrapPayload,
    "customers" | "projects" | "opportunities" | "contacts"
  >;
  valueKey?: string;
  labelKey?: string;
  placeholder?: string;
  description?: string;
  gridSpan?: "full" | "half";
}

export interface ModuleColumn {
  key: string;
  label: string;
  render?: (
    record: Record<string, unknown>,
    bootstrap: BootstrapPayload | null,
  ) => ReactNode;
}

export interface ModuleStat {
  label: string;
  getValue: (records: Array<Record<string, unknown>>) => ReactNode;
}

export interface ModuleConfig {
  resource: ResourceKey;
  label: string;
  singular: string;
  description: string;
  fields: ModuleField[];
  columns: ModuleColumn[];
  defaultValues: Record<string, unknown>;
  searchKeys: string[];
  filterKey?: string;
  stats: ModuleStat[];
  kanbanKey?: string;
  kanbanOptions?: Array<{ label: string; value: string }>;
}

function toneFromStatus(value: string) {
  if (["aktiv", "gewonnen", "bezahlt", "erledigt", "abgeschlossen"].includes(value)) {
    return "success" as const;
  }

  if (["kritisch", "verloren", "überfällig", "storniert"].includes(value)) {
    return "danger" as const;
  }

  if (["lead", "neu", "offen", "geplant", "fällig"].includes(value)) {
    return "warning" as const;
  }

  return "default" as const;
}

function findLabel(
  collection:
    | BootstrapPayload["customers"]
    | BootstrapPayload["projects"]
    | BootstrapPayload["opportunities"]
    | BootstrapPayload["contacts"],
  id: string | null | undefined,
  key: "company_name" | "title" | "first_name",
) {
  if (!id) {
    return "-";
  }

  const entry = collection.find((record) => record.id === id);
  if (!entry) {
    return "-";
  }

  if (key === "first_name") {
    const contact = entry as BootstrapPayload["contacts"][number];
    return `${contact.first_name} ${contact.last_name}`;
  }

  return String(((entry as unknown) as Record<string, unknown>)[key] ?? "-");
}

export const moduleConfigs: Record<
  Extract<
    ResourceKey,
    "customers" | "contacts" | "projects" | "tasks" | "activities" | "settings" | "opportunities"
  >,
  ModuleConfig
> = {
  customers: {
    resource: "customers",
    label: "Kundenverwaltung",
    singular: "Kunde",
    description: "Leads, Stammkunden und Inaktive mit DSGVO-konformer Historie.",
    defaultValues: {
      status: "lead",
      country: "Deutschland",
      tags: [],
    },
    searchKeys: ["company_name", "contact_name", "email", "phone", "industry", "city"],
    filterKey: "status",
    stats: [
      { label: "Gesamt", getValue: (records) => records.length },
      {
        label: "Aktiv",
        getValue: (records) =>
          records.filter((record) => record.status === "aktiv").length,
      },
      {
        label: "Leads",
        getValue: (records) =>
          records.filter((record) => record.status === "lead").length,
      },
      {
        label: "Tags",
        getValue: (records) =>
          new Set(
            records.flatMap((record) =>
              Array.isArray(record.tags) ? (record.tags as string[]) : [],
            ),
          ).size,
      },
    ],
    fields: [
      { key: "company_name", label: "Firma / Name", type: "text", required: true },
      { key: "contact_name", label: "Ansprechpartner", type: "text" },
      { key: "status", label: "Status", type: "select", options: customerStatusOptions },
      { key: "industry", label: "Branche", type: "text" },
      { key: "email", label: "E-Mail", type: "email" },
      { key: "phone", label: "Telefon", type: "tel" },
      { key: "website", label: "Website", type: "url" },
      { key: "address_line1", label: "Adresse", type: "text", gridSpan: "full" },
      { key: "address_line2", label: "Adresszusatz", type: "text", gridSpan: "full" },
      { key: "postal_code", label: "PLZ", type: "text" },
      { key: "city", label: "Ort", type: "text" },
      { key: "state", label: "Bundesland", type: "text" },
      { key: "country", label: "Land", type: "text" },
      { key: "tags", label: "Tags", type: "tags", gridSpan: "full" },
      { key: "notes", label: "Notizen", type: "textarea", gridSpan: "full" },
    ],
    columns: [
      { key: "company_name", label: "Kunde" },
      { key: "contact_name", label: "Ansprechpartner" },
      {
        key: "status",
        label: "Status",
        render: (record) => (
          <Badge tone={toneFromStatus(String(record.status ?? ""))}>
            {String(record.status ?? "-")}
          </Badge>
        ),
      },
      { key: "industry", label: "Branche" },
      { key: "email", label: "E-Mail" },
      { key: "phone", label: "Telefon" },
      { key: "city", label: "Ort" },
      {
        key: "tags",
        label: "Tags",
        render: (record) =>
          Array.isArray(record.tags) && record.tags.length > 0
            ? (record.tags as string[]).join(", ")
            : "-",
      },
    ],
  },
  contacts: {
    resource: "contacts",
    label: "Kontakte",
    singular: "Kontakt",
    description:
      "Mehrere Kontaktpersonen je Kunde mit Schnellaktionen fürs Tagesgeschäft.",
    defaultValues: {
      is_primary: false,
    },
    searchKeys: ["first_name", "last_name", "email", "phone", "mobile", "role_title"],
    stats: [
      { label: "Gesamt", getValue: (records) => records.length },
      {
        label: "Primär",
        getValue: (records) =>
          records.filter((record) => Boolean(record.is_primary)).length,
      },
      {
        label: "Mit E-Mail",
        getValue: (records) =>
          records.filter((record) => Boolean(record.email)).length,
      },
      {
        label: "Mit Mobil",
        getValue: (records) =>
          records.filter((record) => Boolean(record.mobile)).length,
      },
    ],
    fields: [
      {
        key: "customer_id",
        label: "Kunde",
        type: "select",
        required: true,
        optionsFrom: "customers",
        labelKey: "company_name",
        valueKey: "id",
      },
      { key: "first_name", label: "Vorname", type: "text", required: true },
      { key: "last_name", label: "Nachname", type: "text", required: true },
      { key: "role_title", label: "Rolle / Position", type: "text" },
      { key: "email", label: "E-Mail", type: "email" },
      { key: "phone", label: "Telefon", type: "tel" },
      { key: "mobile", label: "Mobil", type: "tel" },
      { key: "birth_date", label: "Geburtsdatum", type: "date" },
      { key: "is_primary", label: "Hauptkontakt", type: "checkbox", gridSpan: "full" },
      { key: "notes", label: "Notizen", type: "textarea", gridSpan: "full" },
    ],
    columns: [
      {
        key: "name",
        label: "Kontaktperson",
        render: (record) => `${record.first_name ?? ""} ${record.last_name ?? ""}`.trim(),
      },
      {
        key: "customer_id",
        label: "Kunde",
        render: (record, bootstrap) =>
          bootstrap
            ? findLabel(bootstrap.customers, String(record.customer_id ?? ""), "company_name")
            : "-",
      },
      { key: "role_title", label: "Rolle" },
      { key: "email", label: "E-Mail" },
      { key: "phone", label: "Telefon" },
      { key: "mobile", label: "Mobil" },
      {
        key: "is_primary",
        label: "Typ",
        render: (record) =>
          Boolean(record.is_primary) ? (
            <Badge tone="success">Hauptkontakt</Badge>
          ) : (
            <Badge>Kontakt</Badge>
          ),
      },
    ],
  },
  opportunities: {
    resource: "opportunities",
    label: "Pipeline & Opportunities",
    singular: "Opportunity",
    description: "Kanban-Pipeline mit Forecast, Wahrscheinlichkeiten und Abschlussanalyse.",
    defaultValues: {
      stage: "neu",
      probability: 20,
      expected_value: 0,
      actual_value: 0,
      tags: [],
    },
    searchKeys: ["title", "owner_name", "description"],
    filterKey: "stage",
    kanbanKey: "stage",
    kanbanOptions: [
      { label: "Neu", value: "neu" },
      { label: "Kontaktiert", value: "kontaktiert" },
      { label: "Angebot", value: "angebot" },
      { label: "Verhandlung", value: "verhandlung" },
      { label: "Gewonnen", value: "gewonnen" },
      { label: "Verloren", value: "verloren" },
    ],
    stats: [
      {
        label: "Offene Pipeline",
        getValue: (records) =>
          euro(records.reduce((sum, record) => sum + Number(record.expected_value ?? 0), 0)),
      },
      {
        label: "Gewonnen",
        getValue: (records) =>
          euro(
            records
              .filter((record) => record.stage === "gewonnen")
              .reduce((sum, record) => sum + Number(record.actual_value ?? 0), 0),
          ),
      },
      {
        label: "Offene Deals",
        getValue: (records) =>
          records.filter((record) => !["gewonnen", "verloren"].includes(String(record.stage)))
            .length,
      },
      {
        label: "Durchschn. Quote",
        getValue: (records) =>
          percent(
            records.length > 0
              ? Math.round(
                  records.reduce((sum, record) => sum + Number(record.probability ?? 0), 0) /
                    records.length,
                )
              : 0,
          ),
      },
    ],
    fields: [
      {
        key: "customer_id",
        label: "Kunde",
        type: "select",
        required: true,
        optionsFrom: "customers",
        labelKey: "company_name",
        valueKey: "id",
      },
      { key: "title", label: "Titel", type: "text", required: true },
      {
        key: "stage",
        label: "Stage",
        type: "select",
        options: [
          { label: "Neu", value: "neu" },
          { label: "Kontaktiert", value: "kontaktiert" },
          { label: "Angebot", value: "angebot" },
          { label: "Verhandlung", value: "verhandlung" },
          { label: "Gewonnen", value: "gewonnen" },
          { label: "Verloren", value: "verloren" },
        ],
      },
      { key: "probability", label: "Wahrscheinlichkeit %", type: "number" },
      { key: "expected_value", label: "Erwarteter Umsatz", type: "currency" },
      { key: "actual_value", label: "Tatsächlicher Umsatz", type: "currency" },
      { key: "owner_name", label: "Verantwortlich", type: "text" },
      { key: "expected_close_date", label: "Geplanter Abschluss", type: "date" },
      { key: "tags", label: "Tags", type: "tags", gridSpan: "full" },
      { key: "description", label: "Notizen", type: "textarea", gridSpan: "full" },
    ],
    columns: [
      { key: "title", label: "Opportunity" },
      {
        key: "customer_id",
        label: "Kunde",
        render: (record, bootstrap) =>
          bootstrap
            ? findLabel(bootstrap.customers, String(record.customer_id ?? ""), "company_name")
            : "-",
      },
      {
        key: "stage",
        label: "Stage",
        render: (record) => (
          <Badge tone={toneFromStatus(String(record.stage ?? ""))}>
            {String(record.stage ?? "-")}
          </Badge>
        ),
      },
      {
        key: "probability",
        label: "Quote",
        render: (record) => percent(Number(record.probability ?? 0)),
      },
      {
        key: "expected_value",
        label: "Erwartet",
        render: (record) => euro(Number(record.expected_value ?? 0)),
      },
      {
        key: "actual_value",
        label: "Ist",
        render: (record) => euro(Number(record.actual_value ?? 0)),
      },
      { key: "owner_name", label: "Owner" },
    ],
  },
  projects: {
    resource: "projects",
    label: "Projekte",
    singular: "Projekt",
    description: "Status, Phasen, Budget und Fortschritt für aktive Auftragsarbeiten.",
    defaultValues: {
      status: "geplant",
      priority: "mittel",
      budget: 0,
      progress: 0,
    },
    searchKeys: ["title", "owner_name", "phase", "description"],
    filterKey: "status",
    stats: [
      { label: "Gesamt", getValue: (records) => records.length },
      {
        label: "Aktiv",
        getValue: (records) =>
          records.filter((record) => record.status === "aktiv").length,
      },
      {
        label: "Budget",
        getValue: (records) =>
          euro(records.reduce((sum, record) => sum + Number(record.budget ?? 0), 0)),
      },
      {
        label: "Fortschritt",
        getValue: (records) =>
          percent(
            records.length > 0
              ? Math.round(
                  records.reduce((sum, record) => sum + Number(record.progress ?? 0), 0) /
                    records.length,
                )
              : 0,
          ),
      },
    ],
    fields: [
      {
        key: "customer_id",
        label: "Kunde",
        type: "select",
        required: true,
        optionsFrom: "customers",
        labelKey: "company_name",
        valueKey: "id",
      },
      { key: "title", label: "Projekt", type: "text", required: true },
      { key: "status", label: "Status", type: "select", options: projectStatusOptions },
      { key: "priority", label: "Priorität", type: "select", options: priorityOptions },
      { key: "phase", label: "Phase", type: "text" },
      { key: "owner_name", label: "Verantwortlich", type: "text" },
      { key: "start_date", label: "Start", type: "date" },
      { key: "end_date", label: "Ende", type: "date" },
      { key: "budget", label: "Budget", type: "currency" },
      { key: "progress", label: "Fortschritt %", type: "number" },
      { key: "description", label: "Beschreibung", type: "textarea", gridSpan: "full" },
    ],
    columns: [
      { key: "title", label: "Projekt" },
      {
        key: "customer_id",
        label: "Kunde",
        render: (record, bootstrap) =>
          bootstrap
            ? findLabel(bootstrap.customers, String(record.customer_id ?? ""), "company_name")
            : "-",
      },
      {
        key: "status",
        label: "Status",
        render: (record) => (
          <Badge tone={toneFromStatus(String(record.status ?? ""))}>
            {String(record.status ?? "-")}
          </Badge>
        ),
      },
      {
        key: "priority",
        label: "Priorität",
        render: (record) => (
          <Badge tone={String(record.priority) === "kritisch" ? "danger" : "default"}>
            {String(record.priority ?? "-")}
          </Badge>
        ),
      },
      { key: "phase", label: "Phase" },
      { key: "owner_name", label: "Verantwortlich" },
      {
        key: "budget",
        label: "Budget",
        render: (record) => euro(Number(record.budget ?? 0)),
      },
      {
        key: "progress",
        label: "Fortschritt",
        render: (record) => percent(Number(record.progress ?? 0)),
      },
    ],
  },
  tasks: {
    resource: "tasks",
    label: "Aufgaben",
    singular: "Aufgabe",
    description: "Liste, Board und Erinnerungen für wiederkehrende oder terminierte Aufgaben.",
    defaultValues: {
      priority: "mittel",
      status: "offen",
      recurrence_interval: 1,
    },
    searchKeys: ["title", "description", "owner_name", "recurrence_rule"],
    filterKey: "status",
    kanbanKey: "status",
    kanbanOptions: taskStatusOptions,
    stats: [
      { label: "Gesamt", getValue: (records) => records.length },
      {
        label: "Offen",
        getValue: (records) =>
          records.filter((record) => record.status === "offen").length,
      },
      {
        label: "Heute fällig",
        getValue: (records) => {
          const today = new Date().toISOString().slice(0, 10);
          return records.filter((record) => String(record.due_date ?? "").startsWith(today))
            .length;
        },
      },
      {
        label: "Kritisch",
        getValue: (records) =>
          records.filter((record) => record.priority === "kritisch").length,
      },
    ],
    fields: [
      {
        key: "customer_id",
        label: "Kunde",
        type: "select",
        optionsFrom: "customers",
        labelKey: "company_name",
        valueKey: "id",
      },
      {
        key: "project_id",
        label: "Projekt",
        type: "select",
        optionsFrom: "projects",
        labelKey: "title",
        valueKey: "id",
      },
      { key: "title", label: "Aufgabe", type: "text", required: true },
      { key: "priority", label: "Priorität", type: "select", options: priorityOptions },
      { key: "status", label: "Status", type: "select", options: taskStatusOptions },
      { key: "owner_name", label: "Verantwortlich", type: "text" },
      { key: "due_date", label: "Fälligkeit", type: "datetime-local" },
      { key: "reminder_at", label: "Erinnerung", type: "datetime-local" },
      { key: "recurrence_rule", label: "Wiederholung", type: "text" },
      { key: "recurrence_interval", label: "Intervall", type: "number" },
      { key: "description", label: "Beschreibung", type: "textarea", gridSpan: "full" },
    ],
    columns: [
      { key: "title", label: "Aufgabe" },
      {
        key: "project_id",
        label: "Projekt",
        render: (record, bootstrap) =>
          bootstrap
            ? findLabel(bootstrap.projects, String(record.project_id ?? ""), "title")
            : "-",
      },
      {
        key: "status",
        label: "Status",
        render: (record) => (
          <Badge tone={toneFromStatus(String(record.status ?? ""))}>
            {String(record.status ?? "-")}
          </Badge>
        ),
      },
      {
        key: "priority",
        label: "Priorität",
        render: (record) => (
          <Badge tone={String(record.priority) === "kritisch" ? "danger" : "default"}>
            {String(record.priority ?? "-")}
          </Badge>
        ),
      },
      {
        key: "due_date",
        label: "Fällig",
        render: (record) => compactDateTime(String(record.due_date ?? "")),
      },
      { key: "owner_name", label: "Verantwortlich" },
      { key: "recurrence_rule", label: "Wiederholung" },
    ],
  },
  activities: {
    resource: "activities",
    label: "Aktivitäten",
    singular: "Aktivität",
    description: "Chronologischer Kundenfeed für Anrufe, Meetings, Mails und Notizen.",
    defaultValues: {
      activity_type: "notiz",
      starts_at: new Date().toISOString().slice(0, 16),
      duration_minutes: 15,
    },
    searchKeys: ["title", "description", "activity_type"],
    filterKey: "activity_type",
    stats: [
      { label: "Gesamt", getValue: (records) => records.length },
      {
        label: "Meetings",
        getValue: (records) =>
          records.filter((record) => record.activity_type === "meeting").length,
      },
      {
        label: "Anrufe",
        getValue: (records) =>
          records.filter((record) => record.activity_type === "anruf").length,
      },
      {
        label: "Diese Woche",
        getValue: (records) => {
          const threshold = new Date();
          threshold.setDate(threshold.getDate() - 7);
          return records.filter((record) => new Date(String(record.starts_at)) >= threshold)
            .length;
        },
      },
    ],
    fields: [
      { key: "activity_type", label: "Typ", type: "select", options: activityTypeOptions },
      { key: "title", label: "Titel", type: "text", required: true },
      {
        key: "customer_id",
        label: "Kunde",
        type: "select",
        optionsFrom: "customers",
        labelKey: "company_name",
        valueKey: "id",
      },
      {
        key: "project_id",
        label: "Projekt",
        type: "select",
        optionsFrom: "projects",
        labelKey: "title",
        valueKey: "id",
      },
      { key: "starts_at", label: "Datum / Uhrzeit", type: "datetime-local", required: true },
      { key: "duration_minutes", label: "Dauer in Min.", type: "number" },
      { key: "description", label: "Beschreibung", type: "textarea", gridSpan: "full" },
    ],
    columns: [
      {
        key: "activity_type",
        label: "Typ",
        render: (record) => <Badge>{String(record.activity_type ?? "-")}</Badge>,
      },
      { key: "title", label: "Titel" },
      {
        key: "customer_id",
        label: "Kunde",
        render: (record, bootstrap) =>
          bootstrap
            ? findLabel(bootstrap.customers, String(record.customer_id ?? ""), "company_name")
            : "-",
      },
      {
        key: "project_id",
        label: "Projekt",
        render: (record, bootstrap) =>
          bootstrap
            ? findLabel(bootstrap.projects, String(record.project_id ?? ""), "title")
            : "-",
      },
      {
        key: "starts_at",
        label: "Zeitpunkt",
        render: (record) => compactDateTime(String(record.starts_at ?? "")),
      },
      {
        key: "duration_minutes",
        label: "Dauer",
        render: (record) => `${record.duration_minutes ?? 0} Min.`,
      },
    ],
  },
  settings: {
    resource: "settings",
    label: "Einstellungen",
    singular: "Einstellung",
    description: "Firmendaten, Tags, Pipeline-Stages und Stammdaten für den Demo-Betrieb.",
    defaultValues: {
      setting_group: "firma",
      setting_value: {
        value: "",
      },
    },
    searchKeys: ["setting_group", "setting_key", "description"],
    filterKey: "setting_group",
    stats: [
      { label: "Einträge", getValue: (records) => records.length },
      {
        label: "Gruppen",
        getValue: (records) =>
          new Set(records.map((record) => record.setting_group)).size,
      },
      {
        label: "Pipeline",
        getValue: (records) =>
          records.filter((record) => record.setting_group === "pipeline").length,
      },
      {
        label: "Tags",
        getValue: (records) =>
          records.filter((record) => record.setting_group === "tags").length,
      },
    ],
    fields: [
      { key: "setting_group", label: "Gruppe", type: "text", required: true },
      { key: "setting_key", label: "Schlüssel", type: "text", required: true },
      { key: "description", label: "Beschreibung", type: "text", gridSpan: "full" },
      {
        key: "setting_value",
        label: "Wert (JSON)",
        type: "json",
        gridSpan: "full",
        required: true,
      },
    ],
    columns: [
      { key: "setting_group", label: "Gruppe" },
      { key: "setting_key", label: "Schlüssel" },
      {
        key: "setting_value",
        label: "Wert",
        render: (record) => JSON.stringify(record.setting_value ?? {}),
      },
      { key: "description", label: "Beschreibung" },
      {
        key: "updated_at",
        label: "Aktualisiert",
        render: (record) => compactDate(String(record.updated_at ?? "")),
      },
    ],
  },
};
