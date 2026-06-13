import { siteConfig, SITE_URL, absoluteUrl } from "./site";
import { faqs } from "./landing-content";

/**
 * Builders de JSON-LD (schema.org) para SEO rich results.
 * Renderizados na landing via <JsonLd />.
 */

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: siteConfig.name,
    url: SITE_URL,
    logo: absoluteUrl("/logo.png"),
    description: siteConfig.description,
    slogan: "Gestão ativa de reputação para negócios locais",
    areaServed: { "@type": "Country", name: "Brasil" },
    sameAs: [] as string[],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: siteConfig.name,
    description: siteConfig.description,
    inLanguage: "pt-BR",
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

export function softwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.name,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: SITE_URL,
    description: siteConfig.description,
    inLanguage: "pt-BR",
    offers: [
      {
        "@type": "Offer",
        name: "Plano Essencial",
        price: "97.00",
        priceCurrency: "BRL",
        description: "Página de avaliação inteligente, QR code e dashboard de reputação.",
        category: "Subscription",
      },
      {
        "@type": "Offer",
        name: "Plano Pro",
        price: "197.00",
        priceCurrency: "BRL",
        description:
          "Tudo do Essencial mais respostas com IA, comparação com concorrentes e relatórios mensais.",
        category: "Subscription",
      },
    ],
  };
}

export function faqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

/** Todos os schemas da landing num único grafo. */
export function landingSchemas() {
  return [
    organizationSchema(),
    websiteSchema(),
    softwareApplicationSchema(),
    faqSchema(),
  ];
}
