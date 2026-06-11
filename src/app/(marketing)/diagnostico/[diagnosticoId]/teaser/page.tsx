"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { z } from "zod";
import { Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ScoreRing, scoreLabel } from "@/components/score-ring";
import { saveLead, useDiagnosis } from "@/components/diagnostico/use-diagnosis";
import { emailProvider } from "@/lib/providers";

const leadSchema = z.object({
  email: z.string().email("Digite um e-mail válido — é pra onde enviamos o relatório."),
  whatsapp: z
    .string()
    .optional()
    .refine(
      (v) => !v || v.replace(/\D/g, "").length >= 10,
      "Digite um WhatsApp válido com DDD, ex.: (11) 99999-8888."
    ),
});

export default function TeaserPage() {
  const router = useRouter();
  const params = useParams<{ diagnosticoId: string }>();
  const placeId = params.diagnosticoId;
  const { business, competitors, result, loading, error } = useDiagnosis(placeId);

  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; whatsapp?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = leadSchema.safeParse({ email, whatsapp: whatsapp || undefined });
    if (!parsed.success) {
      const errors: { email?: string; whatsapp?: string } = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as "email" | "whatsapp";
        errors[field] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    saveLead(placeId, parsed.data.email, parsed.data.whatsapp);
    await emailProvider.sendDiagnosisReport(parsed.data.email, placeId);
    router.push(`/diagnostico/${placeId}/relatorio`);
  }

  if (error) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
        <h1 className="text-2xl font-medium">Diagnóstico não encontrado</h1>
        <p className="text-muted-foreground">Volte e busque seu negócio novamente.</p>
      </div>
    );
  }

  if (loading || !business || !result) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6 px-4 py-24">
        <Skeleton className="size-40 rounded-full" />
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  const avgCompetitors =
    competitors.reduce((s, c) => s + c.rating, 0) / (competitors.length || 1);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-8 px-4 py-16">
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-sm text-muted-foreground">{business.name}</p>
        <h1 className="text-2xl font-medium tracking-tight md:text-3xl">
          Seu diagnóstico está pronto
        </h1>
      </div>

      <div className="flex flex-col items-center gap-3">
        <ScoreRing score={result.score} caption="de 100" />
        <p className="font-medium">{scoreLabel(result.score)}</p>
      </div>

      <div className="grid w-full grid-cols-2 gap-3">
        <Card className="rounded-xl border shadow-none">
          <CardContent className="flex flex-col gap-1 p-4 text-center">
            <span className="text-2xl font-medium tabular-nums">
              {business.rating.toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">sua nota no Google</span>
          </CardContent>
        </Card>
        <Card className="rounded-xl border shadow-none">
          <CardContent className="flex flex-col gap-1 p-4 text-center">
            <span
              className={`text-2xl font-medium tabular-nums ${
                result.ratingGapVsCompetitors < 0 ? "text-danger" : "text-success"
              }`}
            >
              {avgCompetitors.toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">média dos concorrentes</span>
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo bloqueado */}
      <Card className="w-full rounded-xl border shadow-none">
        <CardContent className="flex flex-col gap-4 p-6">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Lock className="size-4 text-warning" />3 problemas críticos e 5
            recomendações bloqueados
          </div>
          <div className="flex flex-col gap-2.5" aria-hidden>
            <div className="h-3.5 w-full rounded bg-muted" />
            <div className="h-3.5 w-11/12 rounded bg-muted" />
            <div className="h-3.5 w-4/5 rounded bg-muted" />
            <div className="h-3.5 w-full rounded bg-muted" />
            <div className="h-3.5 w-2/3 rounded bg-muted" />
          </div>
        </CardContent>
      </Card>

      {/* Captura de lead — nunca usar a palavra "cadastro" */}
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Seu e-mail</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@seunegocio.com.br"
            aria-invalid={Boolean(fieldErrors.email)}
          />
          {fieldErrors.email ? (
            <p className="text-sm text-danger">{fieldErrors.email}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="whatsapp">
            WhatsApp <span className="text-muted-foreground">(opcional)</span>
          </Label>
          <Input
            id="whatsapp"
            type="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="(11) 99999-8888"
            aria-invalid={Boolean(fieldErrors.whatsapp)}
          />
          {fieldErrors.whatsapp ? (
            <p className="text-sm text-danger">{fieldErrors.whatsapp}</p>
          ) : null}
        </div>
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
          Ver relatório completo
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Enviamos uma cópia do relatório no seu e-mail. Nada de spam.
        </p>
      </form>
    </div>
  );
}
