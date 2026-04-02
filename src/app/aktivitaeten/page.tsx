"use client";

import { EntityModulePage } from "@/components/crm/entity-module-page";
import { AppShell } from "@/components/layout/app-shell";
import { moduleConfigs } from "@/config/modules";
import { useCrmResource } from "@/hooks/use-crm-resource";

export default function ActivitiesPage() {
  const resource = useCrmResource("activities");

  return (
    <AppShell
      description="Kundenhistorie fuer Anrufe, Meetings, Mails und Schnellnotizen."
      title="Aktivitäten"
    >
      <EntityModulePage
        config={moduleConfigs.activities}
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
