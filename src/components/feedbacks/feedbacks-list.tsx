"use client";

import { useState } from "react";
import { CheckCircle2, PartyPopper, Phone, User } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Stars } from "@/components/stars";
import { resolveFeedback } from "@/app/(app)/actions";
import type { AppFunnelResponse } from "@/lib/data/app-queries";

interface FeedbacksListProps {
  feedbacks: AppFunnelResponse[];
  persisted: boolean;
}

export function FeedbacksList({ feedbacks: initial, persisted }: FeedbacksListProps) {
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(
    () => new Set(initial.filter((f) => f.resolved).map((f) => f.id))
  );

  const feedbacks = initial.map((f) => ({ ...f, resolved: resolvedIds.has(f.id) }));

  async function markResolved(id: string) {
    setResolvedIds((prev) => new Set(prev).add(id));
    if (persisted) {
      const result = await resolveFeedback(id);
      if (!result.ok) {
        setResolvedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        toast.error("Não foi possível atualizar. Tente de novo.");
        return;
      }
    }
    toast.success("Feedback marcado como resolvido.");
  }

  if (feedbacks.length === 0) {
    return (
      <Card className="rounded-xl border shadow-none">
        <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
          <PartyPopper className="size-8 text-success" />
          <p className="font-medium">Nenhuma crítica interceptada ainda — bom sinal!</p>
          <p className="text-sm text-muted-foreground">
            Quando um cliente der nota baixa na sua página de avaliação, o
            feedback aparece aqui em vez de ir pro Google.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {feedbacks.map((feedback) => (
        <Card
          key={feedback.id}
          className={`rounded-xl border shadow-none ${feedback.resolved ? "opacity-60" : ""}`}
        >
          <CardContent className="flex flex-col gap-3 p-5">
            <div className="flex flex-wrap items-center gap-3">
              <Stars rating={feedback.rating} size={14} />
              <span className="text-xs text-muted-foreground">
                {new Date(feedback.createdAt).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              {feedback.resolved ? (
                <Badge variant="secondary" className="bg-success-soft text-success">
                  Resolvido
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-warning-soft text-warning">
                  Aguardando ação
                </Badge>
              )}
            </div>
            {feedback.feedbackText ? (
              <p className="text-sm">&ldquo;{feedback.feedbackText}&rdquo;</p>
            ) : (
              <p className="text-sm italic text-muted-foreground">
                Cliente não deixou comentário.
              </p>
            )}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {feedback.customerName ? (
                <span className="flex items-center gap-1.5">
                  <User className="size-3.5" />
                  {feedback.customerName}
                </span>
              ) : null}
              {feedback.customerContact ? (
                <span className="flex items-center gap-1.5">
                  <Phone className="size-3.5" />
                  {feedback.customerContact}
                </span>
              ) : null}
              {!feedback.resolved ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-auto"
                  onClick={() => markResolved(feedback.id)}
                >
                  <CheckCircle2 className="size-4" />
                  Marcar como resolvido
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
