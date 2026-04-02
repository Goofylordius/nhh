"use client";

import { EntityModulePage } from "@/components/crm/entity-module-page";
import { AppShell } from "@/components/layout/app-shell";
import { moduleConfigs } from "@/config/modules";
import { useCrmResource } from "@/hooks/use-crm-resource";

export default function ProjectsPage() {
  const resource = useCrmResource("projects");

  return (
    <AppShell
      description="Projektuebersicht fuer aktive Auftraege, Phasen, Budgets und Fertigstellungsgrad."
      title="Projekte"
    >
      <EntityModulePage
        config={moduleConfigs.projects}
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

