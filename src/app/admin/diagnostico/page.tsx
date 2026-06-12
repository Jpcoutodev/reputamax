"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileSearch, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { BusinessSearch } from "@/components/diagnostico/business-search";
import type { BusinessSearchResult } from "@/lib/providers/types";

export default function AdminDiagnosticoPage() {
  const router = useRouter();
  const [analyzing, setAnalyzing] = useState<string | null>(null);

  async function handleSelect(business: BusinessSearchResult) {
    setAnalyzing(business.name);
    try {
      const createRes = await fetch("/api/diagnostico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placeId: business.placeId }),
      });
      if (!createRes.ok) throw new Error(`create ${createRes.status}`);
      const { id } = await createRes.json();

      const analyzeRes = await fetch(`/api/diagnostico/${id}/analyze`, { method: "POST" });
      if (!analyzeRes.ok) throw new Error(`analyze ${analyzeRes.status}`);

      router.push(`/admin/crm/${id}`);
    } catch (err) {
      console.error("[admin/diagnostico]:", err);
      setAnalyzing(null);
      toast.error("Não foi possível gerar o diagnóstico. Tente de novo.");
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-medium tracking-tight">Gerar diagnóstico</h1>
        <p className="text-sm text-muted-foreground">
          Busque qualquer empresa do Google, gere a análise com IA e baixe o PDF
          para enviar — a mesma análise que o cliente vê na landing page.
        </p>
      </div>

      {analyzing ? (
        <Card className="rounded-xl border shadow-none">
          <CardContent className="flex flex-col items-center gap-4 p-12 text-center">
            <Loader2 className="size-8 animate-spin text-primary" />
            <div>
              <p className="font-medium">Analisando {analyzing}…</p>
              <p className="text-sm text-muted-foreground">
                Buscando avaliações, comparando concorrentes e gerando a análise
                com IA. Leva uns 20 segundos.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mx-auto w-full max-w-2xl">
            <BusinessSearch variant="inline" autoFocus onSelect={handleSelect} />
          </div>

          <Card className="mx-auto w-full max-w-2xl rounded-xl border bg-surface shadow-none">
            <CardContent className="flex items-start gap-3 p-5">
              <FileSearch className="mt-0.5 size-5 shrink-0 text-primary" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Como usar na prospecção</p>
                <p>
                  Gere o diagnóstico do prospect, baixe o PDF e envie por WhatsApp
                  ou e-mail. O registro entra automaticamente no CRM na fase
                  &ldquo;Diagnóstico&rdquo; — depois é só atualizar a fase conforme a
                  conversa avança.
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
