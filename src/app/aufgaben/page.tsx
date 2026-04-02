"use client";

import { EntityModulePage } from "@/components/crm/entity-module-page";
import { AppShell } from "@/components/layout/app-shell";
import { moduleConfigs } from "@/config/modules";
import { useCrmResource } from "@/hooks/use-crm-resource";

export default function TasksPage() {
  const resource = useCrmResource("tasks");

  return (
    <AppShell
      description="Kanban, Erinnerungen und Wiederholungslogik für operative Aufgaben im Team."
      title="Aufgaben"
    >
      <EntityModulePage
        config={moduleConfigs.tasks}
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
