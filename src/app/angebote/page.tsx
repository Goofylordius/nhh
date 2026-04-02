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
          const entry = record as Record<string, unknown>;

          await invoiceResource.create({
            customer_id:
              typeof entry.customer_id === "string" ? entry.customer_id : undefined,
            source_quote_id: typeof entry.id === "string" ? entry.id : undefined,
            title: `${String(entry.title ?? "Angebot")} - Rechnung`,
            status: "faellig",
            issue_date: new Date().toISOString().slice(0, 10),
            due_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString().slice(0, 10),
            payment_terms:
              typeof entry.payment_terms === "string" ? entry.payment_terms : undefined,
            tax_rate: typeof entry.tax_rate === "number" ? entry.tax_rate : Number(entry.tax_rate ?? 19),
            items: Array.isArray(entry.items) ? entry.items : [],
            notes: typeof entry.notes === "string" ? entry.notes : undefined,
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
