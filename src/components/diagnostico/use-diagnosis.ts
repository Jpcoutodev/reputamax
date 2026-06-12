"use client";

import { useEffect, useState } from "react";
// o caminho demo roda no BROWSER — usa sempre os mocks locais
// (providers live são de servidor; o caminho real busca via API)
import { mockReviewProvider } from "@/lib/providers/reviews/mock";
import { mockAnalysisProvider } from "@/lib/providers/analysis/mock";
import type { BusinessSearchResult, DiagnosisResult } from "@/lib/providers/types";

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

interface DiagnosisState {
  business: BusinessSearchResult | null;
  result: DiagnosisResult | null;
  leadCaptured: boolean;
  loading: boolean;
  error: boolean;
}

/**
 * Carrega o diagnóstico:
 * - id UUID → busca no banco via API (e dispara a análise se ainda não rodou);
 * - senão → modo demonstração: id é o placeId e tudo é calculado dos mocks.
 */
export function useDiagnosis(id: string): DiagnosisState {
  const [state, setState] = useState<DiagnosisState>({
    business: null,
    result: null,
    leadCaptured: false,
    loading: true,
    error: false,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadFromApi() {
      const res = await fetch(`/api/diagnostico/${id}`);
      if (!res.ok) throw new Error("not_found");
      const data = await res.json();

      let result: DiagnosisResult | null = data.result;
      if (data.status !== "ready" || !result) {
        const analyzeRes = await fetch(`/api/diagnostico/${id}/analyze`, {
          method: "POST",
        });
        if (!analyzeRes.ok) throw new Error("analyze_failed");
        result = (await analyzeRes.json()).result;
      }

      if (!cancelled) {
        setState({
          business: data.business,
          result,
          leadCaptured: data.leadCaptured,
          loading: false,
          error: false,
        });
      }
    }

    async function loadFromMocks() {
      const [business, reviews, competitors] = await Promise.all([
        mockReviewProvider.getBusinessDetails(id),
        mockReviewProvider.getReviews(id),
        mockReviewProvider.getCompetitors(id),
      ]);
      const result = await mockAnalysisProvider.analyzeReviews(business, reviews, competitors);
      if (!cancelled) {
        setState({
          business,
          result,
          leadCaptured: hasLocalLead(id),
          loading: false,
          error: false,
        });
      }
    }

    (async () => {
      try {
        if (isUuid(id)) {
          await loadFromApi();
        } else {
          await loadFromMocks();
        }
      } catch {
        if (!cancelled) setState((s) => ({ ...s, loading: false, error: true }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return state;
}

const LEAD_KEY = "reputamax_leads";

function hasLocalLead(id: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const leads = JSON.parse(localStorage.getItem(LEAD_KEY) ?? "{}");
    return Boolean(leads[id]);
  } catch {
    return false;
  }
}

/** Grava o lead — no banco (id real) ou em localStorage (modo demonstração). */
export async function saveLead(
  id: string,
  email: string,
  whatsapp?: string
): Promise<boolean> {
  if (isUuid(id)) {
    try {
      const res = await fetch(`/api/diagnostico/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, whatsapp }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }
  try {
    const leads = JSON.parse(localStorage.getItem(LEAD_KEY) ?? "{}");
    leads[id] = { email, whatsapp, capturedAt: new Date().toISOString() };
    localStorage.setItem(LEAD_KEY, JSON.stringify(leads));
    return true;
  } catch {
    return false;
  }
}
