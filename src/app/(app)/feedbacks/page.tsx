import { FeedbacksList } from "@/components/feedbacks/feedbacks-list";
import { getCurrentBusiness } from "@/lib/data/business";
import { getFunnelResponses } from "@/lib/data/app-queries";

export const metadata = { title: "Feedbacks" };

export default async function FeedbacksPage() {
  const business = await getCurrentBusiness();
  const responses = await getFunnelResponses(business);
  const feedbacks = responses.filter((f) => f.rating <= 3);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-medium tracking-tight">Feedbacks privados</h1>
        <p className="text-sm text-muted-foreground">
          Clientes que preferiram falar diretamente com você pela sua página de
          avaliação. Resolva o problema com o cliente e marque como resolvido.
        </p>
      </div>
      <FeedbacksList feedbacks={feedbacks} persisted={Boolean(business.id)} />
    </div>
  );
}
