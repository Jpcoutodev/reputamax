import type { AnalysisProvider } from "../types";

/** Fase 2: análise de sentimento e sugestão de resposta via API Anthropic */
export const anthropicAnalysisProvider: AnalysisProvider = {
  async analyzeReviews() {
    throw new Error("Not implemented: API Anthropic (fase 2)");
  },
  async suggestReply() {
    throw new Error("Not implemented: API Anthropic (fase 2)");
  },
};
