import type { AnalysisProvider, EmailProvider, ReviewDataProvider } from "./types";
import { mockReviewProvider } from "./reviews/mock";
import { googleReviewProvider } from "./reviews/google";
import { mockAnalysisProvider } from "./analysis/mock";
import { minimaxAnalysisProvider } from "./analysis/minimax";
import { anthropicAnalysisProvider } from "./analysis/anthropic";
import { consoleEmailProvider } from "./email/mock";
import { resendEmailProvider } from "./email/resend";

// Toggles INDEPENDENTES por provider:
// - busca/avaliações: NEXT_PUBLIC_DATA_MODE = mock | live (Google Places)
// - análise IA: NEXT_PUBLIC_AI_PROVIDER = mock | minimax | anthropic
// - e-mail: NEXT_PUBLIC_EMAIL_MODE = mock | live (Resend)
// Providers reais usam chaves de SERVIDOR — client components chamam via rotas de API.
const reviewsLive = process.env.NEXT_PUBLIC_DATA_MODE === "live";
const aiProvider = process.env.NEXT_PUBLIC_AI_PROVIDER;
const emailLive = process.env.NEXT_PUBLIC_EMAIL_MODE === "live";

export const reviewProvider: ReviewDataProvider = reviewsLive
  ? googleReviewProvider
  : mockReviewProvider;

export const analysisProvider: AnalysisProvider =
  aiProvider === "minimax"
    ? minimaxAnalysisProvider
    : aiProvider === "anthropic"
      ? anthropicAnalysisProvider
      : mockAnalysisProvider;

export const emailProvider: EmailProvider = emailLive
  ? resendEmailProvider
  : consoleEmailProvider;

export * from "./types";
