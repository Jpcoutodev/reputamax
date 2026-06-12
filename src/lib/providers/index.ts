import type { AnalysisProvider, EmailProvider, ReviewDataProvider } from "./types";
import { mockReviewProvider } from "./reviews/mock";
import { googleReviewProvider } from "./reviews/google";
import { mockAnalysisProvider } from "./analysis/mock";
import { consoleEmailProvider } from "./email/mock";
import { resendEmailProvider } from "./email/resend";

// Toggles por provider:
// - busca/avaliações: NEXT_PUBLIC_DATA_MODE = mock | live (Google Places)
// - análise IA: configurada em RUNTIME pelo painel admin — use
//   getAnalysisProvider() de lib/data/ai.ts em código de servidor.
//   O export estático abaixo é o fallback determinístico (mock).
// - e-mail: NEXT_PUBLIC_EMAIL_MODE = mock | live (Resend)
const reviewsLive = process.env.NEXT_PUBLIC_DATA_MODE === "live";
const emailLive = process.env.NEXT_PUBLIC_EMAIL_MODE === "live";

export const reviewProvider: ReviewDataProvider = reviewsLive
  ? googleReviewProvider
  : mockReviewProvider;

export const analysisProvider: AnalysisProvider = mockAnalysisProvider;

export const emailProvider: EmailProvider = emailLive
  ? resendEmailProvider
  : consoleEmailProvider;

export * from "./types";
