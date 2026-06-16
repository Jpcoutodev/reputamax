import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { AlertTriangle, ArrowLeft, Bot, Calculator, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAiLog } from "@/lib/data/ai-logs";

export const metadata = { title: "Detalhe do log" };

const providerLabels: Record<string, string> = {
  minimax: "MiniMax",
  anthropic: "Claude",
  openai: "GPT",
  mock: "Determinístico",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LogDetailPage({ params }: PageProps) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();

  const log = await getAiLog(id);
  if (!log) notFound();

  const isAnalyze = log.operation === "analyze";
  const usedAi = log.provider !== "mock" && log.status === "ok";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit text-muted-foreground"
          render={<Link href="/admin/logs" />}
        >
          <ArrowLeft className="size-4" />
          Voltar aos logs
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-medium tracking-tight">
            {isAnalyze ? "Diagnóstico" : "Sugestão de resposta"}
          </h1>
          {log.status === "ok" ? (
            <Badge variant="secondary" className="bg-success-soft text-success">
              Sucesso
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-warning-soft text-warning">
              Caiu no determinístico
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
          <span>
            IA: <strong className="text-foreground">{providerLabels[log.provider] ?? log.provider}</strong>
          </span>
          <span>
            Modelo: <span className="font-mono">{log.model ?? "—"}</span>
          </span>
          <span>
            Duração:{" "}
            {log.durationMs != null ? `${(log.durationMs / 1000).toFixed(1)}s` : "—"}
          </span>
          {log.businessName ? <span>Negócio: {log.businessName}</span> : null}
          <span>{new Date(log.createdAt).toLocaleString("pt-BR")}</span>
        </div>
      </div>

      {/* Composição do relatório */}
      <Card className="rounded-xl border shadow-none">
        <CardContent className="flex flex-col gap-4 p-6">
          <h2 className="font-medium">Como este relatório foi montado</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-lg border bg-surface p-4">
              <Calculator className="mt-0.5 size-5 shrink-0 text-primary" />
              <div className="text-sm">
                <p className="font-medium">Determinístico (cálculo)</p>
                <p className="text-muted-foreground">
                  Score, nota, taxa de resposta, ritmo e gap vs. concorrentes — sempre
                  calculados por regras, nunca pela IA.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border bg-surface p-4">
              <Bot className="mt-0.5 size-5 shrink-0 text-primary" />
              <div className="text-sm">
                <p className="font-medium">
                  {usedAi ? "Gerado pela IA" : "Seria gerado pela IA"}
                </p>
                <p className="text-muted-foreground">
                  Resumo, problemas críticos, recomendações e temas de sentimento.
                  {usedAi
                    ? " Nesta chamada, vieram da IA (abaixo)."
                    : " Nesta chamada a IA não foi usada — esses textos vieram dos modelos de frase determinísticos."}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Erro, quando houve */}
      {log.error ? (
        <Card className="rounded-xl border-danger/40 bg-danger-soft shadow-none">
          <CardContent className="flex items-start gap-3 p-5">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-danger" />
            <div className="text-sm">
              <p className="font-medium">Erro da IA (por isso caiu no determinístico)</p>
              <p className="mt-1 font-mono text-xs text-danger">{log.error}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Prompt enviado */}
      {log.request ? (
        <Card className="rounded-xl border shadow-none">
          <CardContent className="flex flex-col gap-3 p-6">
            <div className="flex items-center gap-2">
              <Send className="size-4 text-muted-foreground" />
              <h2 className="font-medium">Enviado para a IA (prompt)</h2>
            </div>
            <pre className="max-h-[28rem] overflow-auto whitespace-pre-wrap rounded-lg bg-surface p-4 text-xs leading-relaxed text-foreground/80">
              {log.request}
            </pre>
          </CardContent>
        </Card>
      ) : null}

      {/* Resposta da IA */}
      {log.response ? (
        <Card className="rounded-xl border shadow-none">
          <CardContent className="flex flex-col gap-3 p-6">
            <div className="flex items-center gap-2">
              <Bot className="size-4 text-muted-foreground" />
              <h2 className="font-medium">Resposta da IA</h2>
            </div>
            <pre className="max-h-[28rem] overflow-auto whitespace-pre-wrap rounded-lg bg-surface p-4 text-xs leading-relaxed text-foreground/80">
              {log.response}
            </pre>
          </CardContent>
        </Card>
      ) : null}

      {!log.request && !log.response ? (
        <Card className="rounded-xl border shadow-none">
          <CardContent className="p-6 text-sm text-muted-foreground">
            Esta chamada foi 100% determinística (sem IA), então não houve prompt
            nem resposta de IA para registrar.
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
