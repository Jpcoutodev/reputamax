import {
  Building2,
  CreditCard,
  FileSearch,
  MessageSquareWarning,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { getAdminOverview } from "@/lib/data/admin-queries";

export const metadata = { title: "Dashboard" };

const planLabels: Record<string, string> = {
  trial: "Trial",
  essencial: "Essencial",
  pro: "Pro",
};

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function AdminDashboardPage() {
  const overview = await getAdminOverview();
  const conversionRate =
    overview.leadsTotal > 0
      ? Math.round((overview.conversionsTotal / overview.leadsTotal) * 100)
      : 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-medium tracking-tight">Dashboard geral</h1>
        <p className="text-sm text-muted-foreground">
          Visão executiva do Reputamax — números de produto e receita.
        </p>
      </div>

      {/* Receita */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="MRR (potencial)"
          value={formatBRL(overview.mrr)}
          hint="assinaturas a preço de tabela — checkout ainda não ativo"
          semaphore={overview.mrr > 0 ? "verde" : "neutro"}
          icon={<CreditCard className="size-4 text-muted-foreground" />}
        />
        <MetricCard
          label="Negócios cadastrados"
          value={String(overview.businessesTotal)}
          hint={`+${overview.signupsLast30d} nos últimos 30 dias`}
          icon={<Building2 className="size-4 text-muted-foreground" />}
        />
        <MetricCard
          label="Assinaturas pagas"
          value={String(overview.byPlan.essencial + overview.byPlan.pro)}
          hint={`${overview.byPlan.essencial} Essencial · ${overview.byPlan.pro} Pro`}
          icon={<TrendingUp className="size-4 text-muted-foreground" />}
        />
        <MetricCard
          label="Em trial"
          value={String(overview.byPlan.trial)}
          hint="potenciais conversões"
          icon={<UserPlus className="size-4 text-muted-foreground" />}
        />
      </section>

      {/* Funil de aquisição */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium tracking-tight">Funil de aquisição</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Diagnósticos gerados"
            value={String(overview.diagnosticsTotal)}
            hint={`${overview.diagnosticsLast30d} nos últimos 30 dias`}
            icon={<FileSearch className="size-4 text-muted-foreground" />}
          />
          <MetricCard
            label="Leads capturados"
            value={String(overview.leadsTotal)}
            hint={
              overview.diagnosticsTotal > 0
                ? `${Math.round((overview.leadsTotal / overview.diagnosticsTotal) * 100)}% dos diagnósticos`
                : "—"
            }
          />
          <MetricCard
            label="Viraram clientes"
            value={String(overview.conversionsTotal)}
            hint={`${conversionRate}% dos leads`}
            semaphore={conversionRate >= 20 ? "verde" : "neutro"}
          />
          <MetricCard
            label="Feedbacks privados"
            value={String(overview.interceptedTotal)}
            hint={`de ${overview.funnelResponsesTotal} respostas de funil`}
            semaphore="verde"
            icon={<MessageSquareWarning className="size-4 text-muted-foreground" />}
          />
        </div>
      </section>

      {/* Cadastros recentes */}
      <Card className="rounded-xl border shadow-none">
        <CardContent className="flex flex-col gap-4 p-6">
          <h2 className="font-medium">Cadastros recentes</h2>
          {overview.recentBusinesses.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhum negócio cadastrado ainda.
            </p>
          ) : (
            <ul className="flex flex-col divide-y">
              {overview.recentBusinesses.map((b) => (
                <li key={`${b.name}-${b.createdAt}`} className="flex items-center gap-3 py-3 text-sm">
                  <span className="min-w-0 flex-1 truncate font-medium">{b.name}</span>
                  <Badge variant="secondary" className="bg-accent text-accent-foreground">
                    {planLabels[b.plan] ?? b.plan}
                  </Badge>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {new Date(b.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
