"use client";

import { BillingModulePage } from "@/components/crm/billing-module-page";
import { AppShell } from "@/components/layout/app-shell";
import { useCrmResource } from "@/hooks/use-crm-resource";

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
        onCreate={invoiceResource.create}
        onDelete={invoiceResource.remove}
        onUpdate={invoiceResource.update}
        records={invoiceResource.records}
        resource="invoices"
        singular="Rechnung"
      />
    </AppShell>
  );
}

