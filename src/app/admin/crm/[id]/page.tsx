import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { AlertTriangle, Download, Mail, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MetricCard } from "@/components/metric-card";
import { ScoreRing } from "@/components/score-ring";
import { scoreLabel } from "@/lib/score-utils";
import { getCrmDiagnostic } from "@/lib/data/admin-queries";

export const metadata = { title: "Relatório de diagnóstico" };

interface PageProps {
  params: Promise<{ id: string }>;
}

const stageLabels: Record<string, string> = {
  diagnostico: "Diagnóstico",
  lead: "Lead capturado",
  contatado: "Contatado",
  negociacao: "Em negociação",
  cliente: "Cliente",
  perdido: "Perdido",
};

export default async function CrmDiagnosticPage({ params }: PageProps) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();

  const diagnostic = await getCrmDiagnostic(id);
  if (!diagnostic) notFound();

  const { business, result } = diagnostic;
  const gap = result?.ratingGapVsCompetitors ?? 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-medium tracking-tight">{business.name}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <Badge variant="secondary" className="bg-accent text-accent-foreground">
              {stageLabels[diagnostic.stage]}
            </Badge>
            <span>
              Gerado em{" "}
              {new Date(diagnostic.createdAt).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </span>
            {diagnostic.leadEmail ? (
              <span className="flex items-center gap-1">
                <Mail className="size-3.5" /> {diagnostic.leadEmail}
              </span>
            ) : null}
            {diagnostic.leadWhatsapp ? (
              <span className="flex items-center gap-1">
                <Phone className="size-3.5" /> {diagnostic.leadWhatsapp}
              </span>
            ) : null}
          </div>
        </div>
        {result ? (
          <Button render={<Link href={`/admin/crm/${diagnostic.id}/pdf`} prefetch={false} />}>
            <Download className="size-4" />
            Baixar PDF
          </Button>
        ) : null}
      </div>

      {!result ? (
        <Card className="rounded-xl border shadow-none">
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            A análise deste diagnóstico ainda não foi concluída.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* score + resumo */}
          <section className="flex flex-col items-center gap-4 text-center">
            <ScoreRing score={result.score} caption="de 100" animate={false} />
            <h2 className="text-xl font-medium tracking-tight">{scoreLabel(result.score)}</h2>
            <p className="max-w-2xl text-left text-sm text-muted-foreground">
              {result.summary}
            </p>
          </section>

          {/* métricas */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Nota no Google"
              value={business.rating.toFixed(1)}
              hint={`${business.reviewCount} avaliações`}
            />
            <MetricCard
              label="Taxa de resposta"
              value={`${result.responseRatePct}%`}
              semaphore={result.responseRatePct >= 70 ? "verde" : result.responseRatePct >= 40 ? "ambar" : "vermelho"}
            />
            <MetricCard
              label="Avaliações/mês"
              value={String(result.reviewsPerMonth)}
              hint={`potencial: ${result.expectedReviewsPerMonth}`}
            />
            <MetricCard
              label="Gap vs. concorrentes"
              value={`${gap > 0 ? "+" : ""}${gap.toFixed(1)}`}
              semaphore={gap >= 0 ? "verde" : "vermelho"}
            />
          </section>

          {/* temas */}
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-medium tracking-tight">O que os clientes comentam</h2>
            <Card className="rounded-xl border shadow-none">
              <CardContent className="flex flex-col gap-4 p-6">
                {result.sentimentThemes.map((theme) => (
                  <div key={theme.theme} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{theme.theme}</span>
                      <span className="text-muted-foreground">{theme.pct}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
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
                        &ldquo;{theme.examples[0].slice(0, 180)}&rdquo;
                      </p>
                    ) : null}
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          {/* problemas críticos */}
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-medium tracking-tight">Problemas críticos</h2>
            <div className="flex flex-col gap-2">
              {result.criticalIssues.map((issue, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-warning/40 bg-warning-soft p-4"
                >
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
                  <p className="text-sm">{issue}</p>
                </div>
              ))}
            </div>
          </section>

          {/* recomendações */}
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-medium tracking-tight">Recomendações</h2>
            <ol className="flex flex-col gap-2">
              {result.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-3 rounded-xl border p-4">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-medium text-accent-foreground">
                    {i + 1}
                  </span>
                  <p className="text-sm">{rec}</p>
                </li>
              ))}
            </ol>
          </section>
        </>
      )}
    </div>
  );
}
