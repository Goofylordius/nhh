import { notFound } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { euro } from "@/lib/utils";

export default async function InvoicePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: invoice } = await supabaseAdmin.from("invoices").select("*").eq("id", id).single();
  const { data: items } = await supabaseAdmin
    .from("invoice_items")
    .select("*")
    .eq("invoice_id", id)
    .is("deleted_at", null)
    .order("position_no");
  const { data: customer } = invoice
    ? await supabaseAdmin.from("customers").select("*").eq("id", invoice.customer_id).single()
    : { data: null };

  if (!invoice) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-5xl p-6 print:p-0">
      <Card className="print:shadow-none">
        <CardContent className="space-y-8 p-8">
          <header className="flex items-start justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-ink-500">Rechnung</p>
              <h1 className="mt-3 font-display text-5xl text-ink-900">{invoice.title}</h1>
              <p className="mt-3 text-sm text-ink-700">{invoice.invoice_number}</p>
            </div>
            <div className="text-right text-sm text-ink-700">
              <p>Status: {invoice.status}</p>
              <p>Datum: {invoice.issue_date}</p>
              <p>Faellig: {invoice.due_date ?? "-"}</p>
            </div>
          </header>
          <section className="grid gap-6 md:grid-cols-2">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-ink-500">Kunde</h2>
              <p className="mt-2 font-semibold text-ink-900">{customer?.company_name}</p>
              <p className="text-sm text-ink-700">{customer?.address_line1}</p>
              <p className="text-sm text-ink-700">
                {customer?.postal_code} {customer?.city}
              </p>
              <p className="text-sm text-ink-700">{customer?.email}</p>
            </div>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-ink-500">Zahlungsinfos</h2>
              <p className="mt-2 text-sm text-ink-700">{invoice.notes ?? "Keine zusaetzlichen Hinweise."}</p>
              <p className="mt-4 text-sm text-ink-700">
                Zahlungsbedingungen: {invoice.payment_terms ?? "-"}
              </p>
            </div>
          </section>
          <table className="min-w-full divide-y divide-ink-100 text-left text-sm">
            <thead className="bg-ink-50">
              <tr>
                <th className="px-3 py-3">Pos.</th>
                <th className="px-3 py-3">Beschreibung</th>
                <th className="px-3 py-3">Menge</th>
                <th className="px-3 py-3">Einzelpreis</th>
                <th className="px-3 py-3">Gesamt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {(items ?? []).map((item) => (
                <tr key={item.id}>
                  <td className="px-3 py-3">{item.position_no}</td>
                  <td className="px-3 py-3">{item.description}</td>
                  <td className="px-3 py-3">{item.quantity}</td>
                  <td className="px-3 py-3">{euro(item.unit_price)}</td>
                  <td className="px-3 py-3">{euro(item.total_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="ml-auto max-w-sm space-y-3 rounded-3xl border border-ink-100 bg-ink-50 p-5">
            <div className="flex items-center justify-between">
              <span>Zwischensumme</span>
              <span>{euro(invoice.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>MwSt</span>
              <span>{euro(invoice.tax_amount)}</span>
            </div>
            <div className="flex items-center justify-between font-display text-2xl text-ink-900">
              <span>Gesamt</span>
              <span>{euro(invoice.total_amount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
