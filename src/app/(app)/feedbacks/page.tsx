"use client";

import { useState } from "react";
import { CheckCircle2, PartyPopper, Phone, User } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Stars } from "@/components/stars";
import { demoFunnelResponses } from "@/lib/mock-data/app-data";

export default function FeedbacksPage() {
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(
    () => new Set(demoFunnelResponses.filter((f) => f.resolved).map((f) => f.id))
  );

  const feedbacks = demoFunnelResponses
    .filter((f) => f.rating <= 3)
    .map((f) => ({ ...f, resolved: resolvedIds.has(f.id) }));

  function markResolved(id: string) {
    setResolvedIds((prev) => new Set(prev).add(id));
    toast.success("Feedback marcado como resolvido.");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-medium tracking-tight">Feedbacks interceptados</h1>
        <p className="text-sm text-muted-foreground">
          Críticas que chegaram em privado — e não viraram estrelas vermelhas no
          Google. Resolva com o cliente e marque como resolvido.
        </p>
      </div>

      {feedbacks.length === 0 ? (
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
      ) : (
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
      )}
    </div>
  );
}
