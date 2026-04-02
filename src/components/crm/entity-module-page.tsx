"use client";

import { Filter, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { KanbanBoard } from "@/components/crm/kanban-board";
import type { ModuleConfig, ModuleField } from "@/config/modules";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/providers/app-provider";

type EntityRecord = {
  id?: string;
} & object;

function fieldOptions(
  field: ModuleField,
  bootstrap: ReturnType<typeof useAppContext>["bootstrap"],
) {
  if (field.options) {
    return field.options;
  }

  if (field.optionsFrom && bootstrap) {
    return bootstrap[field.optionsFrom].map((record) => ({
      label: String(record[field.labelKey as keyof typeof record] ?? "-"),
      value: String(record[field.valueKey as keyof typeof record] ?? ""),
    }));
  }

  return [];
}

function renderField(
  field: ModuleField,
  value: unknown,
  onChange: (key: string, nextValue: unknown) => void,
  bootstrap: ReturnType<typeof useAppContext>["bootstrap"],
) {
  const sharedProps = {
    id: field.key,
    name: field.key,
  };

  if (field.type === "textarea" || field.type === "json") {
    return (
      <Textarea
        {...sharedProps}
        onChange={(event) => onChange(field.key, event.target.value)}
        value={field.type === "json" ? JSON.stringify(value ?? {}, null, 2) : String(value ?? "")}
      />
    );
  }

  if (field.type === "select") {
    const options = fieldOptions(field, bootstrap);
    return (
        <Select
          {...sharedProps}
          onChange={(event) => onChange(field.key, event.target.value)}
          value={String(value ?? "")}
        >
        <option value="">Bitte wählen</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    );
  }

  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-slate-100">
        <input
          checked={Boolean(value)}
          className="h-4 w-4 rounded border-white/20 bg-slate-950"
          onChange={(event) => onChange(field.key, event.target.checked)}
          type="checkbox"
        />
        {field.label}
      </label>
    );
  }

  const inputType =
    field.type === "currency" || field.type === "number"
      ? "number"
      : field.type === "tags"
        ? "text"
        : field.type;

  return (
    <Input
      {...sharedProps}
      onChange={(event) => onChange(field.key, event.target.value)}
      placeholder={field.placeholder}
      step={field.type === "currency" ? "0.01" : undefined}
      type={inputType}
      value={Array.isArray(value) ? value.join(", ") : String(value ?? "")}
    />
  );
}

export function EntityModulePage({
  config,
  records,
  loading,
  error,
  onCreate,
  onUpdate,
  onDelete,
  rowActions,
  topActions,
}: {
  config: ModuleConfig;
  records: EntityRecord[];
  loading: boolean;
  error: string | null;
  onCreate: (payload: Record<string, unknown>) => Promise<void>;
  onUpdate: (id: string, payload: Record<string, unknown>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  rowActions?: (record: EntityRecord) => React.ReactNode;
  topActions?: React.ReactNode;
}) {
  const { bootstrap } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Record<string, unknown> | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "kanban">(
    config.kanbanKey ? "kanban" : "list",
  );

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const entry = record as Record<string, unknown>;
      const matchesSearch =
        searchTerm.trim().length === 0 ||
        config.searchKeys.some((key) =>
          String(entry[key] ?? "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
        );

      const matchesFilter =
        !config.filterKey || !filterValue || String(entry[config.filterKey] ?? "") === filterValue;

      return matchesSearch && matchesFilter;
    });
  }, [config.filterKey, config.searchKeys, filterValue, records, searchTerm]);

  const openCreateDialog = () => {
    setEditingRecord({ ...config.defaultValues });
    setDialogOpen(true);
  };

  const openEditDialog = (record: EntityRecord) => {
    const entry = record as Record<string, unknown>;
    setEditingRecord({
      ...entry,
      ...(entry.tags
        ? { tags: Array.isArray(entry.tags) ? entry.tags.join(", ") : entry.tags }
        : {}),
      ...(entry.participants
        ? {
            participants: Array.isArray(entry.participants)
              ? entry.participants.join(", ")
              : entry.participants,
          }
        : {}),
    });
    setDialogOpen(true);
  };

  const upsertValue = (key: string, nextValue: unknown) => {
    setEditingRecord((current) => ({
      ...(current ?? config.defaultValues),
      [key]: nextValue,
    }));
  };

  const submit = async () => {
    if (!editingRecord) {
      return;
    }

    setSubmitting(true);
    try {
      const payload = { ...editingRecord };

      if (typeof payload.tags === "string") {
        payload.tags = payload.tags
          .split(",")
          .map((entry) => entry.trim())
          .filter(Boolean);
      }

      if (typeof payload.participants === "string") {
        payload.participants = payload.participants
          .split(",")
          .map((entry) => entry.trim())
          .filter(Boolean);
      }

      if (typeof payload.setting_value === "string") {
        try {
          payload.setting_value = JSON.parse(payload.setting_value);
        } catch {
          throw new Error("Das JSON in den Einstellungen ist ungültig.");
        }
      }

      if (payload.id) {
        await onUpdate(String(payload.id), payload);
      } else {
        await onCreate(payload);
      }

      setDialogOpen(false);
      setEditingRecord(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {config.stats.map((stat) => (
          <Card className="overflow-hidden" key={stat.label}>
            <CardContent className="bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-5">
              <p className="text-sm uppercase tracking-[0.18em] text-slate-400">{stat.label}</p>
              <p className="mt-3 font-display text-4xl text-white">
                {stat.getValue(records as Array<Record<string, unknown>>)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader
          action={
            <div className="flex flex-wrap gap-2">
              {config.kanbanKey ? (
                <>
                  <Button
                    className={cn(viewMode === "kanban" ? "" : "opacity-70")}
                    onClick={() => setViewMode("kanban")}
                    variant="ghost"
                  >
                    Board
                  </Button>
                  <Button
                    className={cn(viewMode === "list" ? "" : "opacity-70")}
                    onClick={() => setViewMode("list")}
                    variant="ghost"
                  >
                    Liste
                  </Button>
                </>
              ) : null}
              {topActions}
              <Button onClick={openCreateDialog} variant="secondary">
                <Plus className="h-4 w-4" />
                {config.singular} anlegen
              </Button>
            </div>
          }
          description={config.description}
          title={config.label}
        />
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
              <Input
                className="pl-11"
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={`${config.singular} durchsuchen`}
                value={searchTerm}
              />
            </div>
            {config.filterKey ? (
              <div className="flex min-w-[240px] items-center gap-2">
                <Filter className="h-4 w-4 text-slate-500" />
                <Select onChange={(event) => setFilterValue(event.target.value)} value={filterValue}>
                  <option value="">Alle</option>
                  {(config.fields.find((field) => field.key === config.filterKey)?.options ?? []).map(
                    (option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ),
                  )}
                </Select>
              </div>
            ) : null}
          </div>

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
              actionLabel={`${config.singular} anlegen`}
              description={`Es wurden noch keine passenden ${config.singular.toLowerCase()}e gefunden.`}
              onAction={openCreateDialog}
              title={`Keine ${config.label}`}
            />
          ) : viewMode === "kanban" && config.kanbanKey && config.kanbanOptions ? (
            <KanbanBoard
              columnKey={config.kanbanKey}
              columns={config.kanbanOptions}
              metaRenderer={(record) => (
                (() => {
                  const entry = record as Record<string, unknown>;

                  return (
                    <>
                      <p>{entry.owner_name ? `Verantwortlich: ${String(entry.owner_name)}` : "Nicht zugewiesen"}</p>
                      {entry.expected_close_date ? (
                        <p>Abschluss: {String(entry.expected_close_date)}</p>
                      ) : null}
                    </>
                  );
                })()
              )}
              onDropChange={async (id, nextValue) => {
                await onUpdate(id, { [config.kanbanKey as string]: nextValue });
              }}
              records={filteredRecords}
              titleKey={config.columns[0]?.key ?? "title"}
              valueKey={config.resource === "opportunities" ? "expected_value" : undefined}
            />
          ) : (
            <div className="overflow-x-auto rounded-3xl border border-white/10 bg-white/3">
              <table className="min-w-full divide-y divide-white/10 text-left text-sm">
                <thead className="bg-white/[0.03] text-slate-300">
                  <tr>
                    {config.columns.map((column) => (
                      <th className="px-4 py-3 font-semibold" key={column.key} scope="col">
                        {column.label}
                      </th>
                    ))}
                    <th className="px-4 py-3 font-semibold text-right" scope="col">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/6 bg-transparent">
                  {filteredRecords.map((record) => {
                    const entry = record as Record<string, unknown>;

                    return (
                      <tr className="align-top transition hover:bg-white/[0.03]" key={String(entry.id)}>
                        {config.columns.map((column) => (
                          <td className="max-w-[260px] px-4 py-3 text-slate-100" key={column.key}>
                            {column.render ? column.render(entry, bootstrap) : String(entry[column.key] ?? "-")}
                          </td>
                        ))}
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            {rowActions ? rowActions(record) : null}
                            <Button onClick={() => openEditDialog(record)} variant="ghost">
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
        description="Felder werden vor dem Speichern serverseitig validiert und auditiert."
        onClose={() => setDialogOpen(false)}
        open={dialogOpen}
        title={editingRecord?.id ? `${config.singular} bearbeiten` : `${config.singular} anlegen`}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {config.fields.map((field) => (
            <div className={field.gridSpan === "full" ? "sm:col-span-2" : ""} key={field.key}>
              {field.type !== "checkbox" ? (
                <label className="mb-2 block text-sm font-semibold text-slate-200" htmlFor={field.key}>
                  {field.label}
                </label>
              ) : null}
              {renderField(field, editingRecord?.[field.key], upsertValue, bootstrap)}
            </div>
          ))}
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
