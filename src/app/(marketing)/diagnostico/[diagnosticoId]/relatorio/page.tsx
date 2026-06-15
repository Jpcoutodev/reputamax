"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MetricCard } from "@/components/metric-card";
import { ScoreRing, scoreLabel } from "@/components/score-ring";
import { useDiagnosis } from "@/components/diagnostico/use-diagnosis";

export default function RelatorioPage() {
  const router = useRouter();
  const params = useParams<{ diagnosticoId: string }>();
  const placeId = params.diagnosticoId;
  const { business, result, leadCaptured, loading, error } = useDiagnosis(placeId);

  // relatório só após captura do lead — senão volta pro teaser
  useEffect(() => {
    if (!loading && !error && !leadCaptured) {
      router.replace(`/diagnostico/${placeId}/teaser`);
    }
  }, [loading, error, leadCaptured, placeId, router]);

  if (error) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
        <h1 className="text-2xl font-medium">Relatório não encontrado</h1>
        <p className="text-muted-foreground">Volte e faça o diagnóstico novamente.</p>
      </div>
    );
  }

  if (loading || !business || !result || !leadCaptured) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-16">
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  const gap = result.ratingGapVsCompetitors;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 py-16">
      {/* 1. Score + resumo executivo */}
      <section className="flex flex-col items-center gap-6 text-center">
        <p className="text-sm text-muted-foreground">
          Relatório de reputação — {business.name}
        </p>
        <ScoreRing score={result.score} caption="de 100" />
        <h1 className="text-2xl font-medium tracking-tight">{scoreLabel(result.score)}</h1>
        <p className="max-w-2xl text-left text-muted-foreground">{result.summary}</p>
      </section>

      {/* 2. Cards de métricas com semáforo */}
      <section className="grid gap-4 sm:grid-cols-2">
        <MetricCard
          label="Nota atual no Google"
          value={business.rating.toFixed(1)}
          hint={`${business.reviewCount} avaliações`}
          semaphore={business.rating >= 4.5 ? "verde" : business.rating >= 4 ? "ambar" : "vermelho"}
        />
        <MetricCard
          label="Taxa de resposta"
          value={result.responseDataAvailable ? `${result.responseRatePct}%` : "—"}
          hint={
            result.responseDataAvailable
              ? "das avaliações respondidas"
              : "disponível ao conectar o Google Meu Negócio"
          }
          semaphore={
            !result.responseDataAvailable
              ? "neutro"
              : result.responseRatePct >= 70
                ? "verde"
                : result.responseRatePct >= 40
                  ? "ambar"
                  : "vermelho"
          }
        />
        <MetricCard
          label="Avaliações por mês"
          value={`${result.reviewsPerMonth}`}
          hint={`potencial estimado: ${result.expectedReviewsPerMonth}/mês`}
          semaphore={
            result.reviewsPerMonth >= result.expectedReviewsPerMonth
              ? "verde"
              : result.reviewsPerMonth >= result.expectedReviewsPerMonth / 2
                ? "ambar"
                : "vermelho"
          }
        />
        <MetricCard
          label="Gap vs. concorrentes"
          value={`${gap > 0 ? "+" : ""}${gap.toFixed(1)}`}
          hint="diferença da sua nota para a média local"
          semaphore={gap >= 0 ? "verde" : gap >= -0.2 ? "ambar" : "vermelho"}
        />
      </section>

      {/* 3. Temas de sentimento */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium tracking-tight">
          O que os clientes mais comentam
        </h2>
        <Card className="rounded-xl border shadow-none">
          <CardContent className="flex flex-col gap-5 p-6">
            {result.sentimentThemes.map((theme) => (
              <div key={theme.theme} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{theme.theme}</span>
                  <span className="text-muted-foreground">
                    {theme.pct}% das avaliações
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${theme.pct}%`,
                      backgroundColor:
                        theme.type === "critica" ? "var(--danger)" : "var(--success)",
                    }}
                  />
                </div>
                {theme.examples[0] ? (
                  <p className="text-xs italic text-muted-foreground">
                    &ldquo;{theme.examples[0]}&rdquo;
                  </p>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* 4. Problemas críticos */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium tracking-tight">3 problemas críticos</h2>
        <div className="flex flex-col gap-3">
          {result.criticalIssues.map((issue, i) => (
            <Card
              key={i}
              className={`rounded-xl shadow-none ${
                i === 0
                  ? "border-danger/40 bg-danger-soft"
                  : "border-warning/40 bg-warning-soft"
              }`}
            >
              <CardContent className="flex items-start gap-3 p-5">
                <AlertTriangle
                  className={`mt-0.5 size-5 shrink-0 ${i === 0 ? "text-danger" : "text-warning"}`}
                />
                <p className="text-sm">{issue}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 5. Recomendações */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium tracking-tight">
          5 recomendações para os próximos 90 dias
        </h2>
        <ol className="flex flex-col gap-3">
          {result.recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-3 rounded-xl border bg-card p-5">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-medium text-accent-foreground">
                {i + 1}
              </span>
              <p className="text-sm">{rec}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 6. CTA final */}
      <section className="flex flex-col items-center gap-4 rounded-xl bg-navy p-10 text-center">
        <h2 className="text-2xl font-medium tracking-tight text-white">
          Pronto para resolver isso?
        </h2>
        <p className="max-w-md text-sm text-white/70">
          O Reputamax automatiza o pedido de avaliações, intercepta críticas e
          responde por você — tudo que este relatório recomenda.
        </p>
        <div className="flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center">
          <Button
            size="lg"
            className="h-auto whitespace-normal py-3 text-center leading-tight"
            render={<Link href={`/cadastro?diagnostico=${placeId}`} />}
          >
            Resolver isso com o Reputamax — 14 dias grátis, sem cartão
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="h-auto py-3"
            render={<a href={`/api/diagnostico/${placeId}/pdf`} />}
          >
            <Download className="size-4" />
            Baixar PDF
          </Button>
        </div>
      </section>
    </div>
  );
}
