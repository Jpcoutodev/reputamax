import Link from "next/link";
import { MessageSquareWarning, Star, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/metric-card";
import { Stars } from "@/components/stars";
import { ActivationChecklist } from "@/components/dashboard/activation-checklist";
import { EvolutionChart } from "@/components/dashboard/evolution-chart";
import {
  demoFunnelResponses,
  generateMetricSnapshots,
  getDemoBusiness,
} from "@/lib/mock-data/app-data";
import { generateReviews } from "@/lib/mock-data/review-generator";

export const metadata = { title: "Dashboard" };

export default function DashboardPage() {
  const business = getDemoBusiness();
  const snapshots = generateMetricSnapshots(business);
  const reviews = generateReviews(business.placeId);

  const current = snapshots[snapshots.length - 1];
  const monthAgo = snapshots[snapshots.length - 31] ?? snapshots[0];
  const ratingDelta = Math.round((current.rating - monthAgo.rating) * 10) / 10;
  const newThisMonth = current.reviewCount - monthAgo.reviewCount;
  const intercepted = demoFunnelResponses.filter((f) => f.rating <= 3).length;

  const recentActivity = [
    ...demoFunnelResponses.slice(0, 4).map((f) => ({
      id: f.id,
      date: f.createdAt,
      kind: f.rating >= 4 ? ("funil_positivo" as const) : ("funil_critica" as const),
      rating: f.rating,
      text:
        f.rating >= 4
          ? "Cliente avaliou bem e foi direcionado para o Google"
          : `Crítica interceptada: "${f.feedbackText?.slice(0, 80)}…"`,
    })),
    ...reviews.slice(0, 3).map((r) => ({
      id: r.id,
      date: r.createdAt,
      kind: "avaliacao" as const,
      rating: r.rating,
      text: `${r.authorName} avaliou no Google: "${r.text.slice(0, 70)}"`,
    })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-medium tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Visão geral da reputação de {business.name}.
        </p>
      </div>

      <ActivationChecklist slug={business.slug} businessName={business.name} />

      {/* Métricas */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Nota atual"
          value={business.rating.toFixed(1)}
          hint={`${ratingDelta >= 0 ? "+" : ""}${ratingDelta.toFixed(1)} no último mês`}
          semaphore={ratingDelta >= 0 ? "verde" : "vermelho"}
          icon={<Star className="size-4 text-amber-400" />}
        />
        <MetricCard
          label="Total de avaliações"
          value={String(business.reviewCount)}
          hint="no seu perfil do Google"
          icon={<TrendingUp className="size-4 text-muted-foreground" />}
        />
        <MetricCard
          label="Novas este mês"
          value={`+${newThisMonth}`}
          hint="avaliações recebidas"
          semaphore="verde"
        />
        <MetricCard
          label="Críticas interceptadas"
          value={String(intercepted)}
          hint="críticas que NÃO viraram público"
          semaphore="verde"
          icon={<MessageSquareWarning className="size-4 text-muted-foreground" />}
        />
      </section>

      {/* Gráfico */}
      <Card className="rounded-xl border shadow-none">
        <CardContent className="flex flex-col gap-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Evolução nos últimos 90 dias</h2>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-primary" /> Nota
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-success" /> Avaliações
              </span>
            </div>
          </div>
          <EvolutionChart data={snapshots} />
        </CardContent>
      </Card>

      {/* Atividade recente */}
      <Card className="rounded-xl border shadow-none">
        <CardContent className="flex flex-col gap-4 p-6">
          <h2 className="font-medium">Atividade recente</h2>
          <ul className="flex flex-col divide-y">
            {recentActivity.map((activity) => (
              <li key={activity.id} className="flex items-center gap-3 py-3 text-sm">
                <Stars rating={activity.rating} size={14} className="shrink-0" />
                <span className="min-w-0 flex-1 truncate text-muted-foreground">
                  {activity.text}
                </span>
                {activity.kind === "funil_critica" ? (
                  <Badge variant="secondary" className="shrink-0 bg-warning-soft text-warning">
                    Interceptada
                  </Badge>
                ) : null}
                <span className="shrink-0 text-xs text-muted-foreground">
                  {new Date(activity.date).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                  })}
                </span>
              </li>
            ))}
          </ul>
          <Link
            href="/avaliacoes"
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            Ver todas as avaliações
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
