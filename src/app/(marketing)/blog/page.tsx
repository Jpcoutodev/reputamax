import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatPostDate, getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog — reputação no Google para negócios locais",
  description:
    "Guias e dicas práticas para conseguir mais avaliações no Google, responder críticas e fazer sua nota subir. Conteúdo do Reputamax para donos de negócios locais.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16">
      <header className="flex flex-col gap-3 border-b pb-8">
        <span className="text-sm font-medium text-primary">Blog</span>
        <h1 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
          Reputação no Google, na prática
        </h1>
        <p className="text-lg text-muted-foreground">
          Guias e dicas para conseguir mais avaliações, responder críticas e fazer
          sua nota subir.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          Nenhum artigo publicado ainda. Em breve!
        </p>
      ) : (
        <ul className="mt-8 flex flex-col divide-y">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="group flex flex-col gap-2 py-6 transition-opacity hover:opacity-80"
              >
                <time
                  dateTime={post.date}
                  className="text-sm text-muted-foreground"
                >
                  {formatPostDate(post.date)}
                </time>
                <h2 className="font-heading text-xl font-bold tracking-tight">
                  {post.title}
                </h2>
                <p className="text-muted-foreground">{post.description}</p>
                <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  Ler artigo
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
