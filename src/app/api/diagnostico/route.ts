import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/config";
import { reviewProvider } from "@/lib/providers";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const createSchema = z.object({
  placeId: z.string().min(1).max(200),
});

/** Cria um diagnóstico (status processing) a partir do negócio selecionado. */
export async function POST(request: Request) {
  if (!rateLimit(`diag:${clientIp(request)}`, 10, 60_000)) {
    return NextResponse.json({ error: "muitas_requisicoes" }, { status: 429 });
  }
  if (!supabaseAdminConfigured()) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "payload_invalido" }, { status: 400 });
  }

  let business;
  try {
    business = await reviewProvider.getBusinessDetails(parsed.data.placeId);
  } catch {
    return NextResponse.json({ error: "negocio_nao_encontrado" }, { status: 404 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("diagnostics")
    .insert({
      place_id: business.placeId,
      business_name: business.name,
      business_snapshot: business,
      status: "processing",
    })
    .select("id")
    .single();

  if (error) {
    console.error("[api/diagnostico] insert:", error.message);
    return NextResponse.json({ error: "erro_interno" }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}
