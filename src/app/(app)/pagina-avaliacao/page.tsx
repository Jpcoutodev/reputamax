"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Download, ExternalLink, FileText, Upload } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ReviewFunnel } from "@/components/review-funnel/funnel";
import { getDemoBusiness } from "@/lib/mock-data/app-data";

export default function PaginaAvaliacaoPage() {
  const business = getDemoBusiness();
  const [welcomeMessage, setWelcomeMessage] = useState("Como foi sua experiência?");
  const [reviewLink, setReviewLink] = useState(
    `https://search.google.com/local/writereview?placeid=${business.placeId}`
  );
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [publicUrl, setPublicUrl] = useState(`https://reputamax.app/r/${business.slug}`);

  useEffect(() => {
    setPublicUrl(`${window.location.origin}/r/${business.slug}`);
  }, [business.slug]);

  useEffect(() => {
    QRCode.toDataURL(publicUrl, { width: 480, margin: 2, color: { dark: "#16161D" } })
      .then(setQrDataUrl)
      .catch(() => toast.error("Não foi possível gerar o QR code. Recarregue a página."));
  }, [publicUrl]);

  function downloadPng() {
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `qrcode-${business.slug}.png`;
    a.click();
    toast.success("QR code baixado! Imprima e posicione no balcão.");
  }

  function downloadPdf() {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Libere pop-ups para baixar o PDF.");
      return;
    }
    printWindow.document.write(`<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>QR code — ${business.name}</title>
  <style>
    @page { size: A6; margin: 0; }
    body { margin: 0; font-family: Inter, system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .card { text-align: center; padding: 24px; }
    h1 { font-size: 18px; font-weight: 500; margin: 0 0 4px; color: #16161D; }
    p { font-size: 13px; color: #6b7280; margin: 0 0 16px; }
    img { width: 220px; height: 220px; }
    footer { font-size: 10px; color: #9ca3af; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${business.name}</h1>
    <p>Avalie sua experiência — leva 30 segundos</p>
    <img src="${qrDataUrl}" alt="QR code de avaliação" />
    <footer>Pesquisa de satisfação por Reputamax</footer>
  </div>
  <script>window.onload = () => setTimeout(() => window.print(), 300);</script>
</body>
</html>`);
    printWindow.document.close();
  }

  const previewKey = useMemo(
    () => `${welcomeMessage}|${reviewLink}`,
    [welcomeMessage, reviewLink]
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-medium tracking-tight">Página de avaliação</h1>
        <p className="text-sm text-muted-foreground">
          É essa página que seus clientes veem ao escanear o QR code. Notas altas
          vão pro Google; críticas chegam só pra você.
        </p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        {/* Configuração */}
        <div className="flex flex-col gap-6">
          <Card className="rounded-xl border shadow-none">
            <CardContent className="flex flex-col gap-5 p-6">
              <h2 className="font-medium">Personalização</h2>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="logo">Logo do negócio</Label>
                <Button id="logo" variant="outline" className="justify-start" type="button"
                  onClick={() => toast.info("Upload de logo entra com o Supabase Storage (fase 2).")}>
                  <Upload className="size-4" />
                  Enviar imagem
                </Button>
                <p className="text-xs text-muted-foreground">
                  PNG ou JPG quadrado, até 1 MB.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="welcome">Mensagem de boas-vindas</Label>
                <Input
                  id="welcome"
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  maxLength={80}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="reviewLink">Link de avaliação do Google</Label>
                <Input
                  id="reviewLink"
                  value={reviewLink}
                  onChange={(e) => setReviewLink(e.target.value)}
                  placeholder="https://search.google.com/local/writereview?placeid=…"
                />
                <p className="text-xs text-muted-foreground">
                  No perfil da sua empresa no Google, toque em &ldquo;Pedir
                  avaliações&rdquo; e copie o link exibido. É pra lá que enviamos
                  os clientes satisfeitos.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border shadow-none">
            <CardContent className="flex flex-col gap-4 p-6">
              <h2 className="font-medium">Seu QR code</h2>
              <div className="flex flex-wrap items-center gap-6">
                {qrDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrDataUrl}
                    alt={`QR code da página de avaliação de ${business.name}`}
                    className="size-36 rounded-lg border p-2"
                  />
                ) : (
                  <div className="size-36 animate-pulse rounded-lg bg-muted" />
                )}
                <div className="flex flex-col gap-2">
                  <Button onClick={downloadPng} disabled={!qrDataUrl}>
                    <Download className="size-4" />
                    Baixar PNG
                  </Button>
                  <Button variant="outline" onClick={downloadPdf} disabled={!qrDataUrl}>
                    <FileText className="size-4" />
                    Baixar PDF pronto pra imprimir
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Aponta para{" "}
                <Link
                  href={`/r/${business.slug}`}
                  target="_blank"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {publicUrl}
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Preview ao vivo */}
        <Card className="rounded-xl border shadow-none lg:sticky lg:top-20">
          <CardContent className="flex flex-col gap-4 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">Preview ao vivo</h2>
              <Button
                variant="ghost"
                size="sm"
                render={<Link href={`/r/${business.slug}`} target="_blank" />}
              >
                <ExternalLink className="size-4" />
                Abrir página
              </Button>
            </div>
            <div className="flex justify-center rounded-xl bg-surface p-6">
              <ReviewFunnel
                key={previewKey}
                slug={business.slug}
                businessName={business.name}
                welcomeMessage={welcomeMessage}
                reviewLink={reviewLink || undefined}
                previewMode
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
