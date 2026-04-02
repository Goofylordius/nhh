"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { euro } from "@/lib/utils";

type KanbanRecord = {
  id?: string;
} & object;

export function KanbanBoard({
  records,
  columnKey,
  columns,
  titleKey,
  metaRenderer,
  valueKey,
  onDropChange,
}: {
  records: KanbanRecord[];
  columnKey: string;
  columns: Array<{ label: string; value: string }>;
  titleKey: string;
  metaRenderer?: (record: KanbanRecord) => React.ReactNode;
  valueKey?: string;
  onDropChange: (id: string, nextValue: string) => Promise<void>;
}) {
  const [draggingId, setDraggingId] = useState<string | null>(null);

  return (
    <div className="grid gap-4 xl:grid-cols-6">
      {columns.map((column) => {
        const columnRecords = records.filter(
          (record) => (record as Record<string, unknown>)[columnKey] === column.value,
        );
        return (
          <Card className="overflow-hidden" key={column.value}>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink-900">{column.label}</p>
                  <p className="text-xs text-ink-600">{columnRecords.length} Eintraege</p>
                </div>
                <Badge>{column.label}</Badge>
              </div>
              <div
                className="min-h-[180px] space-y-3 rounded-3xl border border-dashed border-ink-200 bg-ink-50/50 p-3"
                onDragOver={(event) => {
                  event.preventDefault();
                }}
                onDrop={async (event) => {
                  event.preventDefault();
                  const id = event.dataTransfer.getData("text/plain");
                  if (!id) {
                    return;
                  }

                  await onDropChange(id, column.value);
                  setDraggingId(null);
                }}
              >
                {columnRecords.map((record) => {
                  const entry = record as Record<string, unknown>;

                  return (
                    <article
                      className={`rounded-2xl border border-white bg-white p-3 shadow-sm transition ${
                        draggingId === entry.id ? "opacity-60" : ""
                      }`}
                      draggable
                      key={String(entry.id)}
                      onDragEnd={() => setDraggingId(null)}
                      onDragStart={(event) => {
                        event.dataTransfer.setData("text/plain", String(entry.id));
                        setDraggingId(String(entry.id));
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-ink-900">
                            {String(entry[titleKey] ?? "Ohne Titel")}
                          </h3>
                          {metaRenderer ? (
                            <div className="mt-2 text-xs text-ink-600">{metaRenderer(record)}</div>
                          ) : null}
                        </div>
                        {valueKey ? (
                          <div className="text-right text-xs font-semibold text-mint-800">
                            {euro(Number(entry[valueKey] ?? 0))}
                          </div>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
