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
      projects,
      documents,
      calendarEvents,
    ] = await Promise.all([
      supabaseAdmin.from("customers").select("id, status").is("deleted_at", null),
      supabaseAdmin
        .from("opportunities")
        .select("id, stage, expected_value, actual_value")
        .is("deleted_at", null),
      supabaseAdmin
        .from("invoices")
        .select("id, title, invoice_number, status, issue_date, due_date, total_amount")
        .is("deleted_at", null),
      supabaseAdmin
        .from("tasks")
        .select("id, title, priority, status, due_date, owner_name")
        .is("deleted_at", null),
      supabaseAdmin
        .from("activities")
        .select("*")
        .is("deleted_at", null)
        .order("starts_at", { ascending: false }),
      supabaseAdmin.from("projects").select("id, status").is("deleted_at", null),
      supabaseAdmin.from("documents").select("id, file_size").is("deleted_at", null),
      supabaseAdmin
        .from("calendar_events")
        .select("id, title, starts_at, ends_at, location, event_type")
        .is("deleted_at", null)
        .order("starts_at", { ascending: true }),
    ]);

    const firstError =
      customers.error ??
      opportunities.error ??
      invoices.error ??
      tasks.error ??
      activities.error ??
      projects.error ??
      documents.error ??
      calendarEvents.error;

    if (firstError) {
      throw new Error(firstError.message);
    }

    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const weekThreshold = new Date();
    weekThreshold.setDate(weekThreshold.getDate() - 7);
    const nextWeekThreshold = new Date();
    nextWeekThreshold.setDate(nextWeekThreshold.getDate() + 7);

    const customerRows = customers.data ?? [];
    const invoiceRows = invoices.data ?? [];
    const opportunityRows = opportunities.data ?? [];
    const taskRows = tasks.data ?? [];
    const activityRows = activities.data ?? [];
    const projectRows = projects.data ?? [];
    const documentRows = documents.data ?? [];
    const calendarRows = calendarEvents.data ?? [];

    const revenueByMonth = Array.from({ length: 6 }).map((_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - index));
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const amount = invoiceRows
        .filter((invoice) => String(invoice.issue_date ?? "").startsWith(month))
        .reduce((sum, invoice) => sum + Number(invoice.total_amount ?? 0), 0);

      return { month, amount };
    });

    const closedDeals = opportunityRows.filter((opportunity) =>
      ["gewonnen", "verloren"].includes(String(opportunity.stage)),
    );
    const overdueInvoices = invoiceRows.filter(
      (invoice) =>
        invoice.status !== "bezahlt" &&
        invoice.due_date &&
        new Date(String(invoice.due_date)) < now,
    );
    const urgentTasks = taskRows
      .filter((task) => {
        const dueDate = task.due_date ? new Date(String(task.due_date)) : null;
        return (
          task.priority === "kritisch" ||
          (dueDate !== null && dueDate <= nextWeekThreshold && task.status !== "erledigt")
        );
      })
      .sort((left, right) => String(left.due_date ?? "").localeCompare(String(right.due_date ?? "")))
      .slice(0, 6);

    const upcomingEvents = calendarRows
      .filter((event) => {
        const startsAt = new Date(String(event.starts_at));
        return startsAt >= now && startsAt <= nextWeekThreshold;
      })
      .slice(0, 6);

    return jsonOk({
      customerCount: customerRows.length,
      leadCount: customerRows.filter((customer) => customer.status === "lead").length,
      activeProjectCount: projectRows.filter((project) => project.status === "aktiv").length,
      openRevenue: opportunityRows
        .filter((opportunity) => !["gewonnen", "verloren"].includes(String(opportunity.stage)))
        .reduce((sum, opportunity) => sum + Number(opportunity.expected_value ?? 0), 0),
      wonRevenue: opportunityRows
        .filter((opportunity) => opportunity.stage === "gewonnen")
        .reduce((sum, opportunity) => sum + Number(opportunity.actual_value ?? 0), 0),
      winRate:
        closedDeals.length > 0
          ? Math.round(
              (closedDeals.filter((opportunity) => opportunity.stage === "gewonnen").length /
                closedDeals.length) *
                100,
            )
          : 0,
      overdueInvoices: overdueInvoices.length,
      overdueInvoiceAmount: overdueInvoices.reduce(
        (sum, invoice) => sum + Number(invoice.total_amount ?? 0),
        0,
      ),
      taskDueToday: taskRows.filter((task) => String(task.due_date ?? "").startsWith(today)).length,
      urgentTaskCount: urgentTasks.length,
      activityCountWeek: activityRows.filter(
        (activity) => new Date(String(activity.starts_at)) >= weekThreshold,
      ).length,
      documentCount: documentRows.length,
      documentStorageMb:
        Math.round(
          (documentRows.reduce((sum, document) => sum + Number(document.file_size ?? 0), 0) /
            1024 /
            1024) *
            10,
        ) / 10,
      revenueByMonth,
      pipelineByStage: ["neu", "kontaktiert", "angebot", "verhandlung", "gewonnen", "verloren"].map(
        (stage) => ({
          stage,
          count: opportunityRows.filter((opportunity) => opportunity.stage === stage).length,
          amount: opportunityRows
            .filter((opportunity) => opportunity.stage === stage)
            .reduce((sum, opportunity) => sum + Number(opportunity.expected_value ?? 0), 0),
        }),
      ),
      taskByStatus: ["offen", "in_arbeit", "wartet", "erledigt"].map((status) => ({
        status,
        count: taskRows.filter((task) => task.status === status).length,
      })),
      recentActivities: activityRows.slice(0, 8),
      urgentTasks,
      upcomingEvents,
      recentInvoices: invoiceRows
        .slice()
        .sort((left, right) => String(right.issue_date ?? "").localeCompare(String(left.issue_date ?? "")))
        .slice(0, 6),
    });
  } catch (error) {
    return jsonError(error, 500);
  }
}
