import Papa from "papaparse";

import { jsonError } from "@/lib/http";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("customers")
      .select("customer_number, company_name, contact_name, email, phone, city, industry, status, tags, created_at")
      .is("deleted_at", null)
      .order("company_name");

    if (error) {
      throw new Error(error.message);
    }

    const csv = Papa.unparse(
      (data ?? []).map((record) => ({
        kundennummer: record.customer_number,
        kunde: record.company_name,
        ansprechpartner: record.contact_name,
        email: record.email,
        telefon: record.phone,
        ort: record.city,
        branche: record.industry,
        status: record.status,
        tags: Array.isArray(record.tags) ? record.tags.join(", ") : "",
        erstellt_am: record.created_at,
      })),
      { delimiter: ";" },
    );

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="kunden-export.csv"',
      },
    });
  } catch (error) {
    return jsonError(error, 500);
  }
}

