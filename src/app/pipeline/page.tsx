"use client";

import { EntityModulePage } from "@/components/crm/entity-module-page";
import { AppShell } from "@/components/layout/app-shell";
import { moduleConfigs } from "@/config/modules";
import { useCrmResource } from "@/hooks/use-crm-resource";

export default function PipelinePage() {
  const resource = useCrmResource("opportunities");

  return (
    <AppShell
      description="Vertriebspipeline mit anpassbaren Stufen, Forecast und Drag-and-Drop im Board."
      title="Pipeline"
    >
      <EntityModulePage
        config={moduleConfigs.opportunities}
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

