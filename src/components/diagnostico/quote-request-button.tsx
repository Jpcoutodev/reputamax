"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fbqTrack } from "@/components/analytics/facebook-pixel";

interface QuoteRequestButtonProps {
  diagnosticoId: string;
}

export function QuoteRequestButton({ diagnosticoId }: QuoteRequestButtonProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [segment, setSegment] = useState("");
  const [storeCount, setStoreCount] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2 || company.trim().length < 1) {
      toast.error("Preencha pelo menos nome e empresa.");
      return;
    }
    if (whatsapp.replace(/\D/g, "").length < 10) {
      toast.error("Digite um WhatsApp válido com DDD.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/orcamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          company: company.trim(),
          whatsapp: whatsapp.trim(),
          segment: segment.trim() || undefined,
          storeCount: storeCount ? Number(storeCount.replace(/\D/g, "")) : undefined,
          diagnosticoId,
        }),
      });
      if (!res.ok) {
        toast.error("Não foi possível enviar. Tente de novo em instantes.");
        return;
      }
      // Pixel: o Lead só é contabilizado no pedido de orçamento (fundo de funil)
      fbqTrack("Lead", {
        content_name: "Orçamento de implantação",
        content_category: segment.trim() || undefined,
        num_stores: storeCount ? Number(storeCount.replace(/\D/g, "")) : undefined,
      });
      setDone(true);
    } catch {
      toast.error("Falha de conexão. Tente de novo.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      // reseta ao fechar
      setTimeout(() => {
        setDone(false);
        setName("");
        setCompany("");
        setWhatsapp("");
        setSegment("");
        setStoreCount("");
      }, 200);
    }
  }

  return (
    <>
      <Button
        size="lg"
        className="h-auto whitespace-normal py-3 text-center leading-tight"
        onClick={() => setOpen(true)}
      >
        Solicitar orçamento de implantação
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          {done ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle2 className="size-12 text-success" />
              <DialogTitle>Pedido recebido!</DialogTitle>
              <DialogDescription>
                Recebemos sua solicitação de orçamento. Nossa equipe vai entrar em
                contato em breve para apresentar a proposta de implantação.
              </DialogDescription>
              <Button className="mt-2" onClick={() => handleOpenChange(false)}>
                Fechar
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Solicitar orçamento de implantação</DialogTitle>
                <DialogDescription>
                  Conte um pouco sobre o seu negócio que preparamos uma proposta sob
                  medida.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="q-name">Seu nome</Label>
                  <Input
                    id="q-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Maria Souza"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="q-company">Empresa</Label>
                  <Input
                    id="q-company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Nome da sua empresa"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="q-whatsapp">WhatsApp</Label>
                  <Input
                    id="q-whatsapp"
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="(11) 99999-8888"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="q-segment">Segmento</Label>
                  <Input
                    id="q-segment"
                    value={segment}
                    onChange={(e) => setSegment(e.target.value)}
                    placeholder="Ex.: restaurante, clínica, varejo…"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="q-stores">Quantidade de lojas</Label>
                  <Input
                    id="q-stores"
                    type="number"
                    min={1}
                    inputMode="numeric"
                    value={storeCount}
                    onChange={(e) => setStoreCount(e.target.value)}
                    placeholder="Ex.: 1"
                  />
                </div>
                <Button type="submit" size="lg" disabled={submitting}>
                  {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
                  Enviar pedido de orçamento
                </Button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
