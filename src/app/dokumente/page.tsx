"use client";

import { DocumentsModulePage } from "@/components/crm/documents-module-page";
import { AppShell } from "@/components/layout/app-shell";
import { useCrmResource } from "@/hooks/use-crm-resource";
import { fetchJson } from "@/lib/fetcher";
import { useAppContext } from "@/providers/app-provider";

export default function DocumentsPage() {
  const resource = useCrmResource("documents");
  const { actorLabel } = useAppContext();

  return (
    <AppShell
      description="Dokumentenarchiv mit Upload nach Supabase Storage, Kategorisierung und Download."
      title="Dokumente"
    >
      <DocumentsModulePage
        error={resource.error}
        loading={resource.loading}
        onDelete={resource.remove}
        onUpdate={resource.update}
        onUpload={async (payload) => {
          await fetchJson("/api/documents/upload", {
            method: "POST",
            body: payload,
            headers: {
              "X-Actor-Label": actorLabel,
            },
          });
          await resource.reload();
        }}
        records={resource.records}
      />
    </AppShell>
  );
}

