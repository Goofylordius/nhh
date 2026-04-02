import type {
  ActivityType,
  BillingStatus,
  CustomerStatus,
  DocumentCategory,
  OpportunityStage,
  Priority,
  ProjectStatus,
  TaskStatus,
} from "@/types/crm";

export const customerStatusOptions: Array<{ label: string; value: CustomerStatus }> = [
  { label: "Lead", value: "lead" },
  { label: "Aktiv", value: "aktiv" },
  { label: "Inaktiv", value: "inaktiv" },
];

export const opportunityStageOptions: Array<{ label: string; value: OpportunityStage }> = [
  { label: "Neu", value: "neu" },
  { label: "Kontaktiert", value: "kontaktiert" },
  { label: "Angebot", value: "angebot" },
  { label: "Verhandlung", value: "verhandlung" },
  { label: "Gewonnen", value: "gewonnen" },
  { label: "Verloren", value: "verloren" },
];

export const billingStatusOptions: Array<{ label: string; value: BillingStatus }> = [
  { label: "Entwurf", value: "entwurf" },
  { label: "Versendet", value: "versendet" },
  { label: "Angenommen", value: "angenommen" },
  { label: "Fällig", value: "faellig" },
  { label: "Bezahlt", value: "bezahlt" },
  { label: "Überfällig", value: "ueberfaellig" },
  { label: "Storniert", value: "storniert" },
];

export const projectStatusOptions: Array<{ label: string; value: ProjectStatus }> = [
  { label: "Geplant", value: "geplant" },
  { label: "Aktiv", value: "aktiv" },
  { label: "Pausiert", value: "pausiert" },
  { label: "Abgeschlossen", value: "abgeschlossen" },
];

export const priorityOptions: Array<{ label: string; value: Priority }> = [
  { label: "Niedrig", value: "niedrig" },
  { label: "Mittel", value: "mittel" },
  { label: "Hoch", value: "hoch" },
  { label: "Kritisch", value: "kritisch" },
];

export const taskStatusOptions: Array<{ label: string; value: TaskStatus }> = [
  { label: "Offen", value: "offen" },
  { label: "In Arbeit", value: "in_arbeit" },
  { label: "Wartet", value: "wartet" },
  { label: "Erledigt", value: "erledigt" },
];

export const activityTypeOptions: Array<{ label: string; value: ActivityType }> = [
  { label: "Anruf", value: "anruf" },
  { label: "E-Mail", value: "email" },
  { label: "Meeting", value: "meeting" },
  { label: "Notiz", value: "notiz" },
];

export const documentCategoryOptions: Array<{
  label: string;
  value: DocumentCategory;
}> = [
  { label: "Vertrag", value: "vertrag" },
  { label: "Angebot", value: "angebot" },
  { label: "Rechnung", value: "rechnung" },
  { label: "Projekt", value: "projekt" },
  { label: "Foto", value: "foto" },
  { label: "Sonstiges", value: "sonstiges" },
];

export const recurrenceOptions = [
  { label: "Keine Wiederholung", value: "" },
  { label: "Täglich", value: "daily" },
  { label: "Wöchentlich", value: "weekly" },
  { label: "Monatlich", value: "monthly" },
];
