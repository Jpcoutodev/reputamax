"use client";

import { useState } from "react";
import { Loader2, MessageSquareReply, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Stars } from "@/components/stars";
import { mockAnalysisProvider } from "@/lib/providers/analysis/mock";
import type { Review } from "@/lib/providers/types";
import { replyToReview } from "@/app/(app)/actions";
import type { AppReview } from "@/lib/data/app-queries";

interface ReviewsListProps {
  reviews: AppReview[];
  businessName: string;
  tone: "amigavel" | "formal";
  /** true = grava no banco; false = modo demonstração (memória) */
  persisted: boolean;
}

export function ReviewsList({ reviews: initial, businessName, tone, persisted }: ReviewsListProps) {
  const [overrides, setOverrides] = useState<Record<string, { replyText: string }>>({});
  const [ratingFilter, setRatingFilter] = useState<string>("todas");
  const [statusFilter, setStatusFilter] = useState<string>("todas");

  const [replying, setReplying] = useState<AppReview | null>(null);
  const [replyText, setReplyText] = useState("");
  const [suggesting, setSuggesting] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const reviews = initial.map((review) =>
    overrides[review.id]
      ? { ...review, replied: true, replyText: overrides[review.id].replyText }
      : review
  );

  const filtered = reviews.filter((review) => {
    if (ratingFilter !== "todas" && review.rating !== Number(ratingFilter)) return false;
    if (statusFilter === "respondidas" && !review.replied) return false;
    if (statusFilter === "nao-respondidas" && review.replied) return false;
    return true;
  });

  async function handleSuggest() {
    if (!replying) return;
    setSuggesting(true);
    try {
      if (persisted) {
        // IA roda no servidor (a chave do LLM não existe no browser)
        const res = await fetch("/api/ai/suggest-reply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rating: replying.rating,
            text: replying.text,
            authorName: replying.authorName,
          }),
        });
        if (!res.ok) throw new Error(String(res.status));
        const { reply } = await res.json();
        setReplyText(reply);
      } else {
        // modo demonstração: template local
        const suggestion = await mockAnalysisProvider.suggestReply(
          {
            id: replying.id,
            authorName: replying.authorName,
            rating: replying.rating as Review["rating"],
            text: replying.text,
            createdAt: replying.createdAt,
            replied: replying.replied,
            themes: [],
          },
          businessName,
          tone
        );
        setReplyText(suggestion);
      }
    } catch {
      toast.error("Não foi possível gerar a sugestão agora. Tente de novo.");
    }
    setSuggesting(false);
  }

  async function handlePublish() {
    if (!replying || !replyText.trim()) return;
    setPublishing(true);
    const text = replyText.trim();

    if (persisted) {
      const result = await replyToReview({ reviewId: replying.id, replyText: text });
      setPublishing(false);
      if (!result.ok) {
        toast.error("Não foi possível salvar a resposta. Tente de novo.");
        return;
      }
      toast.success("Resposta registrada! A publicação no Google entra com a conexão oficial.");
    } else {
      setPublishing(false);
      toast.success("Resposta registrada (modo demonstração)");
    }

    setOverrides((prev) => ({ ...prev, [replying.id]: { replyText: text } }));
    setReplying(null);
    setReplyText("");
  }

  return (
    <>
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={ratingFilter} onValueChange={(v) => setRatingFilter(v ?? "todas")}>
          <SelectTrigger className="w-40" aria-label="Filtrar por nota">
            <SelectValue placeholder="Nota" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as notas</SelectItem>
            {[5, 4, 3, 2, 1].map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n} estrela{n > 1 ? "s" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "todas")}>
          <SelectTrigger className="w-44" aria-label="Filtrar por status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            <SelectItem value="respondidas">Respondidas</SelectItem>
            <SelectItem value="nao-respondidas">Não respondidas</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {filtered.length} avaliaç{filtered.length === 1 ? "ão" : "ões"}
        </span>
      </div>

      {/* Lista */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <Card className="rounded-xl border shadow-none">
            <CardContent className="p-10 text-center text-sm text-muted-foreground">
              {initial.length === 0
                ? "Suas avaliações do Google aparecem aqui assim que a conexão com o perfil for ativada."
                : "Nenhuma avaliação com esses filtros. Limpe os filtros para ver todas."}
            </CardContent>
          </Card>
        ) : (
          filtered.slice(0, 30).map((review) => (
            <Card key={review.id} className="rounded-xl border shadow-none">
              <CardContent className="flex flex-col gap-3 p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-medium">{review.authorName}</span>
                  <Stars rating={review.rating} size={14} />
                  <span className="text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                  {review.replied ? (
                    <Badge variant="secondary" className="bg-success-soft text-success">
                      Respondida
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-warning-soft text-warning">
                      Aguardando resposta
                    </Badge>
                  )}
                </div>
                <p className="text-sm">{review.text}</p>
                {review.replied && review.replyText ? (
                  <div className="rounded-lg bg-surface p-3 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Sua resposta: </span>
                    {review.replyText}
                  </div>
                ) : (
                  <div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setReplying(review);
                        setReplyText("");
                      }}
                    >
                      <MessageSquareReply className="size-4" />
                      Responder
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal de resposta */}
      <Dialog open={Boolean(replying)} onOpenChange={(open) => !open && setReplying(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Responder avaliação</DialogTitle>
            <DialogDescription>
              A resposta fica pública no seu perfil do Google.
            </DialogDescription>
          </DialogHeader>
          {replying ? (
            <div className="flex flex-col gap-2 rounded-lg bg-surface p-3 text-left">
              <span className="flex items-center gap-2 text-sm">
                <span className="font-medium text-foreground">
                  {replying.authorName}
                </span>
                <Stars rating={replying.rating} size={13} />
              </span>
              <span className="text-sm">{replying.text}</span>
            </div>
          ) : null}
          <Textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={5}
            placeholder="Escreva sua resposta ou peça uma sugestão pra IA…"
            aria-label="Texto da resposta"
          />
          <DialogFooter className="gap-2 sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleSuggest}
              disabled={suggesting}
            >
              {suggesting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              Sugerir resposta com IA
            </Button>
            <Button
              type="button"
              onClick={handlePublish}
              disabled={!replyText.trim() || publishing}
            >
              {publishing ? <Loader2 className="size-4 animate-spin" /> : null}
              Publicar no Google
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
