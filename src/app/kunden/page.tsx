"use client";

import Link from "next/link";
import Papa from "papaparse";
import { Download, Upload } from "lucide-react";

import { EntityModulePage } from "@/components/crm/entity-module-page";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { moduleConfigs } from "@/config/modules";
import { useCrmResource } from "@/hooks/use-crm-resource";
import type { CustomerStatus } from "@/types/crm";

function normalizeCustomerStatus(value: string | undefined): CustomerStatus {
  const normalized = (value ?? "lead").toLowerCase();

  if (normalized === "aktiv" || normalized === "inaktiv") {
    return normalized;
  }

  return "lead";
}

export default function CustomersPage() {
  const resource = useCrmResource("customers");
  const duplicates = resource.records.filter((record) => {
    return (
      record.duplicate_hash &&
      resource.records.filter((candidate) => candidate.duplicate_hash === record.duplicate_hash).length > 1
    );
  });

  const importCsv = async (file: File) => {
    const text = await file.text();
    const parsed = Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
      delimiter: ";",
    });

    for (const row of parsed.data) {
      await resource.create({
        company_name: row.kunde ?? row.company_name ?? "",
        contact_name: row.ansprechpartner ?? "",
        email: row.email ?? "",
        phone: row.telefon ?? "",
        city: row.ort ?? "",
        industry: row.branche ?? "",
        status: normalizeCustomerStatus(row.status),
        tags: row.tags?.split(",").map((entry) => entry.trim()) ?? [],
      });
    }
  };

  return (
    <AppShell
      description="Import, Export, Suche, Statusfilter und Duplikaterkennung für Kunden- und Lead-Daten."
      title="Kunden"
    >
      <div className="space-y-4">
        {duplicates.length > 0 ? (
          <Card>
            <CardHeader
              description="Hash-basierte Erkennung über Firma, E-Mail und Telefon."
              title="Moegliche Duplikate"
            />
            <CardContent className="p-5 text-sm text-ink-700">
              {duplicates.map((record) => record.company_name).join(", ")}
            </CardContent>
          </Card>
        ) : null}

        <EntityModulePage
          config={moduleConfigs.customers}
          error={resource.error}
          loading={resource.loading}
          onCreate={resource.create}
          onDelete={resource.remove}
          onUpdate={resource.update}
          records={resource.records}
          rowActions={(record) => (
            <Link
              className="focus-ring inline-flex items-center gap-2 rounded-2xl bg-ink-100 px-3 py-2 text-sm font-semibold text-ink-800"
              href={`/api/export/data-subject/${record.id}`}
            >
              <Download className="h-4 w-4" />
              DSGVO
            </Link>
          )}
          topActions={
            <>
              <Link
                className="focus-ring inline-flex items-center gap-2 rounded-2xl bg-ink-100 px-4 py-2.5 text-sm font-semibold text-ink-800"
                href="/api/export/customers/csv"
              >
                <Download className="h-4 w-4" />
                CSV Export
              </Link>
              <Link
                className="focus-ring inline-flex items-center gap-2 rounded-2xl bg-ink-100 px-4 py-2.5 text-sm font-semibold text-ink-800"
                href="/kunden/druck"
                rel="noreferrer"
                target="_blank"
              >
                <Download className="h-4 w-4" />
                PDF Ansicht
              </Link>
              <label className="focus-ring inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-ink-100 px-4 py-2.5 text-sm font-semibold text-ink-800">
                <Upload className="h-4 w-4" />
                CSV Import
                <input
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      void importCsv(file);
                    }
                  }}
                  type="file"
                />
              </label>
            </>
          }
        />
      </div>
    </AppShell>
  );
}
