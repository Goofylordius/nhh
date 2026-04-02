"use client";

import { CalendarModulePage } from "@/components/crm/calendar-module-page";
import { AppShell } from "@/components/layout/app-shell";
import { useCrmResource } from "@/hooks/use-crm-resource";
import type { ResourceRecordMap } from "@/types/crm";

type CalendarEventRecord = ResourceRecordMap["calendar_events"];

export default function CalendarPage() {
  const resource = useCrmResource("calendar_events");

  return (
    <AppShell
      description="Kalender für Einsätze, Meetings und Termine mit Monats- und Wochenansicht."
      title="Kalender"
    >
      <CalendarModulePage
        error={resource.error}
        loading={resource.loading}
        onCreate={async (payload) => {
          await resource.create(payload as Partial<CalendarEventRecord>);
        }}
        onDelete={resource.remove}
        onUpdate={async (id, payload) => {
          await resource.update(id, payload as Partial<CalendarEventRecord>);
        }}
        records={resource.records}
      />
    </AppShell>
  );
}
