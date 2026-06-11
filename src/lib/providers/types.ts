export interface BusinessSearchResult {
  placeId: string;
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
  category: string;
  photoUrl?: string;
}

export type ReviewTheme =
  | "tempo_espera"
  | "atendimento"
  | "preco"
  | "qualidade"
  | "limpeza"
  | "prazo";

export interface Review {
  id: string;
  authorName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  createdAt: string; // ISO
  replied: boolean;
  replyText?: string;
  themes: ReviewTheme[];
}

export interface CompetitorSnapshot {
  name: string;
  rating: number;
  reviewCount: number;
  distanceKm: number;
}

export interface ReviewDataProvider {
  searchBusiness(query: string): Promise<BusinessSearchResult[]>;
  getBusinessDetails(placeId: string): Promise<BusinessSearchResult>;
  getReviews(placeId: string): Promise<Review[]>;
  getCompetitors(placeId: string): Promise<CompetitorSnapshot[]>;
}

export interface SentimentTheme {
  theme: string;
  type: "critica" | "elogio";
  pct: number;
  examples: string[];
}

export interface DiagnosisResult {
  score: number; // 0-100
  ratingGapVsCompetitors: number; // ex: -0.4
  responseRatePct: number;
  reviewsPerMonth: number;
  expectedReviewsPerMonth: number;
  sentimentThemes: SentimentTheme[];
  criticalIssues: string[]; // 3 itens
  recommendations: string[]; // 5 itens
  summary: string;
}

export interface AnalysisProvider {
  analyzeReviews(
    business: BusinessSearchResult,
    reviews: Review[],
    competitors: CompetitorSnapshot[]
  ): Promise<DiagnosisResult>;
  suggestReply(
    review: Review,
    businessName: string,
    tone: "formal" | "amigavel"
  ): Promise<string>;
}

export interface EmailProvider {
  sendDiagnosisReport(to: string, diagnosticoId: string): Promise<void>;
}
