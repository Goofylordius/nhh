"use client";

import { BillingModulePage } from "@/components/crm/billing-module-page";
import { AppShell } from "@/components/layout/app-shell";
import { useCrmResource } from "@/hooks/use-crm-resource";
import type { ResourceRecordMap } from "@/types/crm";

type InvoiceRecord = ResourceRecordMap["invoices"];

export default function InvoicesPage() {
  const invoiceResource = useCrmResource("invoices");

  return (
    <AppShell
      description="Rechnungen mit Faelligkeit, Zahlungsstatus, Druckansicht und Steuerberechnung."
      title="Rechnungen"
    >
      <BillingModulePage
        error={invoiceResource.error}
        label="Rechnungen"
        loading={invoiceResource.loading}
        onCreate={async (payload) => {
          await invoiceResource.create(payload as Partial<InvoiceRecord>);
        }}
        onDelete={invoiceResource.remove}
        onUpdate={async (id, payload) => {
          await invoiceResource.update(id, payload as Partial<InvoiceRecord>);
        }}
        records={invoiceResource.records}
        resource="invoices"
        singular="Rechnung"
      />
    </AppShell>
  );
}
