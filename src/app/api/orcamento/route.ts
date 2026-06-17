import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/config";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().trim().min(2, "Informe seu nome.").max(120),
  company: z.string().trim().min(1, "Informe a empresa.").max(160),
  whatsapp: z.string().trim().min(1).max(30),
  segment: z.string().trim().max(120).optional(),
  storeCount: z.coerce.number().int().min(1).max(100000).optional(),
  diagnosticoId: z.string().uuid().optional(),
});

/** Recebe um pedido de orçamento de implantação (público, vindo do relatório). */
export async function POST(request: Request) {
  if (!rateLimit(`orcamento:${clientIp(request)}`, 8, 60_000)) {
    return NextResponse.json({ error: "muitas_requisicoes" }, { status: 429 });
  }
  if (!supabaseAdminConfigured()) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "payload_invalido" }, { status: 400 });
  }
  const input = parsed.data;

  const admin = createAdminClient();

  // vincula ao diagnóstico (se veio de lá) para o admin ver o negócio/contato
  let businessName: string | null = null;
  let diagnosticId: string | null = null;
  if (input.diagnosticoId) {
    const { data } = await admin
      .from("diagnostics")
      .select("id, business_name")
      .eq("id", input.diagnosticoId)
      .maybeSingle();
    if (data) {
      diagnosticId = data.id;
      businessName = data.business_name;
    }
  }

  const { error } = await admin.from("quote_requests").insert({
    name: input.name,
    company: input.company,
    whatsapp: input.whatsapp,
    segment: input.segment ?? null,
    store_count: input.storeCount ?? null,
    diagnostic_id: diagnosticId,
    business_name: businessName,
  });
  if (error) {
    console.error("[api/orcamento]:", error.message);
    return NextResponse.json({ error: "erro_interno" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
