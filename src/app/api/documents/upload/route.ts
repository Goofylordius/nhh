import { createHash } from "node:crypto";

import { jsonCreated, jsonError } from "@/lib/http";
import { getActorLabel } from "@/lib/crm-server";
import { serverEnv } from "@/lib/env.server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const actorLabel = getActorLabel(request);
    const formData = await request.formData();
    const file = formData.get("file");
    const title = String(formData.get("title") ?? "");
    const category = String(formData.get("category") ?? "sonstiges");
    const customerId = String(formData.get("customer_id") ?? "") || null;
    const projectId = String(formData.get("project_id") ?? "") || null;

    if (!(file instanceof File)) {
      throw new Error("Es wurde keine Datei uebermittelt.");
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const checksum = createHash("sha256").update(buffer).digest("hex");
    const basePath = customerId ? `customers/${customerId}` : projectId ? `projects/${projectId}` : "general";
    const storagePath = `${basePath}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    let previousVersionQuery = supabaseAdmin
      .from("documents")
      .select("version_no")
      .eq("title", title || file.name)
      .order("version_no", { ascending: false })
      .limit(1);

    previousVersionQuery = customerId
      ? previousVersionQuery.eq("customer_id", customerId)
      : previousVersionQuery.is("customer_id", null);
    previousVersionQuery = projectId
      ? previousVersionQuery.eq("project_id", projectId)
      : previousVersionQuery.is("project_id", null);

    const { data: previousVersion, error: previousVersionError } = await previousVersionQuery.maybeSingle();

    if (previousVersionError) {
      throw new Error(previousVersionError.message);
    }

    const { error: uploadError } = await supabaseAdmin.storage
      .from(serverEnv.SUPABASE_STORAGE_BUCKET)
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data, error } = await supabaseAdmin
      .from("documents")
      .insert({
        customer_id: customerId,
        project_id: projectId,
        title: title || file.name,
        file_name: file.name,
        mime_type: file.type,
        category,
        bucket_name: serverEnv.SUPABASE_STORAGE_BUCKET,
        storage_path: storagePath,
        file_size: file.size,
        version_no: Number(previousVersion?.version_no ?? 0) + 1,
        checksum,
        modified_by_label: actorLabel,
      })
      .select("*")
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "Dokument konnte nicht gespeichert werden.");
    }

    return jsonCreated(data);
  } catch (error) {
    return jsonError(error, 400);
  }
}
