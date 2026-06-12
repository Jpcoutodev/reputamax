import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/config";
import { createBusinessForUser } from "@/lib/data/business";
import type { BusinessSearchResult } from "@/lib/providers";

const bodySchema = z.object({
  diagnosticoId: z.string().uuid().optional(),
  businessName: z.string().min(1).max(200).optional(),
});

/**
 * Cria o business do usuário recém-cadastrado.
 * Com diagnosticoId, nasce pré-preenchido e vincula converted_business_id.
 */
export async function POST(request: Request) {
  if (!supabaseAdminConfigured()) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "nao_autenticado" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(body ?? {});
  if (!parsed.success) {
    return NextResponse.json({ error: "payload_invalido" }, { status: 400 });
  }

  const admin = createAdminClient();

  // idempotente: se o usuário já tem business, retorna ele
  const { data: existing } = await admin
    .from("businesses")
    .select("id, slug")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ id: existing.id, slug: existing.slug });
  }

  // dados do diagnóstico, se veio de lá
  let snapshot: BusinessSearchResult | null = null;
  let diagnosticId: string | null = null;
  if (parsed.data.diagnosticoId) {
    const { data: diagnostic } = await admin
      .from("diagnostics")
      .select("id, business_snapshot")
      .eq("id", parsed.data.diagnosticoId)
      .maybeSingle();
    if (diagnostic) {
      snapshot = diagnostic.business_snapshot as BusinessSearchResult;
      diagnosticId = diagnostic.id;
    }
  }

  try {
    const business = await createBusinessForUser(user.id, {
      snapshot,
      name: parsed.data.businessName,
    });

    if (diagnosticId) {
      await admin
        .from("diagnostics")
        .update({ converted_business_id: business.id })
        .eq("id", diagnosticId);
    }

    return NextResponse.json({ id: business.id, slug: business.slug });
  } catch (err) {
    console.error("[api/onboarding]:", err);
    return NextResponse.json({ error: "erro_interno" }, { status: 500 });
  }
}
