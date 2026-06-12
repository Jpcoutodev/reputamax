"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdminUser } from "@/lib/data/admin";
import { deleteSetting, setSetting } from "@/lib/data/settings";
import { createAdminClient } from "@/lib/supabase/admin";

type ActionResult = { ok: boolean; error?: string };

async function ensureAdmin(): Promise<boolean> {
  const admin = await getAdminUser();
  return Boolean(admin);
}

const providerSchema = z.enum(["mock", "minimax", "anthropic", "openai"]);

/** Troca o provider de IA ativo (vale na próxima análise, sem deploy). */
export async function updateAiProvider(provider: string): Promise<ActionResult> {
  if (!(await ensureAdmin())) return { ok: false, error: "sem_permissao" };
  const parsed = providerSchema.safeParse(provider);
  if (!parsed.success) return { ok: false, error: "provider_invalido" };

  await setSetting("ai_provider", parsed.data);
  revalidatePath("/admin/configuracoes");
  return { ok: true };
}

const promptKeySchema = z.enum(["ai_analysis_system", "ai_analysis_rules", "ai_reply_system"]);

/** Salva um prompt customizado (texto vazio = volta ao padrão do código). */
export async function updatePrompt(key: string, value: string): Promise<ActionResult> {
  if (!(await ensureAdmin())) return { ok: false, error: "sem_permissao" };
  const parsedKey = promptKeySchema.safeParse(key);
  if (!parsedKey.success) return { ok: false, error: "chave_invalida" };

  const trimmed = value.trim();
  if (trimmed.length > 8000) {
    return { ok: false, error: "Prompt muito longo (máx. 8000 caracteres)." };
  }

  if (trimmed) {
    await setSetting(parsedKey.data, trimmed);
  } else {
    await deleteSetting(parsedKey.data);
  }
  revalidatePath("/admin/configuracoes");
  return { ok: true };
}

const crmStageSchema = z.object({
  id: z.string().uuid(),
  stage: z.enum(["diagnostico", "lead", "contatado", "negociacao", "cliente", "perdido"]),
});

/** Define manualmente a fase de um registro do CRM. */
export async function updateCrmStage(id: string, stage: string): Promise<ActionResult> {
  if (!(await ensureAdmin())) return { ok: false, error: "sem_permissao" };
  const parsed = crmStageSchema.safeParse({ id, stage });
  if (!parsed.success) return { ok: false, error: "payload_invalido" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("diagnostics")
    .update({ crm_stage: parsed.data.stage })
    .eq("id", parsed.data.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/crm");
  return { ok: true };
}
