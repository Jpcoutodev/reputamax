import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** Libera o público e bloqueia áreas privadas/transacionais e API. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/dashboard",
        "/avaliacoes",
        "/feedbacks",
        "/pagina-avaliacao",
        "/concorrentes",
        "/configuracoes",
        "/planos",
        "/api/",
        "/auth/",
        "/r/", // páginas de avaliação são privadas por negócio
        "/diagnostico/", // diagnósticos por id (sub-rotas) não devem indexar
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
