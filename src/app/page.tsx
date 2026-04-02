"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  Download,
  FileText,
  FolderKanban,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { DashboardCharts } from "@/components/crm/dashboard-charts";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { fetchJson } from "@/lib/fetcher";
import { compactDate, compactDateTime, euro, humanizeStatus, percent } from "@/lib/utils";
import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";
import { useAppContext } from "@/providers/app-provider";
import type { DashboardPayload } from "@/types/crm";

const quickActions = [
  {
    href: "/kunden",
    label: "Kunden steuern",
    description: "Leads, aktive Kunden und Dubletten schnell prüfen.",
    icon: Users,
  },
  {
    href: "/pipeline",
    label: "Pipeline prüfen",
    description: "Deals priorisieren und Abschlusswahrscheinlichkeit steigern.",
    icon: Target,
  },
  {
    href: "/rechnungen",
    label: "Rechnungen nachfassen",
    description: "Offene Beträge, Fälligkeiten und Druckansichten verwalten.",
    icon: ReceiptText,
  },
  {
    href: "/projekte",
    label: "Projekte koordinieren",
    description: "Fortschritt, Budget und Verantwortung im Blick behalten.",
    icon: FolderKanban,
  },
];

export default function DashboardPage() {
  const { actorLabel } = useAppContext();
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const payload = await fetchJson<DashboardPayload>("/api/dashboard", undefined, actorLabel);
      setDashboard(payload);
    } finally {
      setLoading(false);
    }
  }, [actorLabel]);

  useEffect(() => {
    void load();
  }, [load]);

  useRealtimeRefresh(
    ["customers", "opportunities", "invoices", "tasks", "activities", "documents", "calendar_events"],
    load,
  );

  const healthTone = useMemo(() => {
    if (!dashboard) {
      return "default" as const;
    }

    if (dashboard.overdueInvoices > 0 || dashboard.urgentTaskCount > 3) {
      return "warning" as const;
    }

    if (dashboard.winRate >= 45 && dashboard.overdueInvoices === 0) {
      return "success" as const;
    }

    return "default" as const;
  }, [dashboard]);

  return (
    <AppShell
      actions={
        <>
          <Link
            className="focus-ring inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-white/[0.08]"
            href="/api/export/customers/csv"
          >
            <Download className="h-4 w-4" />
            Kunden CSV
          </Link>
          <Link
            className="focus-ring inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-mint-500 to-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_16px_40px_-18px_rgba(61,231,184,0.75)]"
            href="/einstellungen"
          >
            <ShieldCheck className="h-4 w-4" />
            Compliance
          </Link>
        </>
      }
      description="Operations-Dashboard für Vertrieb, Projekte, Dokumente und den täglichen Betrieb in einer fokussierten V2-Oberfläche."
      title="Command Center"
    >
      {loading || !dashboard ? (
        <Card>
          <CardContent className="p-12 text-center text-sm text-slate-300">
            Dashboard wird geladen...
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <section className="grid gap-4 xl:grid-cols-[1.45fr,0.95fr]">
            <Card className="overflow-hidden">
              <CardContent className="p-6 sm:p-7">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge tone={healthTone}>Betriebsmodus V2</Badge>
                  <Badge>Live mit Supabase Realtime</Badge>
                </div>
                <h3 className="mt-5 max-w-4xl font-display text-[2.2rem] leading-tight text-white sm:text-[2.8rem]">
                  Ein professioneller CRM-Workspace für Vertrieb, Baustellen, Nachfassen und revisionssichere Historie.
                </h3>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
                  Die Oberfläche priorisiert heute fällige Aufgaben, überfällige Rechnungen, kommende Termine und den aktuellen Vertriebsdruck an einer Stelle.
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Win Rate</div>
                    <div className="mt-2 text-3xl font-semibold text-white">{percent(dashboard.winRate)}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Offene Pipeline</div>
                    <div className="mt-2 text-3xl font-semibold text-white">{euro(dashboard.openRevenue)}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Dokumentenspeicher</div>
                    <div className="mt-2 text-3xl font-semibold text-white">{dashboard.documentStorageMb.toFixed(1)} MB</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader
                description="Direkte Einstiege in die Bereiche mit dem höchsten Tagesnutzen."
                title="Schnellzugriffe"
              />
              <CardContent className="grid gap-3 p-5">
                {quickActions.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      className="group rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4 transition hover:border-mint-400/25 hover:bg-white/[0.05]"
                      href={item.href}
                      key={item.href}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="rounded-2xl border border-white/10 bg-black/10 p-3 text-mint-200">
                          <Icon className="h-5 w-5" />
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-500 transition group-hover:text-mint-200" />
                      </div>
                      <div className="mt-4 font-semibold text-white">{item.label}</div>
                      <div className="mt-1 text-sm leading-6 text-slate-400">{item.description}</div>
                    </Link>
                  );
                })}
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            <Card className="xl:col-span-1">
              <CardContent className="p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Kunden</p>
                <p className="mt-3 font-display text-4xl text-white">{dashboard.customerCount}</p>
                <p className="mt-2 text-sm text-slate-400">{dashboard.leadCount} offene Leads</p>
              </CardContent>
            </Card>
            <Card className="xl:col-span-1">
              <CardContent className="p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Projekte aktiv</p>
                <p className="mt-3 font-display text-4xl text-white">{dashboard.activeProjectCount}</p>
                <p className="mt-2 text-sm text-slate-400">Laufende Ausführung</p>
              </CardContent>
            </Card>
            <Card className="xl:col-span-1">
              <CardContent className="p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Überfällige Rechnungen</p>
                <p className="mt-3 font-display text-4xl text-white">{dashboard.overdueInvoices}</p>
                <p className="mt-2 text-sm text-slate-400">{euro(dashboard.overdueInvoiceAmount)} offen</p>
              </CardContent>
            </Card>
            <Card className="xl:col-span-1">
              <CardContent className="p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Aufgaben heute</p>
                <p className="mt-3 font-display text-4xl text-white">{dashboard.taskDueToday}</p>
                <p className="mt-2 text-sm text-slate-400">{dashboard.urgentTaskCount} kritisch oder zeitnah</p>
              </CardContent>
            </Card>
            <Card className="xl:col-span-1">
              <CardContent className="p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Aktivitäten 7 Tage</p>
                <p className="mt-3 font-display text-4xl text-white">{dashboard.activityCountWeek}</p>
                <p className="mt-2 text-sm text-slate-400">Vertrieb, Meetings, Notizen</p>
              </CardContent>
            </Card>
            <Card className="xl:col-span-1">
              <CardContent className="p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Dokumente</p>
                <p className="mt-3 font-display text-4xl text-white">{dashboard.documentCount}</p>
                <p className="mt-2 text-sm text-slate-400">Strukturiert im Storage</p>
              </CardContent>
            </Card>
          </section>

          <DashboardCharts dashboard={dashboard} />

          <section className="grid gap-4 xl:grid-cols-[1.05fr,0.95fr,1fr]">
            <Card>
              <CardHeader
                description="Aufgaben mit enger Fälligkeit oder kritischer Priorität."
                title="Fokusliste"
              />
              <CardContent className="space-y-3 p-5">
                {dashboard.urgentTasks.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-slate-400">
                    Keine dringenden Aufgaben erkannt.
                  </div>
                ) : (
                  dashboard.urgentTasks.map((task) => (
                    <div
                      className="rounded-[1.35rem] border border-white/10 bg-white/[0.03] px-4 py-4"
                      key={task.id}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-white">{task.title}</div>
                          <div className="mt-1 text-sm text-slate-400">
                            {task.owner_name || "Nicht zugewiesen"}
                          </div>
                        </div>
                        <Badge tone={task.priority === "kritisch" ? "danger" : "warning"}>
                          {humanizeStatus(task.priority)}
                        </Badge>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                        <span>Status: {humanizeStatus(task.status)}</span>
                        <span>|</span>
                        <span>Fällig: {compactDate(task.due_date)}</span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader
                description="Kommende Termine aus dem Kalender der nächsten sieben Tage."
                title="Termine voraus"
              />
              <CardContent className="space-y-3 p-5">
                {dashboard.upcomingEvents.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-slate-400">
                    Keine anstehenden Termine im nächsten Zeitraum.
                  </div>
                ) : (
                  dashboard.upcomingEvents.map((event) => (
                    <div
                      className="rounded-[1.35rem] border border-white/10 bg-white/[0.03] px-4 py-4"
                      key={event.id}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-white">{event.title}</div>
                          <div className="mt-1 text-sm text-slate-400">{event.event_type}</div>
                        </div>
                        <CalendarClock className="h-5 w-5 text-cyan-300" />
                      </div>
                      <div className="mt-3 text-sm text-slate-300">
                        {compactDateTime(event.starts_at)}
                      </div>
                      {event.location ? (
                        <div className="mt-1 text-xs text-slate-500">{event.location}</div>
                      ) : null}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader
                description="Jüngste Rechnungen für Nachfassen, Druck und Zahlungsüberblick."
                title="Rechnungsradar"
              />
              <CardContent className="space-y-3 p-5">
                {dashboard.recentInvoices.map((invoice) => (
                  <div
                    className="rounded-[1.35rem] border border-white/10 bg-white/[0.03] px-4 py-4"
                    key={invoice.id}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-white">{invoice.title}</div>
                        <div className="mt-1 text-sm text-slate-400">{invoice.invoice_number}</div>
                      </div>
                      <Badge tone={invoice.status === "bezahlt" ? "success" : invoice.status === "ueberfaellig" ? "danger" : "warning"}>
                        {humanizeStatus(invoice.status)}
                      </Badge>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-slate-400">Fällig: {compactDate(invoice.due_date)}</span>
                      <span className="font-semibold text-white">{euro(invoice.total_amount)}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          <Card>
            <CardHeader
              description="Letzte Interaktionen für schnelle Nachvollziehbarkeit und GoBD-konforme Historie."
              title="Aktueller Feed"
              action={
                <Link
                  className="focus-ring inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-white/[0.06]"
                  href="/aktivitaeten"
                >
                  <FileText className="h-4 w-4" />
                  Aktivitäten öffnen
                </Link>
              }
            />
            <CardContent className="grid gap-3 p-5 lg:grid-cols-2">
              {dashboard.recentActivities.map((activity) => (
                <div
                  className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-4 py-4"
                  key={activity.id}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-mint-500/10 p-2 text-mint-200">
                          <Sparkles className="h-4 w-4" />
                        </div>
                        <h3 className="font-semibold text-white">{activity.title}</h3>
                      </div>
                      <p className="mt-2 text-sm text-slate-400">{humanizeStatus(activity.activity_type)}</p>
                    </div>
                    <div className="text-sm text-slate-500">
                      {compactDateTime(activity.starts_at)}
                    </div>
                  </div>
                  {activity.description ? (
                    <p className="mt-3 text-sm leading-6 text-slate-300">{activity.description}</p>
                  ) : null}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
