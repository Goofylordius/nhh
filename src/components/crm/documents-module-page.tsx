"use client";

import Link from "next/link";
import { Download, Plus, Trash2, Upload } from "lucide-react";
import { useState } from "react";

import { documentCategoryOptions } from "@/config/options";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useAppContext } from "@/providers/app-provider";

type DocumentRecord = {
  id?: string;
} & object;

export function DocumentsModulePage({
  records,
  loading,
  error,
  onUpdate,
  onDelete,
  onUpload,
}: {
  records: DocumentRecord[];
  loading: boolean;
  error: string | null;
  onUpdate: (id: string, payload: Record<string, unknown>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUpload: (payload: FormData) => Promise<void>;
}) {
  const { bootstrap } = useAppContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [draft, setDraft] = useState<Record<string, unknown>>({
    title: "",
    category: "sonstiges",
    customer_id: "",
    project_id: "",
  });
  const [editingRecord, setEditingRecord] = useState<Record<string, unknown> | null>(null);

  const submitUpload = async () => {
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.set("file", file);
    formData.set("title", String(draft.title ?? ""));
    formData.set("category", String(draft.category ?? "sonstiges"));
    formData.set("customer_id", String(draft.customer_id ?? ""));
    formData.set("project_id", String(draft.project_id ?? ""));

    await onUpload(formData);
    setDialogOpen(false);
    setFile(null);
    setDraft({
      title: "",
      category: "sonstiges",
      customer_id: "",
      project_id: "",
    });
  };

  const saveEdit = async () => {
    if (!editingRecord?.id) {
      return;
    }

    await onUpdate(String(editingRecord.id), editingRecord);
    setEditOpen(false);
    setEditingRecord(null);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Dokumente</p>
            <p className="mt-3 font-display text-4xl text-white">{records.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Mit Kunde</p>
            <p className="mt-3 font-display text-4xl text-white">
              {
                records.filter((record) => Boolean((record as Record<string, unknown>).customer_id))
                  .length
              }
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Mit Projekt</p>
            <p className="mt-3 font-display text-4xl text-white">
              {
                records.filter((record) => Boolean((record as Record<string, unknown>).project_id))
                  .length
              }
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Speicher</p>
            <p className="mt-3 font-display text-4xl text-white">
              {(
                records.reduce(
                  (sum, record) => sum + Number((record as Record<string, unknown>).file_size ?? 0),
                  0,
                ) /
                1024 /
                1024
              ).toFixed(1)}{" "}
              MB
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader
          action={
            <Button onClick={() => setDialogOpen(true)} variant="secondary">
              <Plus className="h-4 w-4" />
              Dokument hochladen
            </Button>
          }
          description="Supabase Storage mit Metadaten, Version, Kategorien und Download-Link."
          title="Dokumente"
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
          ) : records.length === 0 ? (
            <EmptyState
              actionLabel="Dokument hochladen"
              description="Noch kein Dokument im Supabase Storage verknuepft."
              onAction={() => setDialogOpen(true)}
              title="Keine Dokumente"
            />
          ) : (
            <div className="overflow-x-auto rounded-3xl border border-white/10 bg-white/3">
              <table className="min-w-full divide-y divide-white/10 text-left text-sm">
                <thead className="bg-white/[0.03] text-slate-300">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Titel</th>
                    <th className="px-4 py-3 font-semibold">Kategorie</th>
                    <th className="px-4 py-3 font-semibold">Kunde</th>
                    <th className="px-4 py-3 font-semibold">Projekt</th>
                    <th className="px-4 py-3 font-semibold">Datei</th>
                    <th className="px-4 py-3 font-semibold text-right">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/6 bg-transparent">
                  {records.map((record) => {
                    const entry = record as Record<string, unknown>;

                    return (
                      <tr key={String(entry.id)}>
                        <td className="px-4 py-3 text-slate-100">{String(entry.title ?? "-")}</td>
                        <td className="px-4 py-3 text-slate-300">{String(entry.category ?? "-")}</td>
                        <td className="px-4 py-3">
                          {bootstrap?.customers.find((customer) => customer.id === entry.customer_id)?.company_name ?? "-"}
                        </td>
                        <td className="px-4 py-3">
                          {bootstrap?.projects.find((project) => project.id === entry.project_id)?.title ?? "-"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-white">{String(entry.file_name ?? "-")}</div>
                          <div className="text-xs text-slate-400">
                            {(Number(entry.file_size ?? 0) / 1024).toFixed(1)} KB
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <Link
                              className="focus-ring inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/8 px-3 py-2 text-sm font-semibold text-slate-100"
                              href={`/api/documents/${entry.id}/download`}
                            >
                              <Download className="h-4 w-4" />
                              Download
                            </Link>
                            <Button
                              onClick={() => {
                                setEditingRecord(entry);
                                setEditOpen(true);
                              }}
                              variant="ghost"
                            >
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
        description="Datei wird in den privaten Supabase-Bucket geschrieben und danach als Datensatz referenziert."
        onClose={() => setDialogOpen(false)}
        open={dialogOpen}
        title="Dokument hochladen"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink-800">Titel</label>
            <Input
              onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
              value={String(draft.title ?? "")}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink-800">Kategorie</label>
            <Select
              onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))}
              value={String(draft.category ?? "sonstiges")}
            >
              {documentCategoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink-800">Kunde</label>
            <Select
              onChange={(event) => setDraft((current) => ({ ...current, customer_id: event.target.value }))}
              value={String(draft.customer_id ?? "")}
            >
              <option value="">Kein Kunde</option>
              {(bootstrap?.customers ?? []).map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.company_name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink-800">Projekt</label>
            <Select
              onChange={(event) => setDraft((current) => ({ ...current, project_id: event.target.value }))}
              value={String(draft.project_id ?? "")}
            >
              <option value="">Kein Projekt</option>
              {(bootstrap?.projects ?? []).map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink-800">Datei</label>
            <Input onChange={(event) => setFile(event.target.files?.[0] ?? null)} type="file" />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button onClick={() => setDialogOpen(false)} variant="ghost">
            Abbrechen
          </Button>
          <Button onClick={() => void submitUpload()} variant="secondary">
            <Upload className="h-4 w-4" />
            Hochladen
          </Button>
        </div>
      </Dialog>

      <Dialog
        description="Metadaten koennen ohne erneuten Upload geaendert werden."
        onClose={() => setEditOpen(false)}
        open={editOpen}
        title="Dokument bearbeiten"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink-800">Titel</label>
            <Input
              onChange={(event) =>
                setEditingRecord((current) => ({ ...(current ?? {}), title: event.target.value }))
              }
              value={String(editingRecord?.title ?? "")}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink-800">Kategorie</label>
            <Select
              onChange={(event) =>
                setEditingRecord((current) => ({ ...(current ?? {}), category: event.target.value }))
              }
              value={String(editingRecord?.category ?? "sonstiges")}
            >
              {documentCategoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button onClick={() => setEditOpen(false)} variant="ghost">
            Abbrechen
          </Button>
          <Button onClick={() => void saveEdit()} variant="secondary">
            Speichern
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
