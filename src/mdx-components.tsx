import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Componentes globais do MDX — estiliza os elementos dos posts seguindo o
 * design system do site (font-heading nos títulos, cores e espaçamento).
 * Convenção do @next/mdx: aplicado automaticamente a todo conteúdo MDX.
 */
const components: MDXComponents = {
  h1: ({ className, ...props }) => (
    <h1
      className={cn(
        "mt-2 mb-4 font-heading text-3xl font-bold tracking-tight md:text-4xl",
        className
      )}
      {...props}
    />
  ),
  h2: ({ className, ...props }) => (
    <h2
      className={cn(
        "mt-10 mb-3 font-heading text-2xl font-bold tracking-tight",
        className
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }) => (
    <h3
      className={cn("mt-8 mb-2 font-heading text-xl font-semibold tracking-tight", className)}
      {...props}
    />
  ),
  p: ({ className, ...props }) => (
    <p className={cn("my-4 text-base leading-relaxed text-foreground/80", className)} {...props} />
  ),
  ul: ({ className, ...props }) => (
    <ul className={cn("my-4 flex list-disc flex-col gap-2 pl-6 text-foreground/80", className)} {...props} />
  ),
  ol: ({ className, ...props }) => (
    <ol className={cn("my-4 flex list-decimal flex-col gap-2 pl-6 text-foreground/80", className)} {...props} />
  ),
  li: ({ className, ...props }) => (
    <li className={cn("leading-relaxed", className)} {...props} />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={cn(
        "my-6 border-l-4 border-primary/40 bg-surface py-2 pl-5 pr-4 text-foreground/80 italic",
        className
      )}
      {...props}
    />
  ),
  a: ({ href, className, children, ...props }) => {
    const url = href ?? "#";
    const isExternal = /^https?:\/\//.test(url);
    const classes = cn(
      "font-medium text-primary underline-offset-4 hover:underline",
      className
    );
    if (isExternal) {
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className={classes} {...props}>
          {children}
        </a>
      );
    }
    return (
      <Link href={url} className={classes}>
        {children}
      </Link>
    );
  },
  img: ({ className, alt, ...props }) => (
    // conteúdo de post: src arbitrário e sem dimensões — img nativa com lazy
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt ?? ""}
      loading="lazy"
      className={cn("my-6 w-full rounded-xl border", className)}
      {...props}
    />
  ),
  hr: ({ className, ...props }) => (
    <hr className={cn("my-10 border-border", className)} {...props} />
  ),
  strong: ({ className, ...props }) => (
    <strong className={cn("font-semibold text-foreground", className)} {...props} />
  ),
  code: ({ className, ...props }) => (
    <code
      className={cn(
        "rounded-md bg-surface px-1.5 py-0.5 font-mono text-[0.85em] text-foreground",
        className
      )}
      {...props}
    />
  ),
  pre: ({ className, ...props }) => (
    <pre
      className={cn(
        "my-6 overflow-x-auto rounded-xl border bg-surface p-4 text-sm leading-relaxed",
        className
      )}
      {...props}
    />
  ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
