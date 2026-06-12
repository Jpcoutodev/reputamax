import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseConfigured } from "@/lib/supabase/config";
import { getDemoBusiness } from "@/lib/mock-data/app-data";
import { findBusinessByPlaceId } from "@/lib/mock-data/businesses";
import { generateReviews } from "@/lib/mock-data/review-generator";
import { generateMetricSnapshots } from "@/lib/mock-data/app-data";
import { reviewProvider, type BusinessSearchResult } from "@/lib/providers";

export interface OnboardingSteps {
  perfil: boolean;
  pagina: boolean;
  qr: boolean;
  primeiras: boolean;
}

export interface AppBusiness {
  /** null = modo demonstração (Supabase não configurado) */
  id: string | null;
  name: string;
  slug: string;
  category: string | null;
  address: string | null;
  googlePlaceId: string | null;
  reviewLink: string | null;
  welcomeMessage: string | null;
  tone: "amigavel" | "formal";
  plan: string;
  trialEndsAt: string | null;
  onboardingSteps: OnboardingSteps;
  accountEmail: string | null;
}

const DEFAULT_STEPS: OnboardingSteps = {
  perfil: false,
  pagina: false,
  qr: false,
  primeiras: false,
};

function demoAppBusiness(): AppBusiness {
  const demo = getDemoBusiness();
  return {
    id: null,
    name: demo.name,
    slug: demo.slug,
    category: demo.category,
    address: demo.address,
    googlePlaceId: demo.placeId,
    reviewLink: `https://search.google.com/local/writereview?placeid=${demo.placeId}`,
    welcomeMessage: null,
    tone: "amigavel",
    plan: "trial",
    trialEndsAt: null,
    onboardingSteps: DEFAULT_STEPS,
    accountEmail: "demo@reputamax.app",
  };
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 60);
}

/**
 * Cria o business de um usuário (slug único + seed inicial de dados no modo mock).
 * Usado pelo /api/onboarding e como rede de segurança no layout da área logada.
 */
export async function createBusinessForUser(
  userId: string,
  opts: { snapshot?: BusinessSearchResult | null; name?: string } = {}
): Promise<{ id: string; slug: string }> {
  const admin = createAdminClient();
  const name = opts.snapshot?.name ?? opts.name ?? "Meu negócio";
  const base = slugify(name) || "meu-negocio";

  let slug = base;
  for (let i = 2; i < 50; i++) {
    const { data: taken } = await admin
      .from("businesses")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!taken) break;
    slug = `${base}-${i}`;
  }

  const { data: business, error } = await admin
    .from("businesses")
    .insert({
      owner_id: userId,
      name,
      slug,
      category: opts.snapshot?.category ?? null,
      address: opts.snapshot?.address ?? null,
      google_place_id: opts.snapshot?.placeId ?? null,
    })
    .select("id, slug")
    .single();
  if (error) throw new Error(`createBusinessForUser: ${error.message}`);

  // seed inicial:
  // - negócio dos mocks → avaliações geradas + 90 dias de métricas;
  // - negócio real (Google) → avaliações disponíveis na Places API (máx. 5)
  //   + snapshot de hoje com nota/total do diagnóstico (o histórico passa a
  //   crescer daqui em diante; sincronização completa virá da GBP API).
  const snapshot = opts.snapshot;
  const mock = snapshot?.placeId ? findBusinessByPlaceId(snapshot.placeId) : undefined;
  try {
    if (mock) {
      const reviews = generateReviews(mock.placeId);
      await admin.from("reviews").insert(
        reviews.map((r) => ({
          business_id: business.id,
          external_id: r.id,
          author_name: r.authorName,
          rating: r.rating,
          text: r.text,
          replied: r.replied,
          reply_text: r.replyText ?? null,
          review_created_at: r.createdAt,
        }))
      );
      const snapshots = generateMetricSnapshots(mock);
      await admin.from("metric_snapshots").insert(
        snapshots.map((s) => ({
          business_id: business.id,
          date: s.date,
          rating: s.rating,
          review_count: s.reviewCount,
        }))
      );
    } else if (snapshot) {
      const reviews = await reviewProvider.getReviews(snapshot.placeId);
      if (reviews.length > 0) {
        await admin.from("reviews").insert(
          reviews.map((r) => ({
            business_id: business.id,
            external_id: r.id,
            author_name: r.authorName,
            rating: r.rating,
            text: r.text,
            replied: r.replied,
            reply_text: r.replyText ?? null,
            review_created_at: r.createdAt,
          }))
        );
      }
      await admin.from("metric_snapshots").insert({
        business_id: business.id,
        date: new Date().toISOString().slice(0, 10),
        rating: snapshot.rating,
        review_count: snapshot.reviewCount,
      });
    }
  } catch (err) {
    // seed é melhor-esforço: o business existe mesmo se o seed falhar
    console.error("[createBusinessForUser] seed:", err);
  }

  return business;
}

/**
 * Negócio do usuário logado (deduplicado por request via cache()).
 * - Supabase não configurado → dados demo.
 * - Usuário sem business → cria um automaticamente.
 */
export const getCurrentBusiness = cache(async (): Promise<AppBusiness> => {
  if (!supabaseConfigured()) return demoAppBusiness();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return demoAppBusiness(); // proxy já barra; defesa extra

  let { data: row } = await supabase
    .from("businesses")
    .select(
      "id, name, slug, category, address, google_place_id, review_link, welcome_message, tone, plan, trial_ends_at, onboarding_steps"
    )
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!row) {
    const created = await createBusinessForUser(user.id, {
      name: (user.user_metadata?.full_name as string | undefined)
        ? `Negócio de ${user.user_metadata.full_name}`
        : "Meu negócio",
    });
    const { data: fresh } = await supabase
      .from("businesses")
      .select(
        "id, name, slug, category, address, google_place_id, review_link, welcome_message, tone, plan, trial_ends_at, onboarding_steps"
      )
      .eq("id", created.id)
      .single();
    row = fresh;
  }

  if (!row) return demoAppBusiness();

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    address: row.address,
    googlePlaceId: row.google_place_id,
    reviewLink: row.review_link,
    welcomeMessage: row.welcome_message,
    tone: row.tone === "formal" ? "formal" : "amigavel",
    plan: row.plan ?? "trial",
    trialEndsAt: row.trial_ends_at,
    onboardingSteps: { ...DEFAULT_STEPS, ...(row.onboarding_steps ?? {}) },
    accountEmail: user.email ?? null,
  };
});

/** Dias restantes de trial (mín. 0); modo demo usa 11 fixo. */
export function trialDaysLeft(business: AppBusiness): number {
  if (!business.trialEndsAt) return 11;
  const ms = new Date(business.trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}
