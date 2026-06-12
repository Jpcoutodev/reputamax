"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Check, Circle, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
// caminho demo roda no browser — sempre mock local (o real busca via API)
import { mockReviewProvider } from "@/lib/providers/reviews/mock";
import { isUuid } from "@/components/diagnostico/use-diagnosis";

interface TheaterStep {
  label: (ctx: { reviewCount: number; competitorCount: number }) => string;
  /** segundo (relativo) em que o passo conclui */
  doneAt: number;
}

const theaterSteps: TheaterStep[] = [
  { label: ({ reviewCount }) => `${reviewCount} avaliações encontradas`, doneAt: 4 },
  { label: () => "Sentimento analisado por IA", doneAt: 8 },
  {
    label: ({ competitorCount }) => `Comparando ${competitorCount} concorrentes próximos…`,
    doneAt: 12,
  },
  { label: () => "Gerando recomendações", doneAt: 16 },
];

const TOTAL_SECONDS = 16;

export default function AnalisePage() {
  const router = useRouter();
  const params = useParams<{ diagnosticoId: string }>();
  const diagnosticoId = params.diagnosticoId;

  const [elapsed, setElapsed] = useState(0);
  const [businessName, setBusinessName] = useState<string>("");
  const [reviewCount, setReviewCount] = useState(0);
  const [error, setError] = useState(false);
  const dataReady = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (isUuid(diagnosticoId)) {
          // modo real: busca o diagnóstico e roda a análise no servidor em paralelo
          const res = await fetch(`/api/diagnostico/${diagnosticoId}`);
          if (!res.ok) throw new Error("not_found");
          const data = await res.json();
          if (cancelled) return;
          setBusinessName(data.business?.name ?? "");
          setReviewCount(data.business?.reviewCount ?? 0);

          await fetch(`/api/diagnostico/${diagnosticoId}/analyze`, { method: "POST" });
          if (!cancelled) dataReady.current = true;
        } else {
          // modo demonstração: id é o placeId
          const [business, reviews] = await Promise.all([
            mockReviewProvider.getBusinessDetails(diagnosticoId),
            mockReviewProvider.getReviews(diagnosticoId),
          ]);
          if (cancelled) return;
          setBusinessName(business.name);
          setReviewCount(reviews.length);
          dataReady.current = true;
        }
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [diagnosticoId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 0.1;
        if (next >= TOTAL_SECONDS && dataReady.current) {
          clearInterval(interval);
          router.replace(`/diagnostico/${diagnosticoId}/teaser`);
        }
        return Math.min(next, TOTAL_SECONDS);
      });
    }, 100);
    return () => clearInterval(interval);
  }, [diagnosticoId, router]);

  if (error) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
        <h1 className="text-2xl font-medium">Não encontramos esse diagnóstico</h1>
        <p className="text-muted-foreground">
          O link pode estar incorreto. Volte e busque seu negócio novamente.
        </p>
      </div>
    );
  }

  const ctx = { reviewCount, competitorCount: 3 };
  const progressPct = Math.min(100, (elapsed / TOTAL_SECONDS) * 100);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-10 px-4 py-24">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-medium tracking-tight">
          Analisando {businessName || "seu negócio"}…
        </h1>
        <p className="text-muted-foreground">
          Estamos cruzando suas avaliações com os concorrentes da região.
        </p>
      </div>

      <Progress value={progressPct} className="h-2 w-full" aria-label="Progresso da análise" />

      <ul className="flex w-full flex-col gap-4">
        {theaterSteps.map((step, i) => {
          const done = elapsed >= step.doneAt;
          const active = !done && (i === 0 || elapsed >= theaterSteps[i - 1].doneAt);
          return (
            <li key={i} className="flex items-center gap-3 text-sm">
              {done ? (
                <span className="flex size-6 items-center justify-center rounded-full bg-success/10">
                  <Check className="size-4 text-success" />
                </span>
              ) : active ? (
                <span className="flex size-6 items-center justify-center">
                  <Loader2 className="size-4 animate-spin text-primary" />
                </span>
              ) : (
                <span className="flex size-6 items-center justify-center">
                  <Circle className="size-3 text-muted-foreground/40" />
                </span>
              )}
              <span className={done || active ? "text-foreground" : "text-muted-foreground"}>
                {step.label(ctx)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
