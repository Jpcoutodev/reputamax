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

const modelSchema = z.object({
  provider: z.enum(["minimax", "anthropic", "openai"]),
  model: z.string().trim().max(120),
});

/** Define o modelo de um provider (texto vazio = volta ao env/default do código). */
export async function updateAiModel(provider: string, model: string): Promise<ActionResult> {
  if (!(await ensureAdmin())) return { ok: false, error: "sem_permissao" };
  const parsed = modelSchema.safeParse({ provider, model });
  if (!parsed.success) return { ok: false, error: "payload_invalido" };

  const key = `ai_model_${parsed.data.provider}`;
  if (parsed.data.model) {
    await setSetting(key, parsed.data.model);
  } else {
    await deleteSetting(key);
  }
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

const uuidSchema = z.string().uuid();

/** Exclui um pedido de orçamento. */
export async function deleteQuoteRequest(id: string): Promise<ActionResult> {
  if (!(await ensureAdmin())) return { ok: false, error: "sem_permissao" };
  if (!uuidSchema.safeParse(id).success) return { ok: false, error: "id_invalido" };

  const admin = createAdminClient();
  const { error } = await admin.from("quote_requests").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/orcamentos");
  return { ok: true };
}

/** Exclui um lead/diagnóstico do CRM (desvincula orçamentos antes, por causa da FK). */
export async function deleteDiagnostic(id: string): Promise<ActionResult> {
  if (!(await ensureAdmin())) return { ok: false, error: "sem_permissao" };
  if (!uuidSchema.safeParse(id).success) return { ok: false, error: "id_invalido" };

  const admin = createAdminClient();
  // remove o vínculo dos orçamentos para não violar a chave estrangeira
  await admin.from("quote_requests").update({ diagnostic_id: null }).eq("diagnostic_id", id);
  const { error } = await admin.from("diagnostics").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/crm");
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
