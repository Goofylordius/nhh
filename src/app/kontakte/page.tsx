"use client";

import { Mail, Phone } from "lucide-react";

import { EntityModulePage } from "@/components/crm/entity-module-page";
import { AppShell } from "@/components/layout/app-shell";
import { moduleConfigs } from "@/config/modules";
import { useCrmResource } from "@/hooks/use-crm-resource";

export default function ContactsPage() {
  const resource = useCrmResource("contacts");

  return (
    <AppShell
      description="Mehrere Ansprechpartner pro Kunde mit direktem Start von E-Mail und Telefon."
      title="Kontakte"
    >
      <EntityModulePage
        config={moduleConfigs.contacts}
        error={resource.error}
        loading={resource.loading}
        onCreate={resource.create}
        onDelete={resource.remove}
        onUpdate={resource.update}
        records={resource.records}
        rowActions={(record) => (
          <>
            {record.email ? (
              <a
                className="focus-ring inline-flex items-center gap-2 rounded-2xl bg-ink-100 px-3 py-2 text-sm font-semibold text-ink-800"
                href={`mailto:${record.email}`}
              >
                <Mail className="h-4 w-4" />
                E-Mail
              </a>
            ) : null}
            {record.phone ? (
              <a
                className="focus-ring inline-flex items-center gap-2 rounded-2xl bg-ink-100 px-3 py-2 text-sm font-semibold text-ink-800"
                href={`tel:${record.phone}`}
              >
                <Phone className="h-4 w-4" />
                Anrufen
              </a>
            ) : null}
          </>
        )}
      />
    </AppShell>
  );
}

