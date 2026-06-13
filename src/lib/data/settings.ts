import "server-only";
import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/config";

/**
 * Configurações da aplicação (tabela app_settings, chave/valor jsonb).
 * Editáveis pelo painel admin sem deploy. Acesso só via service role.
 */

export type AiProviderId = "mock" | "minimax" | "anthropic" | "openai";

export interface AppSettings {
  aiProvider: AiProviderId;
  /** modelo escolhido por provider — null = usa env > default do código */
  aiModels: {
    minimax: string | null;
    anthropic: string | null;
    openai: string | null;
  };
  /** overrides de prompt — null = usa o padrão do código */
  aiAnalysisSystem: string | null;
  aiAnalysisRules: string | null;
  aiReplySystem: string | null;
}

const AI_PROVIDERS: AiProviderId[] = ["mock", "minimax", "anthropic", "openai"];

function envDefaultProvider(): AiProviderId {
  const env = process.env.NEXT_PUBLIC_AI_PROVIDER as AiProviderId | undefined;
  return env && AI_PROVIDERS.includes(env) ? env : "mock";
}

/** Lê todas as configurações (deduplicado por request). */
export const getAppSettings = cache(async (): Promise<AppSettings> => {
  const defaults: AppSettings = {
    aiProvider: envDefaultProvider(),
    aiModels: { minimax: null, anthropic: null, openai: null },
    aiAnalysisSystem: null,
    aiAnalysisRules: null,
    aiReplySystem: null,
  };
  if (!supabaseAdminConfigured()) return defaults;

  const admin = createAdminClient();
  const { data, error } = await admin.from("app_settings").select("key, value");
  if (error || !data) {
    // tabela pode não existir ainda (migration 0003 pendente) — usa defaults
    return defaults;
  }

  const map = new Map(data.map((row) => [row.key, row.value]));
  const provider = map.get("ai_provider");
  const str = (key: string): string | null => {
    const v = map.get(key);
    return typeof v === "string" && v.trim() ? v : null;
  };
  return {
    aiProvider: AI_PROVIDERS.includes(provider as AiProviderId)
      ? (provider as AiProviderId)
      : defaults.aiProvider,
    aiModels: {
      minimax: str("ai_model_minimax"),
      anthropic: str("ai_model_anthropic"),
      openai: str("ai_model_openai"),
    },
    aiAnalysisSystem: str("ai_analysis_system"),
    aiAnalysisRules: str("ai_analysis_rules"),
    aiReplySystem: str("ai_reply_system"),
  };
});

/** Grava uma configuração (upsert). Chamar apenas de contexto admin. */
export async function setSetting(key: string, value: unknown): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("app_settings")
    .upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) throw new Error(`setSetting(${key}): ${error.message}`);
}

/** Remove um override (volta ao padrão do código). */
export async function deleteSetting(key: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("app_settings").delete().eq("key", key);
  if (error) throw new Error(`deleteSetting(${key}): ${error.message}`);
}
