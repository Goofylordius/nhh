import { jsonError } from "@/lib/http";
import { supabaseAdmin } from "@/lib/supabase/admin";

function toIcalDate(value: string) {
  return new Date(value)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("calendar_events")
      .select("*")
      .is("deleted_at", null)
      .order("starts_at");

    if (error) {
      throw new Error(error.message);
    }

    const body = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//WerkstattCRM//Kalender//DE",
      ...(data ?? []).flatMap((event) => [
        "BEGIN:VEVENT",
        `UID:${event.id}@werkstattcrm.local`,
        `SUMMARY:${event.title}`,
        `DESCRIPTION:${event.description ?? ""}`,
        `LOCATION:${event.location ?? ""}`,
        `DTSTART:${toIcalDate(event.starts_at)}`,
        `DTEND:${toIcalDate(event.ends_at)}`,
        "END:VEVENT",
      ]),
      "END:VCALENDAR",
    ].join("\r\n");

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": 'attachment; filename="werkstattcrm-kalender.ics"',
      },
    });
  } catch (error) {
    return jsonError(error, 500);
  }
}
