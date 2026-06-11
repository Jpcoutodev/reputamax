import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { findBusinessBySlug } from "@/lib/mock-data/businesses";
import { ReviewFunnel } from "@/components/review-funnel/funnel";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const business = findBusinessBySlug(slug);
  return {
    title: business ? `Avalie sua experiência — ${business.name}` : "Avaliação",
    robots: { index: false },
  };
}

export default async function ReviewFunnelPage({ params }: PageProps) {
  const { slug } = await params;
  const business = findBusinessBySlug(slug);
  if (!business) notFound();

  // fase mock: link de avaliação do Google fictício para o negócio demo
  const reviewLink = `https://search.google.com/local/writereview?placeid=${business.placeId}`;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 py-12">
      <ReviewFunnel
        slug={slug}
        businessName={business.name}
        reviewLink={reviewLink}
      />
    </main>
  );
}
