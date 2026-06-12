import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/config";
import { findBusinessBySlug } from "@/lib/mock-data/businesses";
import { ReviewFunnel } from "@/components/review-funnel/funnel";

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface FunnelBusiness {
  name: string;
  welcomeMessage?: string;
  reviewLink?: string;
  logoUrl?: string;
}

/**
 * Busca o negócio no banco; sem Supabase configurado, cai nos mocks.
 * Usa service role no SERVIDOR e seleciona só as colunas públicas —
 * não existe mais política de leitura anônima em businesses (migration 0002).
 */
async function getBusiness(slug: string): Promise<FunnelBusiness | null> {
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const business = await getBusiness(slug);
  return {
    title: business ? `Avalie sua experiência — ${business.name}` : "Avaliação",
    robots: { index: false },
  };
}

export default async function ReviewFunnelPage({ params }: PageProps) {
  const { slug } = await params;
  const business = await getBusiness(slug);
  if (!business) notFound();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 py-12">
      <ReviewFunnel
        slug={slug}
        businessName={business.name}
        welcomeMessage={business.welcomeMessage}
        reviewLink={business.reviewLink}
      />
    </main>
  );
}
