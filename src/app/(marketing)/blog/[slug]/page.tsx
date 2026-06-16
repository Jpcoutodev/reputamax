import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { formatPostDate, getPostMeta, getPostSlugs } from "@/lib/blog";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// SSG: gera as páginas em build time; rota fora da lista = 404
export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostMeta(slug);
  if (!post) return {};

  const url = absoluteUrl(`/blog/${slug}`);
  const images = post.image ? [absoluteUrl(post.image)] : undefined;

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    authors: [{ name: post.author }],
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      authors: [post.author],
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      ...(images ? { images } : {}),
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostMeta(slug);
  if (!post) notFound();

  // import dinâmico do MDX (suporte nativo @next/mdx); aplica mdx-components
  const { default: Post } = await import(`@/content/blog/${slug}.mdx`);

  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: { "@type": "Organization", name: post.author },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: { "@type": "ImageObject", url: absoluteUrl("/logo.png") },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(`/blog/${slug}`) },
    ...(post.image ? { image: absoluteUrl(post.image) } : {}),
  };

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-16">
      <JsonLd data={blogPostingSchema} />

      <Link
        href="/blog"
        className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Voltar ao blog
      </Link>

      <header className="flex flex-col gap-3 border-b pb-8">
        <span className="text-sm font-medium text-primary">Blog</span>
        <h1 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
          {post.title}
        </h1>
        <p className="text-lg text-muted-foreground">{post.description}</p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{post.author}</span>
          <span aria-hidden>·</span>
          <time dateTime={post.date}>{formatPostDate(post.date)}</time>
        </div>
      </header>

      {post.image && (
        <div className="mt-8 overflow-hidden rounded-xl">
          <Image
            src={post.image}
            alt={post.title}
            width={1200}
            height={630}
            className="h-auto w-full object-cover"
            priority
          />
        </div>
      )}

      <div className="mt-8">
        <Post />
      </div>

      <div className="mt-12 rounded-xl border bg-surface p-6 text-center">
        <p className="font-heading text-lg font-semibold">
          Quer ver como está a reputação do seu negócio no Google?
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Faça um diagnóstico gratuito em 30 segundos.
        </p>
        <Link
          href="/diagnostico"
          className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Fazer diagnóstico grátis
        </Link>
      </div>
    </article>
  );
}
