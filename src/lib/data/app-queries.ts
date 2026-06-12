import "server-only";
import { createClient } from "@/lib/supabase/server";
import { generateReviews } from "@/lib/mock-data/review-generator";
import {
  demoFunnelResponses,
  generateMetricSnapshots,
  getDemoBusiness,
  type MetricSnapshot,
} from "@/lib/mock-data/app-data";
import type { AppBusiness } from "./business";

export interface AppReview {
  id: string;
  authorName: string;
  rating: number;
  text: string;
  createdAt: string;
  replied: boolean;
  replyText?: string;
}

export interface AppFunnelResponse {
  id: string;
  rating: number;
  redirectedToGoogle: boolean;
  feedbackText?: string;
  customerName?: string;
  customerContact?: string;
  resolved: boolean;
  createdAt: string;
}

/** Avaliações do negócio (banco) ou geradas (demo). */
export async function getReviewsForBusiness(business: AppBusiness): Promise<AppReview[]> {
  if (!business.id) {
    return generateReviews(getDemoBusiness().placeId).map((r) => ({
      id: r.id,
      authorName: r.authorName,
      rating: r.rating,
      text: r.text,
      createdAt: r.createdAt,
      replied: r.replied,
      replyText: r.replyText,
    }));
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("id, author_name, rating, text, replied, reply_text, review_created_at")
    .eq("business_id", business.id)
    .order("review_created_at", { ascending: false })
    .limit(200);

  return (data ?? []).map((r) => ({
    id: r.id,
    authorName: r.author_name ?? "Cliente",
    rating: r.rating ?? 5,
    text: r.text ?? "",
    createdAt: r.review_created_at ?? new Date().toISOString(),
    replied: r.replied ?? false,
    replyText: r.reply_text ?? undefined,
  }));
}

/** Respostas do funil (banco) ou demo. */
export async function getFunnelResponses(
  business: AppBusiness
): Promise<AppFunnelResponse[]> {
  if (!business.id) {
    return demoFunnelResponses.map((f) => ({
      id: f.id,
      rating: f.rating,
      redirectedToGoogle: f.redirectedToGoogle,
      feedbackText: f.feedbackText,
      customerName: f.customerName,
      customerContact: f.customerContact,
      resolved: f.resolved,
      createdAt: f.createdAt,
    }));
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("funnel_responses")
    .select(
      "id, rating, redirected_to_google, feedback_text, customer_name, customer_contact, resolved, created_at"
    )
    .eq("business_id", business.id)
    .order("created_at", { ascending: false })
    .limit(200);

  return (data ?? []).map((f) => ({
    id: f.id,
    rating: f.rating,
    redirectedToGoogle: f.redirected_to_google ?? false,
    feedbackText: f.feedback_text ?? undefined,
    customerName: f.customer_name ?? undefined,
    customerContact: f.customer_contact ?? undefined,
    resolved: f.resolved ?? false,
    createdAt: f.created_at,
  }));
}

/** Histórico de métricas para o gráfico (banco) ou gerado (demo). */
export async function getMetricSnapshotsForBusiness(
  business: AppBusiness
): Promise<MetricSnapshot[]> {
  if (!business.id) {
    return generateMetricSnapshots(getDemoBusiness());
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("metric_snapshots")
    .select("date, rating, review_count")
    .eq("business_id", business.id)
    .order("date", { ascending: true })
    .limit(120);

  return (data ?? []).map((s) => ({
    date: s.date,
    rating: Number(s.rating ?? 0),
    reviewCount: s.review_count ?? 0,
  }));
}
