import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/config";
import { analysisProvider, reviewProvider } from "@/lib/providers";
import type { BusinessSearchResult } from "@/lib/providers";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** Roda a análise no servidor e grava o resultado (idempotente). */
export async function POST(_request: Request, context: RouteContext) {
  if (!supabaseAdminConfigured()) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }
  const { id } = await context.params;
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: "id_invalido" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: diagnostic, error } = await supabase
    .from("diagnostics")
    .select("id, place_id, business_snapshot, result, status")
    .eq("id", id)
    .maybeSingle();

  if (error || !diagnostic) {
    return NextResponse.json({ error: "nao_encontrado" }, { status: 404 });
  }

  // já analisado → retorna direto (idempotência)
  if (diagnostic.status === "ready" && diagnostic.result) {
    return NextResponse.json({ result: diagnostic.result, status: "ready" });
  }

  const business = diagnostic.business_snapshot as BusinessSearchResult;
  const [reviews, competitors] = await Promise.all([
    reviewProvider.getReviews(diagnostic.place_id),
    reviewProvider.getCompetitors(diagnostic.place_id),
  ]);
  const result = await analysisProvider.analyzeReviews(business, reviews, competitors);

  const { error: updateError } = await supabase
    .from("diagnostics")
    .update({ result, status: "ready" })
    .eq("id", id);

  if (updateError) {
    console.error("[api/diagnostico/:id/analyze]:", updateError.message);
    return NextResponse.json({ error: "erro_interno" }, { status: 500 });
  }

  return NextResponse.json({ result, status: "ready" });
}
