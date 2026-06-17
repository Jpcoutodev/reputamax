"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

// ID público do Pixel (pode ser sobrescrito por env). Não é segredo — fica
// exposto no navegador de qualquer forma.
export const FB_PIXEL_ID =
  process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || "1238324344952351";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/** Dispara um evento padrão do Pixel com segurança (no-op se o Pixel não carregou). */
export function fbqTrack(event: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", event, params);
  }
}

/**
 * Dispara um evento já com Advanced Matching (nome/telefone) — melhora a
 * atribuição. O próprio Pixel normaliza e faz o hash dos dados no cliente.
 */
export function fbqTrackWithMatch(
  event: string,
  userData: { firstName?: string; phone?: string },
  params?: Record<string, unknown>
) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;

  const match: Record<string, string> = {};
  if (userData.firstName?.trim()) {
    match.fn = userData.firstName.trim().toLowerCase();
  }
  if (userData.phone) {
    const digits = userData.phone.replace(/\D/g, "");
    // garante código do país (Brasil = 55) para o match telefônico
    match.ph = digits.startsWith("55") ? digits : `55${digits}`;
  }
  if (Object.keys(match).length > 0) {
    // re-init com os dados do usuário atualiza o Advanced Matching;
    // com autoConfig=false não dispara nenhum evento extra
    window.fbq("init", FB_PIXEL_ID, match);
  }
  window.fbq("track", event, params);
}

/**
 * Pixel do Meta (Facebook). Carrega o script base e registra PageView,
 * inclusive nas navegações client-side (SPA) via mudança de rota.
 */
export function FacebookPixel() {
  const pathname = usePathname();
  const firstLoad = useRef(true);

  useEffect(() => {
    // o PageView inicial já é disparado pelo script base; aqui só os
    // PageViews das navegações client-side (troca de rota)
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }
    if (typeof window !== "undefined" && typeof window.fbq === "function") {
      window.fbq("track", "PageView");
    }
  }, [pathname]);

  if (!FB_PIXEL_ID) return null;

  return (
    <>
      <Script id="fb-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window,document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('set', 'autoConfig', false, '${FB_PIXEL_ID}');
        fbq('init', '${FB_PIXEL_ID}');
        fbq('track', 'PageView');`}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
