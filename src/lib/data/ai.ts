import "server-only";
import { cache } from "react";
import type { AnalysisProvider } from "@/lib/providers/types";
import { createLlmAnalysisProvider } from "@/lib/providers/analysis/llm-analysis";
import { mockAnalysisProvider } from "@/lib/providers/analysis/mock";
import { completeMinimax } from "@/lib/providers/analysis/minimax";
import { completeAnthropic } from "@/lib/providers/analysis/anthropic";
import { completeOpenai } from "@/lib/providers/analysis/openai";
import { getAppSettings } from "./settings";

/**
 * Resolve o provider de análise em RUNTIME a partir das configurações do
 * painel admin (tabela app_settings) — trocar de IA não exige deploy.
 * Prompts customizados são aplicados aqui.
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
      return createLlmAnalysisProvider(completeMinimax, overrides);
    case "anthropic":
      return createLlmAnalysisProvider(completeAnthropic, overrides);
    case "openai":
      return createLlmAnalysisProvider(completeOpenai, overrides);
    default:
      return mockAnalysisProvider;
  }
});
