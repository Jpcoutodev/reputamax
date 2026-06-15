import { renderToBuffer } from "@react-pdf/renderer";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/config";
import { reviewProvider } from "@/lib/providers";
import { getAnalysisProvider } from "@/lib/data/ai";
import { mockReviewProvider } from "@/lib/providers/reviews/mock";
import { mockAnalysisProvider } from "@/lib/providers/analysis/mock";
import { DiagnosisDocument } from "@/lib/pdf/diagnosis-document";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import type { BusinessSearchResult, DiagnosisResult } from "@/lib/providers/types";

// @react-pdf/renderer precisa do runtime Node
export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 50);
}

/**
 * PDF público do relatório de diagnóstico.
 * - id UUID + Supabase: lê do banco (analisa se ainda não tiver result);
 * - senão (demo): calcula a partir dos mocks usando o id como placeId.
 */
export async function GET(request: Request, context: RouteContext) {
  if (!rateLimit(`pdf:${clientIp(request)}`, 20, 60_000)) {
    return new Response("Muitas requisições", { status: 429 });
  }

  const { id } = await context.params;
  const isUuid = z.string().uuid().safeParse(id).success;

  let business: BusinessSearchResult;
  let result: DiagnosisResult;
  let generatedAt = new Date().toISOString();

  try {
    if (isUuid && supabaseAdminConfigured()) {
      const admin = createAdminClient();
      const { data } = await admin
        .from("diagnostics")
        .select("place_id, business_snapshot, result, created_at")
        .eq("id", id)
        .maybeSingle();
      if (!data) return new Response("Diagnóstico não encontrado", { status: 404 });

      business = data.business_snapshot as BusinessSearchResult;
      generatedAt = data.created_at ?? generatedAt;

      if (data.result) {
        result = data.result as DiagnosisResult;
      } else {
        const [reviews, competitors, analysis] = await Promise.all([
          reviewProvider.getReviews(data.place_id),
          reviewProvider.getCompetitors(data.place_id),
          getAnalysisProvider(),
        ]);
        result = await analysis.analyzeReviews(business, reviews, competitors, {
          responseDataAvailable: reviewProvider.hasResponseData,
        });
      }
    } else {
      // demo: o id é o placeId dos mocks
      business = await mockReviewProvider.getBusinessDetails(id);
      const [reviews, competitors] = await Promise.all([
        mockReviewProvider.getReviews(id),
        mockReviewProvider.getCompetitors(id),
      ]);
      result = await mockAnalysisProvider.analyzeReviews(business, reviews, competitors);
    }
  } catch (err) {
    console.error("[api/diagnostico/:id/pdf]:", err);
    return new Response("Diagnóstico não encontrado", { status: 404 });
  }

  const buffer = await renderToBuffer(
    DiagnosisDocument({ business, result, generatedAt })
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="diagnostico-${slugify(business.name)}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
