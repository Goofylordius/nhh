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
          <Card className="overflow-hidden border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))]" key={column.value}>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">{column.label}</p>
                  <p className="text-xs text-slate-500">{columnRecords.length} Einträge</p>
                </div>
                <Badge>{column.label}</Badge>
              </div>
              <div
                className="min-h-[220px] space-y-3 rounded-[1.6rem] border border-dashed border-white/10 bg-black/10 p-3"
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
                      className={`rounded-[1.35rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.02))] p-4 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.75)] transition ${
                        draggingId === entry.id ? "scale-[0.99] opacity-60" : "hover:-translate-y-0.5 hover:border-mint-400/25 hover:bg-white/[0.06]"
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
                          <h3 className="font-semibold text-white">
                            {String(entry[titleKey] ?? "Ohne Titel")}
                          </h3>
                          {metaRenderer ? (
                            <div className="mt-2 space-y-1 text-xs text-slate-400">{metaRenderer(record)}</div>
                          ) : null}
                        </div>
                        {valueKey ? (
                          <div className="text-right text-xs font-semibold text-mint-200">
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
