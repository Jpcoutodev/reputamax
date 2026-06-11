"use client";

import { useMemo, useState } from "react";
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
import { analysisProvider, type Review } from "@/lib/providers";
import { getDemoBusiness } from "@/lib/mock-data/app-data";
import { generateReviews } from "@/lib/mock-data/review-generator";

export default function AvaliacoesPage() {
  const business = getDemoBusiness();
  const baseReviews = useMemo(() => generateReviews(business.placeId), [business.placeId]);

  // respostas salvas em memória durante a sessão (fase mock)
  const [overrides, setOverrides] = useState<Record<string, { replyText: string }>>({});
  const [ratingFilter, setRatingFilter] = useState<string>("todas");
  const [statusFilter, setStatusFilter] = useState<string>("todas");

  const [replying, setReplying] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState("");
  const [suggesting, setSuggesting] = useState(false);

  const reviews = baseReviews.map((review) =>
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
    const suggestion = await analysisProvider.suggestReply(
      replying,
      business.name,
      "amigavel"
    );
    setReplyText(suggestion);
    setSuggesting(false);
  }

  function handlePublish() {
    if (!replying || !replyText.trim()) return;
    setOverrides((prev) => ({ ...prev, [replying.id]: { replyText: replyText.trim() } }));
    setReplying(null);
    setReplyText("");
    toast.success("Resposta registrada (modo demonstração)");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-medium tracking-tight">Avaliações</h1>
        <p className="text-sm text-muted-foreground">
          Todas as avaliações do seu perfil no Google. Responda 100% delas — o
          Google e os clientes notam.
        </p>
      </div>

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
              Nenhuma avaliação com esses filtros. Limpe os filtros para ver todas.
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
            <Button type="button" onClick={handlePublish} disabled={!replyText.trim()}>
              Publicar no Google
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
