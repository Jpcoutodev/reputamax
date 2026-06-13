import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublicBusiness } from "@/lib/data/public-business";
import { ReviewFunnel } from "@/components/review-funnel/funnel";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const business = await getPublicBusiness(slug);
  return {
    title: business ? `Avalie sua experiência — ${business.name}` : "Avaliação",
    robots: { index: false },
  };
}

export default async function ReviewFunnelPage({ params }: PageProps) {
  const { slug } = await params;
  const business = await getPublicBusiness(slug);
  if (!business) notFound();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 py-12">
      <ReviewFunnel
        slug={slug}
        businessName={business.name}
        welcomeMessage={business.welcomeMessage}
        reviewLink={business.reviewLink}
        logoUrl={business.logoUrl}
      />
    </main>
  );
}
