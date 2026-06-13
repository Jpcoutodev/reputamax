import type { AiProviderId } from "@/lib/data/settings";

/**
 * Modelos por provider de IA. Centralizado para o resolvedor de runtime
 * (lib/data/ai.ts) e o painel admin compartilharem a mesma fonte.
 * O admin pode escolher um dos presets OU digitar um modelo livre.
 */
export interface ProviderModelConfig {
  /** modelo padrão quando não há env nem escolha do admin */
  default: string;
  /** sugestões exibidas no admin (lista não exaustiva — campo é livre) */
  presets: string[];
  /** env var que define o modelo (precedência: admin > env > default) */
  envVar: string;
}

export const MODEL_CONFIG: Record<Exclude<AiProviderId, "mock">, ProviderModelConfig> = {
  minimax: {
    default: "MiniMax-M2",
    presets: ["MiniMax-M2", "MiniMax-Text-01", "abab6.5s-chat"],
    envVar: "MINIMAX_MODEL",
  },
  anthropic: {
    default: "claude-sonnet-4-6",
    presets: [
      "claude-sonnet-4-6",
      "claude-opus-4-8",
      "claude-haiku-4-5-20251001",
    ],
    envVar: "ANTHROPIC_MODEL",
  },
  openai: {
    default: "gpt-5.1",
    presets: ["gpt-5.1", "gpt-5", "gpt-4.1", "gpt-4o", "gpt-4o-mini"],
    envVar: "OPENAI_MODEL",
  },
};

/** Modelo efetivo: escolha do admin > env > padrão. */
export function resolveModel(
  provider: Exclude<AiProviderId, "mock">,
  adminChoice: string | null | undefined
): string {
  const cfg = MODEL_CONFIG[provider];
  const fromEnv = process.env[cfg.envVar];
  return (adminChoice?.trim() || fromEnv?.trim() || cfg.default).trim();
}
