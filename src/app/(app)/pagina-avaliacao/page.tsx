import { PageSettings } from "@/components/pagina-avaliacao/page-settings";
import { getCurrentBusiness } from "@/lib/data/business";

export const metadata = { title: "Página de avaliação" };

export default async function PaginaAvaliacaoPage() {
  const business = await getCurrentBusiness();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-medium tracking-tight">Página de avaliação</h1>
        <p className="text-sm text-muted-foreground">
          É essa página que seus clientes veem ao escanear o QR code. Notas altas
          vão pro Google; críticas chegam só pra você.
        </p>
      </div>
      <PageSettings
        slug={business.slug}
        businessName={business.name}
        initialWelcomeMessage={business.welcomeMessage ?? ""}
        initialReviewLink={business.reviewLink ?? ""}
        persisted={Boolean(business.id)}
      />
    </div>
  );
}
