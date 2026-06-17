import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/config";
import { clientIp, rateLimit } from "@/lib/rate-limit";

// whitelist de eventos — nada de evento arbitrário no banco
const eventSchema = z.object({
  event: z.enum([
    "landing_view",
    "diagnostico_view",
    "diagnostico_negocio_selecionado",
  ]),
  path: z.string().max(200).optional(),
  sessionId: z.string().max(64).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/** Registra eventos de analytics da parte pública (landing/diagnóstico). */
export async function POST(request: Request) {
  if (!rateLimit(`track:${clientIp(request)}`, 60, 60_000)) {
    return NextResponse.json({ ok: true }); // silencioso: tracking nunca quebra UX
  }
  if (!supabaseAdminConfigured()) {
    return NextResponse.json({ ok: true });
  }

  const body = await request.json().catch(() => null);
  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: true });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("analytics_events").insert({
    event: parsed.data.event,
    path: parsed.data.path ?? null,
    session_id: parsed.data.sessionId ?? null,
    metadata: parsed.data.metadata ?? null,
  });
  if (error) {
    // tabela pode não existir ainda (migration 0003) — só loga
    console.warn("[api/track]:", error.message);
  }

  return NextResponse.json({ ok: true });
}
