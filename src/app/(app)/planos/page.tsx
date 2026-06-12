import { PlanCards } from "@/components/planos/plan-cards";
import { getCurrentBusiness, trialDaysLeft } from "@/lib/data/business";

export const metadata = { title: "Planos" };

export default async function PlanosPage() {
  const business = await getCurrentBusiness();
  const daysLeft = trialDaysLeft(business);
  const isTrial = business.plan === "trial";

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-medium tracking-tight">Planos</h1>
        <p className="text-sm text-muted-foreground">
          {isTrial
            ? `Você está no trial gratuito — ${daysLeft} dia${daysLeft === 1 ? "" : "s"} restante${daysLeft === 1 ? "" : "s"}. Escolha um plano para continuar depois.`
            : "Gerencie seu plano e forma de pagamento."}
        </p>
      </div>

      <PlanCards />

      <p className="text-xs text-muted-foreground">
        Sem fidelidade. Cancele quando quiser direto pelo painel.
      </p>
    </div>
  );
}
