"use client";

import { useState } from "react";
import { Check, Clock } from "lucide-react";
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

const plans = [
  {
    id: "essencial",
    name: "Essencial",
    price: "R$ 97",
    description: "Para começar a coletar avaliações no piloto automático.",
    features: [
      "Página de avaliação com filtro inteligente",
      "QR code pronto pra imprimir (PNG e PDF)",
      "Dashboard de reputação",
      "Feedbacks negativos interceptados",
    ],
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "R$ 197",
    description: "Para dominar a reputação da sua região.",
    features: [
      "Tudo do Essencial",
      "Respostas sugeridas por IA",
      "Comparação com concorrentes",
      "Relatórios mensais automáticos",
    ],
    highlight: true,
  },
];

export default function PlanosPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-medium tracking-tight">Planos</h1>
        <p className="text-sm text-muted-foreground">
          Você está no trial gratuito — 11 dias restantes. Escolha um plano para
          continuar depois.
        </p>
      </div>

      <div className="grid max-w-3xl gap-6 md:grid-cols-2">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative rounded-xl shadow-none ${
              plan.highlight ? "border-2 border-primary" : "border"
            }`}
          >
            {plan.highlight ? (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                Mais popular
              </Badge>
            ) : null}
            <CardContent className="flex h-full flex-col gap-5 p-8">
              <div className="flex flex-col gap-1">
                <h2 className="font-medium">{plan.name}</h2>
                <p className="text-3xl font-medium">
                  {plan.price}
                  <span className="text-base text-muted-foreground">/mês</span>
                </p>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>
              <ul className="flex flex-1 flex-col gap-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-success" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.highlight ? "default" : "outline"}
                onClick={() => setModalOpen(true)}
              >
                Assinar {plan.name}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Sem fidelidade. Cancele quando quiser direto pelo painel.
      </p>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="size-5 text-primary" />
              Pagamentos em breve
            </DialogTitle>
            <DialogDescription>
              Você está no trial gratuito e não precisa pagar nada agora. Quando
              os pagamentos forem liberados, avisaremos por e-mail com
              antecedência.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setModalOpen(false)}>Entendi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
