import { Eye, FileSearch, MousePointerClick, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { getLandingMetrics } from "@/lib/data/admin-queries";

export const metadata = { title: "Landing page" };

function pct(part: number, whole: number): string {
  if (whole === 0) return "—";
  return `${Math.round((part / whole) * 100)}%`;
}

export default async function AdminLandingPage() {
  const m = await getLandingMetrics();

  const funnel = [
    { label: "Visualizações da landing", value: m.views, base: m.views },
    { label: "Abriram o diagnóstico (busca)", value: m.diagnosticoViews, base: m.views },
    { label: "Selecionaram um negócio", value: m.businessesSelected, base: m.views },
    { label: "Diagnósticos gerados", value: m.diagnosticsCreated, base: m.views },
    { label: "Leads capturados", value: m.leadsCaptured, base: m.views },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-medium tracking-tight">Landing page</h1>
        <p className="text-sm text-muted-foreground">
          Tráfego e conversão do funil público. Eventos coletados a partir de
          hoje — o histórico cresce daqui em diante.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Visualizações"
          value={String(m.views)}
          hint={`${m.viewsLast30d} nos últimos 30 dias`}
          icon={<Eye className="size-4 text-muted-foreground" />}
        />
        <MetricCard
          label="Visitantes únicos"
          value={String(m.uniqueSessions)}
          hint="por sessão de navegador"
          icon={<Users className="size-4 text-muted-foreground" />}
        />
        <MetricCard
          label="Negócios buscados"
          value={String(m.businessesSelected)}
          hint="cliques em um resultado da busca"
          icon={<MousePointerClick className="size-4 text-muted-foreground" />}
        />
        <MetricCard
          label="Diagnósticos gerados"
          value={String(m.diagnosticsCreated)}
          hint={`${m.leadsCaptured} viraram lead (${pct(m.leadsCaptured, m.diagnosticsCreated)})`}
          semaphore="verde"
          icon={<FileSearch className="size-4 text-muted-foreground" />}
        />
      </section>

      <Card className="rounded-xl border shadow-none">
        <CardContent className="flex flex-col gap-5 p-6">
          <h2 className="font-medium">Funil de conversão</h2>
          {m.views === 0 && m.diagnosticsCreated === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Sem eventos ainda. Visite a landing page para ver o primeiro registro
              — e confirme que a migration 0003 foi executada no Supabase.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {funnel.map((step) => {
                const width = step.base > 0 ? Math.max(2, (step.value / step.base) * 100) : 0;
                return (
                  <div key={step.label} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{step.label}</span>
                      <span className="tabular-nums text-muted-foreground">
                        {step.value} · {pct(step.value, step.base)}
                      </span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.min(100, width)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Eventos rastreados: visualização da landing, visualização da página de
        diagnóstico e seleção de negócio na busca. Diagnósticos e leads vêm
        direto do banco. Para análise avançada (origem de tráfego, UTM), o
        próximo passo é o PostHog previsto na spec.
      </p>
    </div>
  );
}
