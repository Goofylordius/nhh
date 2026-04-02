import { NextResponse } from "next/server";

import { jsonError } from "@/lib/http";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { data: document, error } = await supabaseAdmin
      .from("documents")
      .select("bucket_name, storage_path")
      .eq("id", id)
      .single();

    if (error || !document) {
      throw new Error(error?.message ?? "Dokument nicht gefunden.");
    }

    const { data: signed, error: signedError } = await supabaseAdmin.storage
      .from(document.bucket_name)
      .createSignedUrl(document.storage_path, 60);

    if (signedError || !signed) {
      throw new Error(signedError?.message ?? "Download-Link konnte nicht erstellt werden.");
    }

    return NextResponse.redirect(signed.signedUrl);
  } catch (error) {
    return jsonError(error, 404);
  }
}
