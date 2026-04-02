"use client";

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { euro } from "@/lib/utils";
import type { DashboardPayload } from "@/types/crm";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Legend,
  Tooltip,
);

export function DashboardCharts({ dashboard }: { dashboard: DashboardPayload }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.4fr,1fr]">
      <Card>
        <CardHeader
          description="Letzte sechs Monate auf Basis der Rechnungsdaten."
          title="Umsatzentwicklung"
        />
        <CardContent className="p-5">
          <Line
            data={{
              labels: dashboard.revenueByMonth.map((item) => item.month),
              datasets: [
                {
                  label: "Umsatz",
                  data: dashboard.revenueByMonth.map((item) => item.amount),
                  borderColor: "#22b58e",
                  backgroundColor: "rgba(34,181,142,0.15)",
                  tension: 0.28,
                  fill: true,
                },
              ],
            }}
            options={{
              plugins: {
                tooltip: {
                  callbacks: {
                    label: (context) => euro(context.parsed.y),
                  },
                },
              },
              responsive: true,
              maintainAspectRatio: false,
            }}
            height={280}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader description="Pipeline-Stufen mit Volumen." title="Pipeline-Mix" />
        <CardContent className="p-5">
          <Doughnut
            data={{
              labels: dashboard.pipelineByStage.map((item) => item.stage),
              datasets: [
                {
                  data: dashboard.pipelineByStage.map((item) => item.amount || item.count),
                  backgroundColor: ["#cfa362", "#22b58e", "#f0b56d", "#cf6a3e", "#19886b", "#7c3f2a"],
                  borderWidth: 0,
                },
              ],
            }}
            options={{
              plugins: {
                tooltip: {
                  callbacks: {
                    label: (context) => `${context.label}: ${euro(context.parsed)}`,
                  },
                },
              },
              responsive: true,
              maintainAspectRatio: false,
            }}
            height={280}
          />
        </CardContent>
      </Card>
      <Card className="xl:col-span-2">
        <CardHeader description="Offen, in Arbeit, wartend oder erledigt." title="Aufgabenstatus" />
        <CardContent className="p-5">
          <Bar
            data={{
              labels: dashboard.taskByStatus.map((item) => item.status),
              datasets: [
                {
                  label: "Aufgaben",
                  data: dashboard.taskByStatus.map((item) => item.count),
                  backgroundColor: ["#cf6a3e", "#22b58e", "#d6ccb3", "#795e33"],
                  borderRadius: 14,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    precision: 0,
                  },
                },
              },
            }}
            height={220}
          />
        </CardContent>
      </Card>
    </div>
  );
}
