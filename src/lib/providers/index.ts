import type { AnalysisProvider, EmailProvider, ReviewDataProvider } from "./types";
import { mockReviewProvider } from "./reviews/mock";
import { googleReviewProvider } from "./reviews/google";
import { mockAnalysisProvider } from "./analysis/mock";
import { anthropicAnalysisProvider } from "./analysis/anthropic";
import { consoleEmailProvider } from "./email/mock";
import { resendEmailProvider } from "./email/resend";

const useMocks = process.env.NEXT_PUBLIC_DATA_MODE !== "live";

export const reviewProvider: ReviewDataProvider = useMocks
  ? mockReviewProvider
  : googleReviewProvider;

export const analysisProvider: AnalysisProvider = useMocks
  ? mockAnalysisProvider
  : anthropicAnalysisProvider;

export const emailProvider: EmailProvider = useMocks
  ? consoleEmailProvider
  : resendEmailProvider;

export * from "./types";
