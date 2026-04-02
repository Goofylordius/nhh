import { jsonError } from "@/lib/http";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ customerId: string }> },
) {
  try {
    const { customerId } = await params;

    const [customer, contacts, opportunities, quotes, invoices, projects, tasks, calendarEvents, documents, activities] =
      await Promise.all([
        supabaseAdmin.from("customers").select("*").eq("id", customerId).single(),
        supabaseAdmin.from("contacts").select("*").eq("customer_id", customerId).is("deleted_at", null),
        supabaseAdmin.from("opportunities").select("*").eq("customer_id", customerId).is("deleted_at", null),
        supabaseAdmin.from("quotes").select("*").eq("customer_id", customerId).is("deleted_at", null),
        supabaseAdmin.from("invoices").select("*").eq("customer_id", customerId).is("deleted_at", null),
        supabaseAdmin.from("projects").select("*").eq("customer_id", customerId).is("deleted_at", null),
        supabaseAdmin.from("tasks").select("*").eq("customer_id", customerId).is("deleted_at", null),
        supabaseAdmin.from("calendar_events").select("*").eq("customer_id", customerId).is("deleted_at", null),
        supabaseAdmin.from("documents").select("*").eq("customer_id", customerId).is("deleted_at", null),
        supabaseAdmin.from("activities").select("*").eq("customer_id", customerId).is("deleted_at", null),
      ]);

    const firstError =
      customer.error ??
      contacts.error ??
      opportunities.error ??
      quotes.error ??
      invoices.error ??
      projects.error ??
      tasks.error ??
      calendarEvents.error ??
      documents.error ??
      activities.error;

    if (firstError) {
      throw new Error(firstError.message);
    }

    const quoteIds = (quotes.data ?? []).map((quote) => quote.id);
    const invoiceIds = (invoices.data ?? []).map((invoice) => invoice.id);

    const [quoteItems, invoiceItems] = await Promise.all([
      supabaseAdmin
        .from("quote_items")
        .select("*")
        .in("quote_id", quoteIds.length ? quoteIds : ["00000000-0000-0000-0000-000000000000"])
        .is("deleted_at", null),
      supabaseAdmin
        .from("invoice_items")
        .select("*")
        .in("invoice_id", invoiceIds.length ? invoiceIds : ["00000000-0000-0000-0000-000000000000"])
        .is("deleted_at", null),
    ]);

    if (quoteItems.error || invoiceItems.error) {
      throw new Error(quoteItems.error?.message ?? invoiceItems.error?.message ?? "Positionsdaten konnten nicht geladen werden.");
    }

    const payload = {
      exported_at: new Date().toISOString(),
      customer: customer.data,
      contacts: contacts.data ?? [],
      opportunities: opportunities.data ?? [],
      quotes: quotes.data ?? [],
      quote_items: quoteItems.data ?? [],
      invoices: invoices.data ?? [],
      invoice_items: invoiceItems.data ?? [],
      projects: projects.data ?? [],
      tasks: tasks.data ?? [],
      calendar_events: calendarEvents.data ?? [],
      documents: documents.data ?? [],
      activities: activities.data ?? [],
    };

    return new Response(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="betroffenenexport-${customerId}.json"`,
      },
    });
  } catch (error) {
    return jsonError(error, 500);
  }
}
