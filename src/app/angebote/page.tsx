"use client";

import { BillingModulePage } from "@/components/crm/billing-module-page";
import { AppShell } from "@/components/layout/app-shell";
import { useCrmResource } from "@/hooks/use-crm-resource";

export default function QuotesPage() {
  const quoteResource = useCrmResource("quotes");
  const invoiceResource = useCrmResource("invoices");

  return (
    <AppShell
      description="Angebote mit Positionen, Druckansicht und Konvertierung in Rechnungen."
      title="Angebote"
    >
      <BillingModulePage
        error={quoteResource.error}
        label="Angebote"
        loading={quoteResource.loading}
        onConvertQuote={async (record) => {
          await invoiceResource.create({
            customer_id: record.customer_id,
            source_quote_id: record.id,
            title: `${String(record.title ?? "Angebot")} - Rechnung`,
            status: "faellig",
            issue_date: new Date().toISOString().slice(0, 10),
            due_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString().slice(0, 10),
            payment_terms: record.payment_terms,
            tax_rate: record.tax_rate,
            items: record.items,
            notes: record.notes,
          });
        }}
        onCreate={quoteResource.create}
        onDelete={quoteResource.remove}
        onUpdate={quoteResource.update}
        records={quoteResource.records}
        resource="quotes"
        singular="Angebot"
      />
    </AppShell>
  );
}

