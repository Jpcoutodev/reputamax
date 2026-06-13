"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, Heart, Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface FunnelProps {
  slug: string;
  businessName: string;
  welcomeMessage?: string;
  /** link "escreva uma avaliação" do Google; sem ele, nota alta mostra só agradecimento */
  reviewLink?: string;
  /** logo do negócio; sem ela, mostra a inicial do nome */
  logoUrl?: string;
  /** desativa navegação/efeitos — usado no preview da área logada */
  previewMode?: boolean;
}

export function ReviewFunnel({
  slug,
  businessName,
  welcomeMessage,
  reviewLink,
  logoUrl,
  previewMode = false,
}: FunnelProps) {
  const router = useRouter();
  const [rating, setRating] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [highThanks, setHighThanks] = useState(false);

  async function recordResponse(payload: Record<string, unknown>) {
    try {
      await fetch("/api/review-funnel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, ...payload }),
      });
    } catch {
      // a experiência do cliente final nunca quebra por falha de gravação
      console.warn("[review-funnel] não foi possível gravar a resposta");
    }
  }

  async function handleHighRating() {
    if (previewMode) return;
    await recordResponse({ rating, redirectedToGoogle: Boolean(reviewLink) });
    if (reviewLink) {
      window.open(reviewLink, "_blank", "noopener");
    }
    setHighThanks(true);
  }

  async function handleFeedbackSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (previewMode) return;
    setSubmitting(true);
    await recordResponse({
      rating,
      redirectedToGoogle: false,
      feedbackText: feedback,
      customerName: customerName || undefined,
      customerContact: customerContact || undefined,
    });
    router.push(`/r/${slug}/obrigado`);
  }

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-8">
      <div className="flex flex-col items-center gap-3 text-center">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt={businessName}
            className="size-28 rounded-2xl object-cover shadow-sm"
          />
        ) : (
          <span className="flex size-16 items-center justify-center rounded-2xl bg-primary text-2xl font-medium text-primary-foreground">
            {businessName.charAt(0)}
          </span>
        )}
        <h1 className="text-2xl font-medium tracking-tight">{businessName}</h1>
        <p className="text-lg text-muted-foreground">
          {welcomeMessage || "Como foi sua experiência?"}
        </p>
      </div>

      {/* Seletor de estrelas — área de toque generosa */}
      <div className="flex items-center gap-1" role="radiogroup" aria-label="Sua nota">
        {[1, 2, 3, 4, 5].map((value) => {
          const filled = (hovered ?? rating ?? 0) >= value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={rating === value}
              aria-label={`${value} estrela${value > 1 ? "s" : ""}`}
              onClick={() => {
                setRating(value);
                setHighThanks(false);
              }}
              onMouseEnter={() => setHovered(value)}
              onMouseLeave={() => setHovered(null)}
              className="flex size-14 items-center justify-center rounded-xl transition-transform active:scale-90"
            >
              <Star
                className={`size-10 transition-colors ${
                  filled ? "fill-amber-400 text-amber-400" : "fill-muted text-muted-foreground/30"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Nota alta (4–5) */}
      {rating !== null && rating >= 4 ? (
        highThanks ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <Heart className="size-8 fill-danger text-danger" />
            <p className="text-lg font-medium">Obrigado pelo carinho!</p>
            <p className="text-sm text-muted-foreground">
              Sua opinião faz toda a diferença para nós.
            </p>
          </div>
        ) : (
          <div className="flex w-full flex-col items-center gap-4 text-center">
            <p className="text-base">
              Que ótimo! Ajudaria muito se deixasse isso no Google — leva 30 segundos.
            </p>
            {reviewLink ? (
              <Button size="lg" className="h-13 w-full text-base" onClick={handleHighRating}>
                <ExternalLink className="size-4" />
                Avaliar no Google
              </Button>
            ) : (
              <Button size="lg" className="h-13 w-full text-base" onClick={handleHighRating}>
                Enviar minha nota
              </Button>
            )}
          </div>
        )
      ) : null}

      {/* Nota baixa (1–3): feedback privado */}
      {rating !== null && rating <= 3 ? (
        <form onSubmit={handleFeedbackSubmit} className="flex w-full flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="feedback" className="text-base">
              O que podemos melhorar?
            </Label>
            <Textarea
              id="feedback"
              required
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Conte o que aconteceu — sua mensagem vai direto para o responsável."
              rows={4}
              className="text-base"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="customerName">
                Nome <span className="text-muted-foreground">(opcional)</span>
              </Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="customerContact">
                Telefone ou e-mail <span className="text-muted-foreground">(opcional)</span>
              </Label>
              <Input
                id="customerContact"
                value={customerContact}
                onChange={(e) => setCustomerContact(e.target.value)}
              />
            </div>
          </div>
          <Button type="submit" size="lg" className="h-13 text-base" disabled={submitting}>
            {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
            Enviar feedback
          </Button>
        </form>
      ) : null}

      <p className="text-xs text-muted-foreground">
        Pesquisa de satisfação por{" "}
        <Link
          href="/"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Reputamax
        </Link>
      </p>
    </div>
  );
}
