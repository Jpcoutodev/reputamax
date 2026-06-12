import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/config";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const responseSchema = z.object({
  slug: z.string().min(1).max(100),
  rating: z.number().int().min(1).max(5),
  redirectedToGoogle: z.boolean().default(false),
  feedbackText: z.string().max(2000).optional(),
  customerName: z.string().max(120).optional(),
  customerContact: z.string().max(200).optional(),
});

/** Grava a resposta da página pública de avaliação (sem login). */
export async function POST(request: Request) {
  if (!rateLimit(`funnel:${clientIp(request)}`, 10, 60_000)) {
    return NextResponse.json({ error: "muitas_requisicoes" }, { status: 429 });
  }
  if (!supabaseAdminConfigured()) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const parsed = responseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "payload_invalido" }, { status: 400 });
  }
  const input = parsed.data;

  const supabase = createAdminClient();

  // valida que o negócio existe (a página pública envia o slug)
  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("slug", input.slug)
    .maybeSingle();

  if (!business) {
    return NextResponse.json({ error: "negocio_nao_encontrado" }, { status: 404 });
  }

  // feedback privado só faz sentido para notas baixas
  const isLow = input.rating <= 3;
  const { error } = await supabase.from("funnel_responses").insert({
    business_id: business.id,
    rating: input.rating,
    redirected_to_google: input.redirectedToGoogle && !isLow,
    feedback_text: isLow ? (input.feedbackText ?? null) : null,
    customer_name: isLow ? (input.customerName ?? null) : null,
    customer_contact: isLow ? (input.customerContact ?? null) : null,
  });

  if (error) {
    console.error("[api/review-funnel] insert:", error.message);
    return NextResponse.json({ error: "erro_interno" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
