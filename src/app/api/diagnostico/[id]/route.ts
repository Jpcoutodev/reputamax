import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/config";
import { emailProvider } from "@/lib/providers";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const uuidSchema = z.string().uuid();

/** Retorna o diagnóstico (snapshot, result, status, se o lead já foi capturado). */
export async function GET(_request: Request, context: RouteContext) {
  if (!supabaseAdminConfigured()) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }
  const { id } = await context.params;
  if (!uuidSchema.safeParse(id).success) {
    return NextResponse.json({ error: "id_invalido" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("diagnostics")
    .select("id, place_id, business_name, business_snapshot, result, status, lead_captured_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[api/diagnostico/:id] select:", error.message);
    return NextResponse.json({ error: "erro_interno" }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "nao_encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    id: data.id,
    placeId: data.place_id,
    business: data.business_snapshot,
    result: data.result,
    status: data.status,
    leadCaptured: Boolean(data.lead_captured_at),
  });
}

const leadSchema = z.object({
  email: z.string().email().max(200),
  whatsapp: z.string().max(30).optional(),
});

/** Captura o lead (e-mail + whatsapp opcional) e dispara o e-mail do relatório. */
export async function PATCH(request: Request, context: RouteContext) {
  if (!supabaseAdminConfigured()) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }
  const { id } = await context.params;
  if (!uuidSchema.safeParse(id).success) {
    return NextResponse.json({ error: "id_invalido" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "payload_invalido" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("diagnostics")
    .update({
      lead_email: parsed.data.email,
      lead_whatsapp: parsed.data.whatsapp ?? null,
      lead_captured_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("[api/diagnostico/:id] lead:", error.message);
    return NextResponse.json({ error: "erro_interno" }, { status: 500 });
  }

  await emailProvider.sendDiagnosisReport(parsed.data.email, id);
  return NextResponse.json({ ok: true });
}
