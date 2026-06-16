import "server-only";
import { cache } from "react";
import type { AnalysisProvider } from "@/lib/providers/types";
import {
  createLlmAnalysisProvider,
  type AnalysisLogger,
} from "@/lib/providers/analysis/llm-analysis";
import { mockAnalysisProvider } from "@/lib/providers/analysis/mock";
import { makeMinimaxComplete } from "@/lib/providers/analysis/minimax";
import { makeAnthropicComplete } from "@/lib/providers/analysis/anthropic";
import { makeOpenaiComplete } from "@/lib/providers/analysis/openai";
import { resolveModel } from "@/lib/providers/analysis/models";
import { getAppSettings } from "./settings";
import { logAiCall } from "./ai-logs";

/**
 * Resolve o provider de análise em RUNTIME a partir das configurações do
 * painel admin (tabela app_settings) — trocar de IA ou de modelo não exige
 * deploy. Toda chamada é registrada em ai_logs (provider, modelo, status, erro).
 */
export const getAnalysisProvider = cache(async (): Promise<AnalysisProvider> => {
  const settings = await getAppSettings();
  const overrides = {
    analysisSystem: settings.aiAnalysisSystem ?? undefined,
    analysisRules: settings.aiAnalysisRules ?? undefined,
    replySystem: settings.aiReplySystem ?? undefined,
  };

  if (settings.aiProvider === "mock") {
    return withDeterministicLogging(mockAnalysisProvider);
  }

  const model = resolveModel(settings.aiProvider, settings.aiModels[settings.aiProvider]);
  const log: AnalysisLogger = (e) => {
    void logAiCall({
      operation: e.operation,
      provider: settings.aiProvider,
      model,
      status: e.status,
      fallback: e.status === "fallback",
      error: e.error,
      durationMs: e.durationMs,
      businessName: e.businessName,
      request: e.request,
      response: e.response,
    });
  };

  const complete =
    settings.aiProvider === "minimax"
      ? makeMinimaxComplete(model)
      : settings.aiProvider === "anthropic"
        ? makeAnthropicComplete(model)
        : makeOpenaiComplete(model);

  return createLlmAnalysisProvider(complete, overrides, log);
});

/** Envolve o provider determinístico para também registrar no log (status ok). */
function withDeterministicLogging(provider: AnalysisProvider): AnalysisProvider {
  return {
    async analyzeReviews(business, reviews, competitors, options) {
      const start = Date.now();
      const result = await provider.analyzeReviews(business, reviews, competitors, options);
      void logAiCall({
        operation: "analyze",
        provider: "mock",
        model: null,
        status: "ok",
        fallback: false,
        durationMs: Date.now() - start,
        businessName: business.name,
      });
      return result;
    },
    async suggestReply(review, businessName, tone) {
      const start = Date.now();
      const reply = await provider.suggestReply(review, businessName, tone);
      void logAiCall({
        operation: "reply",
        provider: "mock",
        model: null,
        status: "ok",
        fallback: false,
        durationMs: Date.now() - start,
        businessName,
      });
      return reply;
    },
  };
}
