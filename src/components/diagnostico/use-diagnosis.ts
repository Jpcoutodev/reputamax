"use client";

import { useEffect, useState } from "react";
import {
  analysisProvider,
  reviewProvider,
  type BusinessSearchResult,
  type CompetitorSnapshot,
  type DiagnosisResult,
} from "@/lib/providers";

interface DiagnosisState {
  business: BusinessSearchResult | null;
  competitors: CompetitorSnapshot[];
  result: DiagnosisResult | null;
  loading: boolean;
  error: boolean;
}

/** Carrega negócio + análise de forma determinística a partir do placeId (fase mock). */
export function useDiagnosis(placeId: string): DiagnosisState {
  const [state, setState] = useState<DiagnosisState>({
    business: null,
    competitors: [],
    result: null,
    loading: true,
    error: false,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [business, reviews, competitors] = await Promise.all([
          reviewProvider.getBusinessDetails(placeId),
          reviewProvider.getReviews(placeId),
          reviewProvider.getCompetitors(placeId),
        ]);
        const result = await analysisProvider.analyzeReviews(business, reviews, competitors);
        if (!cancelled) {
          setState({ business, competitors, result, loading: false, error: false });
        }
      } catch {
        if (!cancelled) {
          setState((s) => ({ ...s, loading: false, error: true }));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [placeId]);

  return state;
}

const LEAD_KEY = "reputamax_leads";

export function saveLead(placeId: string, email: string, whatsapp?: string) {
  if (typeof window === "undefined") return;
  const leads = JSON.parse(localStorage.getItem(LEAD_KEY) ?? "{}");
  leads[placeId] = { email, whatsapp, capturedAt: new Date().toISOString() };
  localStorage.setItem(LEAD_KEY, JSON.stringify(leads));
}

export function hasLead(placeId: string): boolean {
  if (typeof window === "undefined") return false;
  const leads = JSON.parse(localStorage.getItem(LEAD_KEY) ?? "{}");
  return Boolean(leads[placeId]);
}
