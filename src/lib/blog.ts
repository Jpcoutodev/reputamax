import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/**
 * Camada de dados do blog. Os posts são arquivos .mdx em src/content/blog/.
 * O nome do arquivo (sem .mdx) é o slug da URL (/blog/<slug>).
 * Tudo roda em build time (SSG) — leitura de arquivo via fs.
 */

export const BLOG_DIR = path.join(process.cwd(), "src", "content", "blog");

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO (YYYY-MM-DD)
  author: string;
  keywords: string[];
  image?: string;
}

/** Slugs de todos os posts (nomes de arquivo .mdx, sem extensão). */
export function getPostSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string" && value.trim()) {
    return value.split(",").map((s) => s.trim());
  }
  return [];
}

/** Front-matter de um post (slug = nome do arquivo). null se não existir. */
export function getPostMeta(slug: string): PostMeta | null {
  const file = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  const { data } = matter(fs.readFileSync(file, "utf8"));

  const dateValue = data.date instanceof Date
    ? data.date.toISOString().slice(0, 10)
    : String(data.date ?? "");

  return {
    slug,
    title: String(data.title ?? slug),
    description: String(data.description ?? ""),
    date: dateValue,
    author: String(data.author ?? "Equipe Reputamax"),
    keywords: toStringArray(data.keywords),
    image: data.image ? String(data.image) : undefined,
  };
}

/** Todos os posts ordenados por data (mais recente primeiro). */
export function getAllPosts(): PostMeta[] {
  return getPostSlugs()
    .map(getPostMeta)
    .filter((p): p is PostMeta => p !== null)
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** Data formatada em pt-BR (ex.: 16 de junho de 2026). */
export function formatPostDate(date: string): string {
  const d = new Date(`${date}T12:00:00`);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}
