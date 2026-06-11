import type {
  BusinessSearchResult,
  CompetitorSnapshot,
  Review,
  ReviewDataProvider,
} from "../types";
import {
  findBusinessByPlaceId,
  getCompetitorsFor,
  mockBusinesses,
} from "@/lib/mock-data/businesses";
import { generateReviews } from "@/lib/mock-data/review-generator";

function simulateLatency(): Promise<void> {
  const ms = 300 + Math.random() * 300;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export const mockReviewProvider: ReviewDataProvider = {
  async searchBusiness(query: string): Promise<BusinessSearchResult[]> {
    await simulateLatency();
    const q = normalize(query.trim());
    if (!q) return [];
    return mockBusinesses
      .filter(
        (b) =>
          normalize(b.name).includes(q) ||
          normalize(b.category).includes(q) ||
          normalize(b.address).includes(q)
      )
      .slice(0, 6);
  },

  async getBusinessDetails(placeId: string): Promise<BusinessSearchResult> {
    await simulateLatency();
    const business = findBusinessByPlaceId(placeId);
    if (!business) throw new Error(`Negócio não encontrado: ${placeId}`);
    return business;
  },

  async getReviews(placeId: string): Promise<Review[]> {
    await simulateLatency();
    return generateReviews(placeId);
  },

  async getCompetitors(placeId: string): Promise<CompetitorSnapshot[]> {
    await simulateLatency();
    const business = findBusinessByPlaceId(placeId);
    if (!business) throw new Error(`Negócio não encontrado: ${placeId}`);
    return getCompetitorsFor(business);
  },
};
