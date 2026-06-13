import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/config";
import { findBusinessBySlug } from "@/lib/mock-data/businesses";

export interface FunnelBusiness {
  name: string;
  welcomeMessage?: string;
  reviewLink?: string;
  logoUrl?: string;
}

/**
 * Negócio da página pública de avaliação (/r/[slug] e /obrigado).
 * Busca no banco com service role no SERVIDOR (sem política anônima em
 * businesses, migration 0002); sem Supabase, cai nos mocks de demonstração.
 */
export async function getPublicBusiness(slug: string): Promise<FunnelBusiness | null> {
  if (supabaseAdminConfigured()) {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("businesses")
      .select("name, welcome_message, review_link, logo_url")
      .eq("slug", slug)
      .maybeSingle();
    if (data) {
      return {
        name: data.name,
        welcomeMessage: data.welcome_message ?? undefined,
        reviewLink: data.review_link ?? undefined,
        logoUrl: data.logo_url ?? undefined,
      };
    }
    // negócio pode não existir no banco mas existir nos mocks (demonstração)
  }

  const mock = findBusinessBySlug(slug);
  if (!mock) return null;
  return {
    name: mock.name,
    reviewLink: `https://search.google.com/local/writereview?placeid=${mock.placeId}`,
  };
}
