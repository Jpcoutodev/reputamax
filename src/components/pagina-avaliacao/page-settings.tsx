"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download, ExternalLink, FileText, Loader2, Trash2, Upload } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ReviewFunnel } from "@/components/review-funnel/funnel";
import { LogoCropper } from "@/components/pagina-avaliacao/logo-cropper";
import { updatePageSettings } from "@/app/(app)/actions";

interface PageSettingsProps {
  slug: string;
  businessName: string;
  initialWelcomeMessage: string;
  initialReviewLink: string;
  initialLogoUrl: string | null;
  persisted: boolean;
}

export function PageSettings({
  slug,
  businessName,
  initialWelcomeMessage,
  initialReviewLink,
  initialLogoUrl,
  persisted,
}: PageSettingsProps) {
  const [welcomeMessage, setWelcomeMessage] = useState(initialWelcomeMessage);
  const [reviewLink, setReviewLink] = useState(initialReviewLink);
  const [logoUrl, setLogoUrl] = useState<string | null>(initialLogoUrl);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [publicUrl, setPublicUrl] = useState(`https://reputamax.app/r/${slug}`);

  useEffect(() => {
    // Evitar setState síncrono no primeiro render para não engatilhar lint
    const timer = setTimeout(() => {
      setPublicUrl(`${window.location.origin}/r/${slug}`);
    }, 0);
    return () => clearTimeout(timer);
  }, [slug]);

  useEffect(() => {
    QRCode.toDataURL(publicUrl, { width: 480, margin: 2, color: { dark: "#16161D" } })
      .then(setQrDataUrl)
      .catch(() => toast.error("Não foi possível gerar o QR code. Recarregue a página."));
  }, [publicUrl]);

  async function handleSave() {
    setSaving(true);
    const result = await updatePageSettings({
      welcomeMessage: welcomeMessage.trim(),
      reviewLink: reviewLink.trim(),
    });
    setSaving(false);
    if (!result.ok) {
      toast.error(result.error ?? "Não foi possível salvar. Tente de novo.");
      return;
    }
    toast.success(
      result.demo
        ? "Configurações salvas (modo demonstração)."
        : "Configurações salvas! Sua página pública já está atualizada."
    );
  }

  function handleLogoSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite reenviar o mesmo arquivo
    if (!file) return;

    if (!persisted) {
      toast.info("O upload de logo funciona com o Supabase configurado.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Imagem muito grande (máx. 2 MB).");
      return;
    }

    // abre o recorte quadrado antes de enviar
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleCroppedUpload(blob: Blob) {
    setUploadingLogo(true);
    try {
      const body = new FormData();
      body.append("file", new File([blob], "logo.png", { type: "image/png" }));
      const res = await fetch("/api/upload-logo", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Não foi possível enviar a logo.");
        return;
      }
      setLogoUrl(data.url);
      setCropSrc(null);
      toast.success("Logo enviada! Já aparece na sua página de avaliação.");
    } catch {
      toast.error("Falha no upload. Verifique sua conexão e tente de novo.");
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleRemoveLogo() {
    if (!persisted) {
      setLogoUrl(null);
      return;
    }
    setUploadingLogo(true);
    try {
      const res = await fetch("/api/upload-logo", { method: "DELETE" });
      if (!res.ok) {
        toast.error("Não foi possível remover a logo.");
        return;
      }
      setLogoUrl(null);
      toast.success("Logo removida.");
    } finally {
      setUploadingLogo(false);
    }
  }

  function downloadPng() {
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `qrcode-${slug}.png`;
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
  <title>QR code — ${businessName}</title>
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
    <h1>${businessName}</h1>
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
    () => `${welcomeMessage}|${reviewLink}|${logoUrl ?? ""}`,
    [welcomeMessage, reviewLink]
  );

  return (
    <>
    <LogoCropper
      src={cropSrc}
      saving={uploadingLogo}
      onCancel={() => setCropSrc(null)}
      onCropped={handleCroppedUpload}
    />
    <div className="grid items-start gap-6 lg:grid-cols-2">
      {/* Configuração */}
      <div className="flex flex-col gap-6">
        <Card className="rounded-xl border shadow-none">
          <CardContent className="flex flex-col gap-5 p-6">
            <h2 className="font-medium">Personalização</h2>

            <div className="flex flex-col gap-1.5">
              <Label>Logo do negócio</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
                onChange={handleLogoSelected}
              />
              <div className="flex items-center gap-3">
                <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-surface">
                  {logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoUrl}
                      alt="Logo do negócio"
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-medium text-muted-foreground">
                      {businessName.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    type="button"
                    disabled={uploadingLogo}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploadingLogo ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Upload className="size-4" />
                    )}
                    {logoUrl ? "Trocar logo" : "Enviar logo"}
                  </Button>
                  {logoUrl ? (
                    <Button
                      variant="ghost"
                      type="button"
                      className="text-danger hover:text-danger"
                      disabled={uploadingLogo}
                      onClick={handleRemoveLogo}
                    >
                      <Trash2 className="size-4" />
                      Remover
                    </Button>
                  ) : null}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, WEBP ou SVG, até 2 MB. Você recorta no formato quadrado ao enviar.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="welcome">Mensagem de boas-vindas</Label>
              <Input
                id="welcome"
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                placeholder="Como foi sua experiência?"
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

            <div>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="size-4 animate-spin" /> : null}
                Salvar alterações
              </Button>
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
                  alt={`QR code da página de avaliação de ${businessName}`}
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
                href={`/r/${slug}`}
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
              render={<Link href={`/r/${slug}`} target="_blank" />}
            >
              <ExternalLink className="size-4" />
              Abrir página
            </Button>
          </div>
          <div className="flex justify-center rounded-xl bg-surface p-6">
            <ReviewFunnel
              key={previewKey}
              slug={slug}
              businessName={businessName}
              welcomeMessage={welcomeMessage || undefined}
              reviewLink={reviewLink || undefined}
              logoUrl={logoUrl || undefined}
              previewMode
            />
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
