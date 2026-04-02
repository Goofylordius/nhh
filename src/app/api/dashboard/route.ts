import { jsonError, jsonOk } from "@/lib/http";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const [
      customers,
      opportunities,
      invoices,
      tasks,
      activities,
    ] = await Promise.all([
      supabaseAdmin.from("customers").select("id, status").is("deleted_at", null),
      supabaseAdmin.from("opportunities").select("id, stage, expected_value, actual_value").is("deleted_at", null),
      supabaseAdmin.from("invoices").select("id, status, issue_date, due_date, total_amount").is("deleted_at", null),
      supabaseAdmin.from("tasks").select("id, status, due_date").is("deleted_at", null),
      supabaseAdmin.from("activities").select("*").is("deleted_at", null).order("starts_at", { ascending: false }),
    ]);

    const firstError =
      customers.error ??
      opportunities.error ??
      invoices.error ??
      tasks.error ??
      activities.error;

    if (firstError) {
      throw new Error(firstError.message);
    }

    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const weekThreshold = new Date();
    weekThreshold.setDate(weekThreshold.getDate() - 7);

    const invoiceRows = invoices.data ?? [];
    const opportunityRows = opportunities.data ?? [];
    const taskRows = tasks.data ?? [];
    const activityRows = activities.data ?? [];

    const revenueByMonth = Array.from({ length: 6 }).map((_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - index));
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const amount = invoiceRows
        .filter((invoice) => String(invoice.issue_date ?? "").startsWith(month))
        .reduce((sum, invoice) => sum + Number(invoice.total_amount ?? 0), 0);

      return { month, amount };
    });

    return jsonOk({
      customerCount: (customers.data ?? []).length,
      leadCount: (customers.data ?? []).filter((customer) => customer.status === "lead").length,
      openRevenue: opportunityRows
        .filter((opportunity) => !["gewonnen", "verloren"].includes(String(opportunity.stage)))
        .reduce((sum, opportunity) => sum + Number(opportunity.expected_value ?? 0), 0),
      wonRevenue: opportunityRows
        .filter((opportunity) => opportunity.stage === "gewonnen")
        .reduce((sum, opportunity) => sum + Number(opportunity.actual_value ?? 0), 0),
      overdueInvoices: invoiceRows.filter(
        (invoice) =>
          invoice.status !== "bezahlt" &&
          invoice.due_date &&
          new Date(String(invoice.due_date)) < now,
      ).length,
      taskDueToday: taskRows.filter((task) => String(task.due_date ?? "").startsWith(today)).length,
      activityCountWeek: activityRows.filter((activity) => new Date(String(activity.starts_at)) >= weekThreshold).length,
      revenueByMonth,
      pipelineByStage: ["neu", "kontaktiert", "angebot", "verhandlung", "gewonnen", "verloren"].map((stage) => ({
        stage,
        count: opportunityRows.filter((opportunity) => opportunity.stage === stage).length,
        amount: opportunityRows
          .filter((opportunity) => opportunity.stage === stage)
          .reduce((sum, opportunity) => sum + Number(opportunity.expected_value ?? 0), 0),
      })),
      taskByStatus: ["offen", "in_arbeit", "wartet", "erledigt"].map((status) => ({
        status,
        count: taskRows.filter((task) => task.status === status).length,
      })),
      recentActivities: activityRows.slice(0, 8),
    });
  } catch (error) {
    return jsonError(error, 500);
  }
}
