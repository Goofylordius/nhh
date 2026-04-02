"use client";

import { addDays, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { recurrenceOptions } from "@/config/options";
import { useAppContext } from "@/providers/app-provider";

type CalendarRecord = Record<string, unknown>;

function buildCalendarDays(currentMonth: Date) {
  const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
  const days: Date[] = [];
  let cursor = start;
  while (cursor <= end) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return days;
}

export function CalendarModulePage({
  records,
  loading,
  error,
  onCreate,
  onUpdate,
  onDelete,
}: {
  records: CalendarRecord[];
  loading: boolean;
  error: string | null;
  onCreate: (payload: CalendarRecord) => Promise<void>;
  onUpdate: (id: string, payload: CalendarRecord) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const { bootstrap } = useAppContext();
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState<CalendarRecord | null>(null);

  const days = useMemo(() => buildCalendarDays(currentMonth), [currentMonth]);

  const stats = {
    total: records.length,
    recurring: records.filter((record) => Boolean(record.recurrence_rule)).length,
    thisWeek: records.filter((record) => {
      const eventDate = new Date(String(record.starts_at));
      const start = startOfWeek(new Date(), { weekStartsOn: 1 });
      const end = endOfWeek(new Date(), { weekStartsOn: 1 });
      return eventDate >= start && eventDate <= end;
    }).length,
    linked: records.filter((record) => Boolean(record.customer_id) || Boolean(record.project_id)).length,
  };

  const openCreate = () => {
    const now = new Date();
    const plusHour = new Date(Date.now() + 1000 * 60 * 60);
    setDraft({
      title: "",
      event_type: "Termin",
      starts_at: now.toISOString().slice(0, 16),
      ends_at: plusHour.toISOString().slice(0, 16),
      participants: "",
      reminder_minutes: 60,
      recurrence_rule: "",
      customer_id: "",
      project_id: "",
      location: "",
      description: "",
    });
    setDialogOpen(true);
  };

  const openEdit = (record: CalendarRecord) => {
    setDraft({
      ...record,
      participants: Array.isArray(record.participants)
        ? record.participants.join(", ")
        : record.participants ?? "",
      starts_at: String(record.starts_at ?? "").slice(0, 16),
      ends_at: String(record.ends_at ?? "").slice(0, 16),
    });
    setDialogOpen(true);
  };

  const submit = async () => {
    if (!draft) {
      return;
    }

    const payload = {
      ...draft,
      participants: String(draft.participants ?? "")
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean),
    };

    if (draft.id) {
      await onUpdate(String(draft.id), payload);
    } else {
      await onCreate(payload);
    }

    setDialogOpen(false);
    setDraft(null);
  };

  const groupedByDay = useMemo(() => {
    return days.map((day) => ({
      day,
      events: records.filter((record) => isSameDay(new Date(String(record.starts_at)), day)),
    }));
  }, [days, records]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-ink-600">Termine</p>
            <p className="mt-2 font-display text-4xl text-ink-900">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-ink-600">Diese Woche</p>
            <p className="mt-2 font-display text-4xl text-ink-900">{stats.thisWeek}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-ink-600">Wiederkehrend</p>
            <p className="mt-2 font-display text-4xl text-ink-900">{stats.recurring}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-ink-600">Verknuepft</p>
            <p className="mt-2 font-display text-4xl text-ink-900">{stats.linked}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader
          action={
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setView("month")} variant="ghost">
                Monat
              </Button>
              <Button onClick={() => setView("week")} variant="ghost">
                Woche
              </Button>
              <Button onClick={() => setView("day")} variant="ghost">
                Tag
              </Button>
              <a
                className="focus-ring inline-flex items-center gap-2 rounded-2xl bg-ink-100 px-4 py-2.5 text-sm font-semibold text-ink-800"
                href="/api/export/calendar/ical"
              >
                <CalendarDays className="h-4 w-4" />
                iCal Export
              </a>
              <Button onClick={openCreate} variant="secondary">
                <Plus className="h-4 w-4" />
                Termin anlegen
              </Button>
            </div>
          }
          description="Monats-, Wochen- und Tagesansicht mit Drag-and-Drop im Monatsraster."
          title="Kalender"
        />
        <CardContent className="space-y-4">
          {error ? (
            <div className="rounded-2xl border border-clay-200 bg-clay-50 px-4 py-3 text-sm text-clay-900">
              {error}
            </div>
          ) : null}
          {loading ? (
            <div className="rounded-3xl border border-dashed border-ink-200 bg-ink-50 p-10 text-center text-sm text-ink-600">
              Daten werden geladen...
            </div>
          ) : records.length === 0 ? (
            <EmptyState
              actionLabel="Termin anlegen"
              description="Noch keine Termine hinterlegt."
              onAction={openCreate}
              title="Keine Termine"
            />
          ) : view === "month" ? (
            <>
              <div className="flex items-center justify-between">
                <Button onClick={() => setCurrentMonth((current) => addDays(startOfMonth(current), -1))} variant="ghost">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h3 className="font-display text-3xl text-ink-900">
                  {format(currentMonth, "LLLL yyyy", { locale: de })}
                </h3>
                <Button onClick={() => setCurrentMonth((current) => addDays(endOfMonth(current), 1))} variant="ghost">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-7 gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
                {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((label) => (
                  <div key={label}>{label}</div>
                ))}
              </div>
              <div className="grid gap-3 md:grid-cols-7">
                {groupedByDay.map(({ day, events }) => (
                  <div
                    className={`min-h-[180px] rounded-3xl border p-3 ${
                      isSameMonth(day, currentMonth) ? "bg-white" : "bg-ink-50 text-ink-500"
                    }`}
                    key={day.toISOString()}
                    onDragOver={(event) => {
                      event.preventDefault();
                    }}
                    onDrop={async (event) => {
                      event.preventDefault();
                      const raw = event.dataTransfer.getData("text/plain");
                      if (!raw) {
                        return;
                      }
                      const entry = records.find((record) => String(record.id) === raw);
                      if (!entry) {
                        return;
                      }
                      const startsAt = new Date(String(entry.starts_at));
                      const endsAt = new Date(String(entry.ends_at));
                      const duration = endsAt.getTime() - startsAt.getTime();
                      const nextStart = new Date(day);
                      nextStart.setHours(startsAt.getHours(), startsAt.getMinutes(), 0, 0);
                      const nextEnd = new Date(nextStart.getTime() + duration);
                      await onUpdate(String(entry.id), {
                        starts_at: nextStart.toISOString(),
                        ends_at: nextEnd.toISOString(),
                      });
                    }}
                  >
                    <div className="mb-3 text-sm font-semibold text-ink-900">
                      {format(day, "d")}
                    </div>
                    <div className="space-y-2">
                      {events.map((event) => (
                        <button
                          className="w-full rounded-2xl bg-mint-50 px-3 py-2 text-left text-xs font-medium text-mint-900"
                          draggable
                          key={String(event.id)}
                          onClick={() => openEdit(event)}
                          onDragStart={(dragEvent) => {
                            dragEvent.dataTransfer.setData("text/plain", String(event.id));
                          }}
                          type="button"
                        >
                          <div>{String(event.title ?? "Termin")}</div>
                          <div className="mt-1 text-[11px] opacity-80">
                            {format(new Date(String(event.starts_at)), "HH:mm")}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : view === "week" ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
              {groupedByDay.slice(0, 7).map(({ day, events }) => (
                <Card key={day.toISOString()}>
                  <CardContent className="p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-ink-500">{format(day, "EEE", { locale: de })}</p>
                    <h3 className="mt-2 font-display text-2xl text-ink-900">{format(day, "d. MMM", { locale: de })}</h3>
                    <div className="mt-4 space-y-2">
                      {events.length === 0 ? <p className="text-sm text-ink-500">Keine Termine</p> : null}
                      {events.map((event) => (
                        <button
                          className="w-full rounded-2xl border border-ink-100 bg-white px-3 py-2 text-left"
                          key={String(event.id)}
                          onClick={() => openEdit(event)}
                          type="button"
                        >
                          <div className="font-medium text-ink-900">{String(event.title ?? "Termin")}</div>
                          <div className="text-xs text-ink-600">
                            {format(new Date(String(event.starts_at)), "HH:mm")} - {format(new Date(String(event.ends_at)), "HH:mm")}
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {records
                .filter((record) => isSameDay(new Date(String(record.starts_at)), new Date()))
                .map((event) => (
                  <Card key={String(event.id)}>
                    <CardContent className="flex items-center justify-between gap-4 p-5">
                      <div>
                        <h3 className="font-semibold text-ink-900">{String(event.title ?? "Termin")}</h3>
                        <p className="text-sm text-ink-600">
                          {format(new Date(String(event.starts_at)), "HH:mm")} - {format(new Date(String(event.ends_at)), "HH:mm")}
                        </p>
                      </div>
                      <Button onClick={() => openEdit(event)} variant="ghost">
                        Bearbeiten
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        description="Teilnehmer, Erinnerungen und Wiederholungen werden im Supabase-Kalender gespeichert."
        onClose={() => setDialogOpen(false)}
        open={dialogOpen}
        title={draft?.id ? "Termin bearbeiten" : "Termin anlegen"}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-ink-800">Titel</label>
            <Input onChange={(event) => setDraft((current) => ({ ...(current ?? {}), title: event.target.value }))} value={String(draft?.title ?? "")} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink-800">Typ</label>
            <Input onChange={(event) => setDraft((current) => ({ ...(current ?? {}), event_type: event.target.value }))} value={String(draft?.event_type ?? "")} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink-800">Ort</label>
            <Input onChange={(event) => setDraft((current) => ({ ...(current ?? {}), location: event.target.value }))} value={String(draft?.location ?? "")} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink-800">Start</label>
            <Input onChange={(event) => setDraft((current) => ({ ...(current ?? {}), starts_at: event.target.value }))} type="datetime-local" value={String(draft?.starts_at ?? "")} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink-800">Ende</label>
            <Input onChange={(event) => setDraft((current) => ({ ...(current ?? {}), ends_at: event.target.value }))} type="datetime-local" value={String(draft?.ends_at ?? "")} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink-800">Kunde</label>
            <Select onChange={(event) => setDraft((current) => ({ ...(current ?? {}), customer_id: event.target.value }))} value={String(draft?.customer_id ?? "")}>
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
            <Select onChange={(event) => setDraft((current) => ({ ...(current ?? {}), project_id: event.target.value }))} value={String(draft?.project_id ?? "")}>
              <option value="">Kein Projekt</option>
              {(bootstrap?.projects ?? []).map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink-800">Teilnehmer</label>
            <Input onChange={(event) => setDraft((current) => ({ ...(current ?? {}), participants: event.target.value }))} value={String(draft?.participants ?? "")} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink-800">Erinnerung in Minuten</label>
            <Input onChange={(event) => setDraft((current) => ({ ...(current ?? {}), reminder_minutes: event.target.value }))} type="number" value={String(draft?.reminder_minutes ?? "")} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink-800">Wiederholung</label>
            <Select onChange={(event) => setDraft((current) => ({ ...(current ?? {}), recurrence_rule: event.target.value }))} value={String(draft?.recurrence_rule ?? "")}>
              {recurrenceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-ink-800">Beschreibung</label>
            <Input onChange={(event) => setDraft((current) => ({ ...(current ?? {}), description: event.target.value }))} value={String(draft?.description ?? "")} />
          </div>
        </div>
        <div className="mt-6 flex justify-between">
          {draft?.id ? (
            <Button onClick={() => void onDelete(String(draft.id))} variant="danger">
              <Trash2 className="h-4 w-4" />
              Loeschen
            </Button>
          ) : <span />}
          <div className="flex gap-2">
            <Button onClick={() => setDialogOpen(false)} variant="ghost">
              Abbrechen
            </Button>
            <Button onClick={() => void submit()} variant="secondary">
              Speichern
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
