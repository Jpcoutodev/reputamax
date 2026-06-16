import Link from "next/link";
import { Suspense } from "react";
import { AlertTriangle, CheckCircle2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MetricCard } from "@/components/metric-card";
import { LogsFilters } from "@/components/admin/logs-filters";
import { getAiLogs } from "@/lib/data/ai-logs";

export const metadata = { title: "Logs de avaliação" };

const providerLabels: Record<string, string> = {
  minimax: "MiniMax",
  anthropic: "Claude",
  openai: "GPT",
  mock: "Determinístico",
};

interface PageProps {
  searchParams: Promise<{ status?: string; provider?: string; page?: string }>;
}

export default async function AdminLogsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = params.status === "ok" || params.status === "fallback" ? params.status : undefined;
  const page = Math.max(1, Number(params.page) || 1);

  const { rows, total, pageSize, summary } = await getAiLogs({
    status,
    provider: params.provider,
    page,
  });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function pageHref(p: number): string {
    const sp = new URLSearchParams();
    if (params.status) sp.set("status", params.status);
    if (params.provider) sp.set("provider", params.provider);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return `/admin/logs${qs ? `?${qs}` : ""}`;
  }

  const totalCalls = summary.ok + summary.fallback;
  const successRate = totalCalls > 0 ? Math.round((summary.ok / totalCalls) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-medium tracking-tight">Logs de avaliação</h1>
        <p className="text-sm text-muted-foreground">
          Cada chamada de IA (diagnóstico e sugestão de resposta): qual modelo foi
          usado, se deu certo ou caiu no determinístico, e o erro quando falhou.
        </p>
      </div>

      {summary.tableMissing ? (
        <Card className="rounded-xl border-warning/40 bg-warning-soft shadow-none">
          <CardContent className="flex items-start gap-3 p-5">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" />
            <p className="text-sm">
              A tabela de logs ainda não existe. Rode a migration{" "}
              <span className="font-mono">0005_ai_logs.sql</span> no SQL Editor do
              Supabase para começar a registrar as chamadas.
            </p>
          </CardContent>
        </Card>
      ) : (
        <section className="grid gap-4 sm:grid-cols-3">
          <MetricCard
            label="Sucesso (30 dias)"
            value={String(summary.ok)}
            hint="análises geradas pela IA"
            semaphore="verde"
            icon={<CheckCircle2 className="size-4 text-success" />}
          />
          <MetricCard
            label="Caíram no determinístico"
            value={String(summary.fallback)}
            hint="IA falhou e usou o cálculo por regras"
            semaphore={summary.fallback > 0 ? "ambar" : "neutro"}
            icon={<AlertTriangle className="size-4 text-warning" />}
          />
          <MetricCard
            label="Taxa de sucesso"
            value={`${successRate}%`}
            hint={`${totalCalls} chamadas no período`}
            semaphore={successRate >= 90 ? "verde" : successRate >= 70 ? "ambar" : "vermelho"}
          />
        </section>
      )}

      <Suspense>
        <LogsFilters />
      </Suspense>

      <Card className="rounded-xl border shadow-none">
        <CardContent className="p-2 sm:p-4">
          {rows.length === 0 ? (
            <p className="p-10 text-center text-sm text-muted-foreground">
              {summary.tableMissing
                ? "Sem logs — rode a migration 0005 primeiro."
                : "Nenhum log com esses filtros. Gere um diagnóstico para ver o primeiro registro."}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quando</TableHead>
                  <TableHead>Operação</TableHead>
                  <TableHead>IA</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Duração</TableHead>
                  <TableHead>Negócio / erro</TableHead>
                  <TableHead className="text-right">Detalhe</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(r.createdAt).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="text-sm">
                      {r.operation === "analyze" ? "Diagnóstico" : "Resposta"}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {providerLabels[r.provider] ?? r.provider}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {r.model ?? "—"}
                    </TableCell>
                    <TableCell>
                      {r.status === "ok" ? (
                        <Badge variant="secondary" className="bg-success-soft text-success">
                          Sucesso
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-warning-soft text-warning">
                          Determinístico
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-sm text-muted-foreground">
                      {r.durationMs != null ? `${(r.durationMs / 1000).toFixed(1)}s` : "—"}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      {r.error ? (
                        <span className="block truncate text-xs text-danger" title={r.error}>
                          {r.error}
                        </span>
                      ) : (
                        <span className="block truncate text-sm text-muted-foreground">
                          {r.businessName ?? "—"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" render={<Link href={`/admin/logs/${r.id}`} />}>
                        <Eye className="size-3.5" />
                        Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-2 text-sm">
          {page > 1 ? (
            <Button variant="outline" size="sm" render={<Link href={pageHref(page - 1)} />}>
              Anterior
            </Button>
          ) : null}
          <span className="text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          {page < totalPages ? (
            <Button variant="outline" size="sm" render={<Link href={pageHref(page + 1)} />}>
              Próxima
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
