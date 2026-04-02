"use client";

import Link from "next/link";
import { Download, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { billingStatusOptions } from "@/config/options";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { euro } from "@/lib/utils";
import { useAppContext } from "@/providers/app-provider";

type BillingItem = {
  description?: unknown;
  quantity?: unknown;
  unit_price?: unknown;
  tax_rate?: unknown;
} & object;

type BillingRecord = {
  id?: string;
  items?: BillingItem[];
  customer_id?: unknown;
  title?: unknown;
  status?: unknown;
  quote_number?: unknown;
  invoice_number?: unknown;
  issue_date?: unknown;
  due_date?: unknown;
  valid_until?: unknown;
  payment_terms?: unknown;
  currency?: unknown;
  tax_rate?: unknown;
  total_amount?: unknown;
  notes?: unknown;
} & object;

function asEntry(record: BillingRecord) {
  return record as Record<string, unknown>;
}

function calculateTotals(items: BillingItem[], taxRate: number) {
  const subtotal = items.reduce((sum, item) => {
    return sum + Number(item.quantity ?? 0) * Number(item.unit_price ?? 0);
  }, 0);
  const taxAmount = items.reduce((sum, item) => {
    const rowTotal = Number(item.quantity ?? 0) * Number(item.unit_price ?? 0);
    return sum + rowTotal * (Number(item.tax_rate ?? taxRate) / 100);
  }, 0);

  return {
    subtotal,
    taxAmount,
    total: subtotal + taxAmount,
  };
}

export function BillingModulePage({
  resource,
  label,
  singular,
  records,
  loading,
  error,
  onCreate,
  onUpdate,
  onDelete,
  onConvertQuote,
}: {
  resource: "quotes" | "invoices";
  label: string;
  singular: string;
  records: BillingRecord[];
  loading: boolean;
  error: string | null;
  onCreate: (payload: BillingRecord) => Promise<void>;
  onUpdate: (id: string, payload: BillingRecord) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onConvertQuote?: (record: BillingRecord) => Promise<void>;
}) {
  const { bootstrap } = useAppContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState<BillingRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const entry = asEntry(record);

      return [entry.title, entry.quote_number, entry.invoice_number, entry.status]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());
    });
  }, [records, search]);

  const draftEntry = draft ? asEntry(draft) : null;
  const totals = calculateTotals(draft?.items ?? [], Number(draftEntry?.tax_rate ?? 19));

  const openCreate = () => {
    setDraft({
      status: resource === "quotes" ? "entwurf" : "faellig",
      issue_date: new Date().toISOString().slice(0, 10),
      due_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString().slice(0, 10),
      valid_until: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString().slice(0, 10),
      payment_terms: "14 Tage netto",
      currency: "EUR",
      tax_rate: 19,
      items: [{ description: "", quantity: 1, unit_price: 0, tax_rate: 19 }],
    });
    setDialogOpen(true);
  };

  const openEdit = (record: BillingRecord) => {
    const entry = asEntry(record);
    setDraft({
      ...record,
      items:
        Array.isArray(entry.items) && entry.items.length > 0
          ? (entry.items as BillingItem[])
          : [{ description: "", quantity: 1, unit_price: 0, tax_rate: 19 }],
    });
    setDialogOpen(true);
  };

  const setValue = (key: string, value: unknown) => {
    setDraft((current) => ({
      ...(current ?? {}),
      [key]: value,
    }));
  };

  const setItemValue = (index: number, key: string, value: unknown) => {
    setDraft((current) => {
      const items = [...(current?.items ?? [])];
      items[index] = {
        ...items[index],
        [key]: value,
      };

      return {
        ...(current ?? {}),
        items,
      };
    });
  };

  const addItem = () => {
    setDraft((current) => {
      const currentEntry = current ? asEntry(current) : null;

      return {
        ...(current ?? {}),
        items: [
          ...(current?.items ?? []),
          {
            description: "",
            quantity: 1,
            unit_price: 0,
            tax_rate: Number(currentEntry?.tax_rate ?? 19),
          },
        ],
      };
    });
  };

  const removeItem = (index: number) => {
    setDraft((current) => ({
      ...(current ?? {}),
      items: (current?.items ?? []).filter((_, currentIndex) => currentIndex !== index),
    }));
  };

  const submit = async () => {
    if (!draft) {
      return;
    }

    setSubmitting(true);
    try {
      const currentDraftEntry = asEntry(draft);
      const payload = {
        ...draft,
        items: draft.items?.map((item) => ({
          description: item.description,
          quantity: Number(item.quantity ?? 0),
          unit_price: Number(item.unit_price ?? 0),
          tax_rate: Number(item.tax_rate ?? currentDraftEntry.tax_rate ?? 19),
        })),
      };

      if (draft.id) {
        await onUpdate(String(draft.id), payload);
      } else {
        await onCreate(payload);
      }

      setDialogOpen(false);
      setDraft(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm uppercase tracking-[0.18em] text-slate-400">{label}</p>
            <p className="mt-3 font-display text-4xl text-white">{records.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Volumen</p>
            <p className="mt-3 font-display text-4xl text-white">
              {euro(
                records.reduce((sum, record) => sum + Number(asEntry(record).total_amount ?? 0), 0),
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm uppercase tracking-[0.18em] text-slate-400">{resource === "quotes" ? "Angenommen" : "Bezahlt"}</p>
            <p className="mt-3 font-display text-4xl text-white">
              {
                records.filter((record) => {
                  const entry = asEntry(record);
                  return resource === "quotes"
                    ? entry.status === "angenommen"
                    : entry.status === "bezahlt";
                }).length
              }
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Offen</p>
            <p className="mt-3 font-display text-4xl text-white">
              {
                records.filter((record) =>
                  !["bezahlt", "storniert", "verloren"].includes(
                    String(asEntry(record).status ?? ""),
                  ),
                ).length
              }
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader
          action={
            <div className="flex flex-wrap gap-2">
              <Input
                onChange={(event) => setSearch(event.target.value)}
                placeholder={`${singular} durchsuchen`}
                value={search}
              />
              <Button onClick={openCreate} variant="secondary">
                <Plus className="h-4 w-4" />
                {singular} anlegen
              </Button>
            </div>
          }
          description={`${label} mit Positionen, Druckansicht und automatischer Summenberechnung.`}
          title={label}
        />
        <CardContent className="space-y-4">
          {error ? (
            <div className="rounded-2xl border border-clay-400/20 bg-clay-500/12 px-4 py-3 text-sm text-clay-100">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-white/3 p-10 text-center text-sm text-slate-300">
              Daten werden geladen...
            </div>
          ) : filteredRecords.length === 0 ? (
            <EmptyState
              actionLabel={`${singular} anlegen`}
              description={`Es sind noch keine ${label.toLowerCase()} vorhanden.`}
              onAction={openCreate}
              title={`Keine ${label}`}
            />
          ) : (
            <div className="overflow-x-auto rounded-3xl border border-white/10 bg-white/3">
              <table className="min-w-full divide-y divide-white/10 text-left text-sm">
                <thead className="bg-white/[0.03] text-slate-300">
                  <tr>
                    <th className="px-4 py-3 font-semibold">{singular}</th>
                    <th className="px-4 py-3 font-semibold">Kunde</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Datum</th>
                    <th className="px-4 py-3 font-semibold">Gesamt</th>
                    <th className="px-4 py-3 font-semibold text-right">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/6 bg-transparent">
                  {filteredRecords.map((record) => {
                    const entry = asEntry(record);
                    const customer = bootstrap?.customers.find(
                      (customerEntry) => customerEntry.id === entry.customer_id,
                    );

                    return (
                      <tr key={String(entry.id)}>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-white">{String(entry.title ?? "-")}</div>
                          <div className="text-xs text-slate-400">
                            {String(entry.quote_number ?? entry.invoice_number ?? "-")}
                          </div>
                        </td>
                        <td className="px-4 py-3">{customer?.company_name ?? "-"}</td>
                        <td className="px-4 py-3">{String(entry.status ?? "-")}</td>
                        <td className="px-4 py-3">{String(entry.issue_date ?? "-")}</td>
                        <td className="px-4 py-3">{euro(Number(entry.total_amount ?? 0))}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            {resource === "quotes" && onConvertQuote ? (
                              <Button onClick={() => void onConvertQuote(record)} variant="ghost">
                                Zu Rechnung
                              </Button>
                            ) : null}
                            <Link
                              className="focus-ring inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/[0.08]"
                              href={`/${resource === "quotes" ? "angebote" : "rechnungen"}/${entry.id}/druck`}
                            >
                              <Download className="h-4 w-4" />
                              PDF
                            </Link>
                            <Button onClick={() => openEdit(record)} variant="ghost">
                              Bearbeiten
                            </Button>
                            <Button onClick={() => void onDelete(String(entry.id))} variant="danger">
                              <Trash2 className="h-4 w-4" />
                              Löschen
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        description="Summen und Steuerbeträge werden serverseitig neu berechnet."
        onClose={() => setDialogOpen(false)}
        open={dialogOpen}
        size="wide"
        title={draft?.id ? `${singular} bearbeiten` : `${singular} anlegen`}
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">Kunde</label>
            <Select
              onChange={(event) => setValue("customer_id", event.target.value)}
              value={String(draftEntry?.customer_id ?? "")}
            >
              <option value="">Bitte wählen</option>
              {(bootstrap?.customers ?? []).map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.company_name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">Titel</label>
            <Input
              onChange={(event) => setValue("title", event.target.value)}
              value={String(draftEntry?.title ?? "")}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">Status</label>
            <Select
              onChange={(event) => setValue("status", event.target.value)}
              value={String(draftEntry?.status ?? "entwurf")}
            >
              {billingStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">Ausstellungsdatum</label>
            <Input
              onChange={(event) => setValue("issue_date", event.target.value)}
              type="date"
              value={String(draftEntry?.issue_date ?? "")}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">
              {resource === "quotes" ? "Gültig bis" : "Fällig am"}
            </label>
            <Input
              onChange={(event) =>
                setValue(resource === "quotes" ? "valid_until" : "due_date", event.target.value)
              }
              type="date"
              value={String(
                resource === "quotes"
                  ? draftEntry?.valid_until ?? ""
                  : draftEntry?.due_date ?? "",
              )}
            />
          </div>
          <div className="lg:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-200">Zahlungsbedingungen</label>
            <Input
              onChange={(event) => setValue("payment_terms", event.target.value)}
              value={String(draftEntry?.payment_terms ?? "")}
            />
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-2xl text-white">Positionen</h3>
            <Button onClick={addItem} variant="ghost">
              <Plus className="h-4 w-4" />
              Position
            </Button>
          </div>
          <div className="space-y-3">
            {(draft?.items ?? []).map((item, index) => (
              <div
                className="grid gap-3 rounded-3xl border border-white/10 bg-white/4 p-4 lg:grid-cols-[1.8fr,0.6fr,0.8fr,0.6fr,auto]"
                key={`${index}-${String(item.description)}`}
              >
                <Input
                  onChange={(event) => setItemValue(index, "description", event.target.value)}
                  placeholder="Beschreibung"
                  value={String(item.description ?? "")}
                />
                <Input
                  onChange={(event) => setItemValue(index, "quantity", event.target.value)}
                  placeholder="Menge"
                  step="0.01"
                  type="number"
                  value={String(item.quantity ?? 1)}
                />
                <Input
                  onChange={(event) => setItemValue(index, "unit_price", event.target.value)}
                  placeholder="Einzelpreis"
                  step="0.01"
                  type="number"
                  value={String(item.unit_price ?? 0)}
                />
                <Input
                  onChange={(event) => setItemValue(index, "tax_rate", event.target.value)}
                  placeholder="MwSt."
                  step="0.01"
                  type="number"
                  value={String(item.tax_rate ?? draftEntry?.tax_rate ?? 19)}
                />
                <Button onClick={() => removeItem(index)} variant="danger">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr,320px]">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">Notizen</label>
            <Textarea
              onChange={(event) => setValue("notes", event.target.value)}
              value={String(draftEntry?.notes ?? "")}
            />
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/4 p-5">
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>Zwischensumme</span>
              <span>{euro(totals.subtotal)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm text-slate-300">
              <span>MwSt</span>
              <span>{euro(totals.taxAmount)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between font-display text-2xl text-white">
              <span>Gesamt</span>
              <span>{euro(totals.total)}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button onClick={() => setDialogOpen(false)} variant="ghost">
            Abbrechen
          </Button>
          <Button disabled={submitting} onClick={() => void submit()} variant="secondary">
            {submitting ? "Speichert..." : "Speichern"}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
