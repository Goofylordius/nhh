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
  const axisColor = "rgba(148, 163, 184, 0.92)";
  const gridColor = "rgba(148, 163, 184, 0.14)";
  const legendColor = "#e5edf5";

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
                  borderColor: "#3de7b8",
                  backgroundColor: "rgba(61,231,184,0.12)",
                  tension: 0.28,
                  fill: true,
                },
              ],
            }}
            options={{
              plugins: {
                legend: {
                  labels: {
                    color: legendColor,
                  },
                },
                tooltip: {
                  callbacks: {
                    label: (context) => euro(context.parsed.y),
                  },
                },
              },
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: {
                  ticks: {
                    color: axisColor,
                  },
                  grid: {
                    color: gridColor,
                  },
                },
                y: {
                  ticks: {
                    color: axisColor,
                  },
                  grid: {
                    color: gridColor,
                  },
                },
              },
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
                  backgroundColor: ["#f1be77", "#3de7b8", "#ffb36d", "#ff8e67", "#1ebd8d", "#8a4d36"],
                  borderWidth: 0,
                },
              ],
            }}
            options={{
              plugins: {
                legend: {
                  labels: {
                    color: legendColor,
                  },
                },
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
                  backgroundColor: ["#ff8e67", "#3de7b8", "#6b7280", "#a78bfa"],
                  borderRadius: 14,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  labels: {
                    color: legendColor,
                  },
                },
              },
              scales: {
                x: {
                  ticks: {
                    color: axisColor,
                  },
                  grid: {
                    color: gridColor,
                  },
                },
                y: {
                  beginAtZero: true,
                  ticks: {
                    color: axisColor,
                    precision: 0,
                  },
                  grid: {
                    color: gridColor,
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
