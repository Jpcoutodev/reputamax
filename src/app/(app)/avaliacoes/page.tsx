import { ReviewsList } from "@/components/avaliacoes/reviews-list";
import { getCurrentBusiness } from "@/lib/data/business";
import { getReviewsForBusiness } from "@/lib/data/app-queries";

export const metadata = { title: "Avaliações" };

export default async function AvaliacoesPage() {
  const business = await getCurrentBusiness();
  const reviews = await getReviewsForBusiness(business);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-medium tracking-tight">Avaliações</h1>
        <p className="text-sm text-muted-foreground">
          Todas as avaliações do seu perfil no Google. Responda 100% delas — o
          Google e os clientes notam.
        </p>
      </div>
      <ReviewsList
        reviews={reviews}
        businessName={business.name}
        tone={business.tone}
        persisted={Boolean(business.id)}
      />
    </div>
  );
}
