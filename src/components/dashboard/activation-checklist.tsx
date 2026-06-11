"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "reputamax_onboarding_steps";

interface StepState {
  perfil: boolean;
  pagina: boolean;
  qr: boolean;
  primeiras: boolean;
}

const defaultSteps: StepState = { perfil: false, pagina: false, qr: false, primeiras: false };

interface ChecklistProps {
  slug: string;
  businessName: string;
}

export function ActivationChecklist({ slug, businessName }: ChecklistProps) {
  const [steps, setSteps] = useState<StepState>(defaultSteps);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSteps({ ...defaultSteps, ...JSON.parse(raw) });
    } catch {
      // estado corrompido: recomeça do zero
    }
    setLoaded(true);
  }, []);

  function update(partial: Partial<StepState>) {
    setSteps((prev) => {
      const next = { ...prev, ...partial };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  async function copyWhatsappMessage() {
    const link = `${window.location.origin}/r/${slug}`;
    const message =
      `Oi! Aqui é da ${businessName} 😊 Sua opinião vale muito pra gente. ` +
      `Pode contar como foi sua experiência? Leva menos de 1 minuto: ${link}`;
    await navigator.clipboard.writeText(message);
    update({ primeiras: true });
    toast.success("Mensagem copiada! Cole no WhatsApp dos seus clientes.");
  }

  const items = [
    {
      key: "perfil" as const,
      label: "Confirme os dados do seu negócio",
      href: "/configuracoes",
    },
    {
      key: "pagina" as const,
      label: "Personalize sua página de avaliação",
      href: "/pagina-avaliacao",
    },
    {
      key: "qr" as const,
      label: "Baixe e posicione seu QR code",
      href: "/pagina-avaliacao",
    },
  ];

  const done = Object.values(steps).filter(Boolean).length;
  const total = 4;

  if (!loaded || done === total) return null;

  return (
    <Card className="rounded-xl border shadow-none">
      <CardContent className="flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-medium">Ative sua máquina de avaliações</h2>
            <p className="text-sm text-muted-foreground">
              {done} de {total} passos concluídos
            </p>
          </div>
          <div className="w-28">
            <Progress value={(done / total) * 100} className="h-2" />
          </div>
        </div>

        <ul className="flex flex-col gap-2">
          {items.map((item, i) => (
            <li key={item.key}>
              <Link
                href={item.href}
                onClick={() => update({ [item.key]: true } as Partial<StepState>)}
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors hover:border-primary",
                  steps[item.key] && "opacity-60"
                )}
              >
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                    steps[item.key]
                      ? "bg-success text-white"
                      : "bg-accent text-accent-foreground"
                  )}
                >
                  {steps[item.key] ? <Check className="size-3.5" /> : i + 1}
                </span>
                <span className={cn(steps[item.key] && "line-through")}>{item.label}</span>
                <ArrowRight className="ml-auto size-4 text-muted-foreground" />
              </Link>
            </li>
          ))}
          <li>
            <div
              className={cn(
                "flex flex-wrap items-center gap-3 rounded-lg border px-4 py-3 text-sm",
                steps.primeiras && "opacity-60"
              )}
            >
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                  steps.primeiras ? "bg-success text-white" : "bg-accent text-accent-foreground"
                )}
              >
                {steps.primeiras ? <Check className="size-3.5" /> : 4}
              </span>
              <span className={cn(steps.primeiras && "line-through")}>
                Peça suas 3 primeiras avaliações
              </span>
              <Button
                size="sm"
                variant="outline"
                className="ml-auto"
                onClick={copyWhatsappMessage}
              >
                <Copy className="size-3.5" />
                Copiar mensagem pronta
              </Button>
            </div>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}
