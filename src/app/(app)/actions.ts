"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/config";

type ActionResult = { ok: boolean; demo?: boolean; error?: string };

async function getOwnedBusinessId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();
  return data?.id ?? null;
}

const stepsSchema = z.object({
  perfil: z.boolean().optional(),
  pagina: z.boolean().optional(),
  qr: z.boolean().optional(),
  primeiras: z.boolean().optional(),
});

/** Persiste passos do checklist de ativação (merge com o estado atual). */
export async function updateOnboardingSteps(
  partial: z.infer<typeof stepsSchema>
): Promise<ActionResult> {
  if (!supabaseConfigured()) return { ok: true, demo: true };
  const parsed = stepsSchema.safeParse(partial);
  if (!parsed.success) return { ok: false, error: "payload_invalido" };

  const supabase = await createClient();
  const businessId = await getOwnedBusinessId();
  if (!businessId) return { ok: false, error: "sem_negocio" };

  const { data: current } = await supabase
    .from("businesses")
    .select("onboarding_steps")
    .eq("id", businessId)
    .single();

  const merged = { ...(current?.onboarding_steps ?? {}), ...parsed.data };
  const { error } = await supabase
    .from("businesses")
    .update({ onboarding_steps: merged })
    .eq("id", businessId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard");
  return { ok: true };
}

const replySchema = z.object({
  reviewId: z.string().uuid(),
  replyText: z.string().min(1).max(2000),
});

/** Salva a resposta de uma avaliação (no modo real apenas marca no banco; GBP API publica de verdade na fase 2). */
export async function replyToReview(input: z.infer<typeof replySchema>): Promise<ActionResult> {
  if (!supabaseConfigured()) return { ok: true, demo: true };
  const parsed = replySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "payload_invalido" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("reviews")
    .update({ replied: true, reply_text: parsed.data.replyText })
    .eq("id", parsed.data.reviewId); // RLS garante que é do dono

  if (error) return { ok: false, error: error.message };
  revalidatePath("/avaliacoes");
  return { ok: true };
}

/** Marca um feedback interceptado como resolvido. */
export async function resolveFeedback(id: string): Promise<ActionResult> {
  if (!supabaseConfigured()) return { ok: true, demo: true };
  if (!z.string().uuid().safeParse(id).success) return { ok: false, error: "id_invalido" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("funnel_responses")
    .update({ resolved: true })
    .eq("id", id); // RLS garante que é do dono

  if (error) return { ok: false, error: error.message };
  revalidatePath("/feedbacks");
  revalidatePath("/dashboard");
  return { ok: true };
}

const settingsSchema = z.object({
  welcomeMessage: z.string().max(120).optional(),
  reviewLink: z.string().url().max(500).or(z.literal("")).optional(),
});

/** Configurações da página pública de avaliação. */
export async function updatePageSettings(
  input: z.infer<typeof settingsSchema>
): Promise<ActionResult> {
  if (!supabaseConfigured()) return { ok: true, demo: true };
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Link inválido — cole a URL completa começando com https://" };
  }

  const supabase = await createClient();
  const businessId = await getOwnedBusinessId();
  if (!businessId) return { ok: false, error: "sem_negocio" };

  const { error } = await supabase
    .from("businesses")
    .update({
      welcome_message: parsed.data.welcomeMessage || null,
      review_link: parsed.data.reviewLink || null,
    })
    .eq("id", businessId);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/pagina-avaliacao");
  return { ok: true };
}

const profileSchema = z.object({
  name: z.string().min(2).max(200),
  category: z.string().max(100).optional(),
  address: z.string().max(300).optional(),
  tone: z.enum(["amigavel", "formal"]),
});

/** Dados do negócio + tom de voz. */
export async function updateBusinessProfile(
  input: z.infer<typeof profileSchema>
): Promise<ActionResult> {
  if (!supabaseConfigured()) return { ok: true, demo: true };
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Confira os campos e tente de novo." };

  const supabase = await createClient();
  const businessId = await getOwnedBusinessId();
  if (!businessId) return { ok: false, error: "sem_negocio" };

  const { error } = await supabase
    .from("businesses")
    .update({
      name: parsed.data.name,
      category: parsed.data.category || null,
      address: parsed.data.address || null,
      tone: parsed.data.tone,
    })
    .eq("id", businessId);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/configuracoes");
  revalidatePath("/dashboard");
  return { ok: true };
}
