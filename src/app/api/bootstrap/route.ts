import { jsonError, jsonOk } from "@/lib/http";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const [customers, contacts, projects, opportunities, settings] = await Promise.all([
      supabaseAdmin.from("customers").select("*").is("deleted_at", null).order("company_name"),
      supabaseAdmin.from("contacts").select("*").is("deleted_at", null).order("last_name"),
      supabaseAdmin.from("projects").select("*").is("deleted_at", null).order("title"),
      supabaseAdmin.from("opportunities").select("*").is("deleted_at", null).order("updated_at", { ascending: false }),
      supabaseAdmin.from("settings").select("*").is("deleted_at", null).order("setting_group"),
    ]);

    const firstError =
      customers.error ??
      contacts.error ??
      projects.error ??
      opportunities.error ??
      settings.error;

    if (firstError) {
      throw new Error(firstError.message);
    }

    const tagSetting = (settings.data ?? []).find(
      (record) => record.setting_group === "tags" && record.setting_key === "kunden",
    );
    const pipelineSetting = (settings.data ?? []).find(
      (record) => record.setting_group === "pipeline" && record.setting_key === "stages",
    );

    return jsonOk({
      customers: customers.data ?? [],
      contacts: contacts.data ?? [],
      projects: projects.data ?? [],
      opportunities: opportunities.data ?? [],
      settings: settings.data ?? [],
      tags:
        Array.isArray(tagSetting?.setting_value?.values)
          ? tagSetting.setting_value.values.map((value: string) => ({
              label: value,
              value,
            }))
          : [],
      pipelineStages:
        Array.isArray(pipelineSetting?.setting_value?.values)
          ? pipelineSetting.setting_value.values.map((value: string) => ({
              label: value,
              value,
            }))
          : [],
    });
  } catch (error) {
    return jsonError(error, 500);
  }
}

