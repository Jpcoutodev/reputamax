import "server-only";
import { cache } from "react";
import type { AnalysisProvider } from "@/lib/providers/types";
import { createLlmAnalysisProvider } from "@/lib/providers/analysis/llm-analysis";
import { mockAnalysisProvider } from "@/lib/providers/analysis/mock";
import { makeMinimaxComplete } from "@/lib/providers/analysis/minimax";
import { makeAnthropicComplete } from "@/lib/providers/analysis/anthropic";
import { makeOpenaiComplete } from "@/lib/providers/analysis/openai";
import { resolveModel } from "@/lib/providers/analysis/models";
import { getAppSettings } from "./settings";

/**
 * Resolve o provider de análise em RUNTIME a partir das configurações do
 * painel admin (tabela app_settings) — trocar de IA ou de modelo não exige
 * deploy. Prompts customizados e modelo (admin > env > default) aplicados aqui.
 */
export const getAnalysisProvider = cache(async (): Promise<AnalysisProvider> => {
  const settings = await getAppSettings();
  const overrides = {
    analysisSystem: settings.aiAnalysisSystem ?? undefined,
    analysisRules: settings.aiAnalysisRules ?? undefined,
    replySystem: settings.aiReplySystem ?? undefined,
  };

  switch (settings.aiProvider) {
    case "minimax":
      return createLlmAnalysisProvider(
        makeMinimaxComplete(resolveModel("minimax", settings.aiModels.minimax)),
        overrides
      );
    case "anthropic":
      return createLlmAnalysisProvider(
        makeAnthropicComplete(resolveModel("anthropic", settings.aiModels.anthropic)),
        overrides
      );
    case "openai":
      return createLlmAnalysisProvider(
        makeOpenaiComplete(resolveModel("openai", settings.aiModels.openai)),
        overrides
      );
    default:
      return mockAnalysisProvider;
  }
});
