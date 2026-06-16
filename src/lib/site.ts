/**
 * Configuração central do site — fonte única para SEO (metadata, sitemap,
 * robots, JSON-LD). Importável em server e client.
 */

const RAW_URL = process.env.NEXT_PUBLIC_APP_URL;

/**
 * URL canônica de produção. Artefatos de SEO (canonical, sitemap, OG) precisam
 * SEMPRE apontar para o domínio real — nunca localhost. Por isso ignoramos o
 * env quando ele aponta para localhost.
 */
export const SITE_URL =
  RAW_URL && !RAW_URL.includes("localhost") ? RAW_URL.replace(/\/$/, "") : "https://reputamax.app";

export const siteConfig = {
  name: "Reputamax",
  url: SITE_URL,
  locale: "pt_BR",
  title: "Reputamax — Gestão ativa de reputação no Google para negócios locais",
  shortTitle: "Reputamax",
  description:
    "Transforme avaliações do Google em uma máquina de atrair clientes. Diagnóstico gratuito da sua reputação, página de avaliação inteligente, QR code e respostas com IA. Colete avaliações de todos os clientes e veja sua nota subir. 14 dias grátis, sem cartão.",
  // descrição curta para OG/Twitter
  ogDescription:
    "Descubra em 30 segundos como está a reputação do seu negócio no Google. Diagnóstico gratuito, página de avaliação inteligente e respostas com IA.",
  keywords: [
    "reputação no Google",
    "gestão de reputação",
    "avaliações do Google",
    "avaliações Google meu negócio",
    "como melhorar nota no Google",
    "aumentar avaliações Google",
    "responder avaliações com IA",
    "QR code avaliação Google",
    "marketing para negócios locais",
    "Google Meu Negócio",
    "reputação online",
    "pesquisa de satisfação",
  ],
  twitter: "@reputamax",
  ogImageAlt: "Reputamax — gestão ativa de reputação no Google",
} as const;

export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
