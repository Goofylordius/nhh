"use client";

import Link from "next/link";
import { Download, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { DashboardCharts } from "@/components/crm/dashboard-charts";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { fetchJson } from "@/lib/fetcher";
import { compactDateTime, euro } from "@/lib/utils";
import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";
import { useAppContext } from "@/providers/app-provider";
import type { DashboardPayload } from "@/types/crm";

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

  useRealtimeRefresh(["customers", "opportunities", "invoices", "tasks", "activities"], load);

  return (
    <AppShell
      actions={
        <>
          <Link
            className="focus-ring inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/8 px-4 py-2.5 text-sm font-semibold text-slate-100"
            href="/api/export/customers/csv"
          >
            <Download className="h-4 w-4" />
            Kunden CSV
          </Link>
          <Link
            className="focus-ring inline-flex items-center gap-2 rounded-2xl bg-mint-500 px-4 py-2.5 text-sm font-semibold text-slate-950"
            href="/einstellungen"
          >
            <ShieldCheck className="h-4 w-4" />
            Compliance
          </Link>
        </>
      }
      description="KPI-Board für Vertrieb, Projekte, Rechnungen und tägliche Aufgaben im laufenden Betrieb."
      title="Dashboard"
    >
      {loading || !dashboard ? (
        <Card>
          <CardContent className="p-10 text-center text-sm text-slate-300">
            Dashboard wird geladen...
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-slate-400">Kunden</p>
                <p className="mt-2 font-display text-4xl text-white">{dashboard.customerCount}</p>
                <p className="mt-2 text-sm text-slate-400">{dashboard.leadCount} offene Leads</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-slate-400">Offene Pipeline</p>
                <p className="mt-2 font-display text-4xl text-white">{euro(dashboard.openRevenue)}</p>
                <p className="mt-2 text-sm text-slate-400">Gewonnen: {euro(dashboard.wonRevenue)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-slate-400">Überfällige Rechnungen</p>
                <p className="mt-2 font-display text-4xl text-white">{dashboard.overdueInvoices}</p>
                <p className="mt-2 text-sm text-slate-400">
                  Heute fällige Aufgaben: {dashboard.taskDueToday}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-slate-400">Aktivitäten 7 Tage</p>
                <p className="mt-2 font-display text-4xl text-white">{dashboard.activityCountWeek}</p>
                <p className="mt-2 text-sm text-slate-400">Live via Supabase Realtime</p>
              </CardContent>
            </Card>
          </div>

          <DashboardCharts dashboard={dashboard} />

          <Card>
            <CardHeader
              description="Letzte Interaktionen für schnelle Nachvollziehbarkeit und GoBD-konforme Historie."
              title="Aktueller Feed"
            />
            <CardContent className="space-y-3 p-5">
              {dashboard.recentActivities.map((activity) => (
                <div
                  className="rounded-3xl border border-white/8 bg-white/5 px-4 py-4"
                  key={activity.id}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-white">{activity.title}</h3>
                      <p className="text-sm text-slate-400">{activity.activity_type}</p>
                    </div>
                    <div className="text-sm text-slate-500">
                      {compactDateTime(activity.starts_at)}
                    </div>
                  </div>
                  {activity.description ? (
                    <p className="mt-3 text-sm text-slate-300">{activity.description}</p>
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
