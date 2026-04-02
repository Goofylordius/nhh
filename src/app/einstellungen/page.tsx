"use client";

import { useMemo, useState } from "react";

import { EntityModulePage } from "@/components/crm/entity-module-page";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { moduleConfigs } from "@/config/modules";
import { useCrmResource } from "@/hooks/use-crm-resource";
import { useAppContext } from "@/providers/app-provider";

export default function SettingsPage() {
  const resource = useCrmResource("settings");
  const { actorLabel, setActorLabel } = useAppContext();
  const [actorDraft, setActorDraft] = useState(actorLabel);

  const firmData = useMemo(
    () => resource.records.find((entry) => entry.setting_group === "firma"),
    [resource.records],
  );

  return (
    <AppShell
      description="Firmendaten, Pipeline, Tags und Compliance-Hinweise für DSGVO und GoBD."
      title="Einstellungen"
    >
      <div className="space-y-4">
        <div className="grid gap-4 xl:grid-cols-[1.2fr,1fr]">
          <Card>
            <CardHeader
              description="Phase 1 ohne Login. Der Bearbeitername wird in Audit-Einträgen gespeichert."
              title="Arbeitsplatz / Bearbeiter"
            />
            <CardContent className="space-y-4 p-5">
              <Input onChange={(event) => setActorDraft(event.target.value)} value={actorDraft} />
              <button
                className="focus-ring rounded-2xl bg-mint-500 px-4 py-2.5 text-sm font-semibold text-white"
                onClick={() => setActorLabel(actorDraft)}
                type="button"
              >
                Bearbeiter speichern
              </button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader description="Vorlage für interne Dokumentation." title="DSGVO / GoBD Kurzleitfaden" />
            <CardContent className="space-y-3 p-5 text-sm text-ink-700">
              <p>Datenminimierung: Nur benoetigte Kunden- und Projektdaten werden gespeichert.</p>
              <p>Löschkonzept: Soft-Delete über `deleted_at`, Export für Betroffenenrechte per JSON-Endpunkt.</p>
              <p>Nachvollziehbarkeit: Audit-Trigger speichern INSERT, UPDATE und DELETE in `audit_logs`.</p>
              <p>Unveraenderbarkeit: `audit_logs` lassen sich per Trigger nicht aktualisieren oder loeschen.</p>
              {firmData ? <p>Aktive Firmenvorlage: {JSON.stringify(firmData.setting_value)}</p> : null}
            </CardContent>
          </Card>
        </div>

        <EntityModulePage
          config={moduleConfigs.settings}
          error={resource.error}
          loading={resource.loading}
          onCreate={resource.create}
          onDelete={resource.remove}
          onUpdate={resource.update}
          records={resource.records}
        />
      </div>
    </AppShell>
  );
}
