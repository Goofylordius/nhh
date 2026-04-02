"use client";

import { CalendarModulePage } from "@/components/crm/calendar-module-page";
import { AppShell } from "@/components/layout/app-shell";
import { useCrmResource } from "@/hooks/use-crm-resource";

export default function CalendarPage() {
  const resource = useCrmResource("calendar_events");

  return (
    <AppShell
      description="Kalender fuer Einsaetze, Meetings und Termine mit Monats- und Wochenansicht."
      title="Kalender"
    >
      <CalendarModulePage
        error={resource.error}
        loading={resource.loading}
        onCreate={resource.create}
        onDelete={resource.remove}
        onUpdate={resource.update}
        records={resource.records}
      />
    </AppShell>
  );
}

