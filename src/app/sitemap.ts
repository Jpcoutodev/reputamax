import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Sitemap com as rotas PÚBLICAS e indexáveis. Áreas logadas (/dashboard, /admin),
 * páginas de diagnóstico por id e a página pública de avaliação (/r) ficam de fora
 * — são privadas ou noindex.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    {
      url: `${SITE_URL}/diagnostico`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/cadastro`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/login`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
