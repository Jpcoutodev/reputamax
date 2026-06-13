import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const alt = siteConfig.ogImageAlt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Imagem de compartilhamento (OG/Twitter) gerada com a identidade da marca. */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #1a1a2e 0%, #2d2d5a 100%)",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "#4F46E5",
              color: "#fff",
              fontSize: 36,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            R
          </div>
          <div style={{ color: "#fff", fontSize: 36, fontWeight: 600 }}>Reputamax</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              color: "#fff",
              fontSize: 60,
              fontWeight: 700,
              lineHeight: 1.1,
              maxWidth: 820,
            }}
          >
            Sua reputação no Google trabalhando para atrair clientes
          </div>
          <div style={{ color: "#a5a5b8", fontSize: 30, maxWidth: 760 }}>
            Diagnóstico gratuito em 30 segundos · página de avaliação inteligente · respostas com IA
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "#4F46E5",
              color: "#fff",
              fontSize: 26,
              fontWeight: 600,
              padding: "16px 32px",
              borderRadius: 14,
            }}
          >
            Fazer diagnóstico grátis
          </div>
          <div style={{ color: "#a5a5b8", fontSize: 24 }}>reputamax.app</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
