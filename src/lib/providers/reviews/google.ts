import type { ReviewDataProvider } from "../types";

/** Fase 2: Google Places API (busca) + Google Business Profile API (avaliações) */
export const googleReviewProvider: ReviewDataProvider = {
  async searchBusiness() {
    throw new Error("Not implemented: Google Places API (fase 2)");
  },
  async getBusinessDetails() {
    throw new Error("Not implemented: Google Places API (fase 2)");
  },
  async getReviews() {
    throw new Error("Not implemented: Google Business Profile API (fase 2)");
  },
  async getCompetitors() {
    throw new Error("Not implemented: Google Places API (fase 2)");
  },
};
