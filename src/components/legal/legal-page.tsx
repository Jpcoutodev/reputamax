interface LegalPageProps {
  title: string;
  updatedAt: string;
  children: React.ReactNode;
}

/** Moldura de leitura para páginas legais — tipografia consistente e legível. */
export function LegalPage({ title, updatedAt, children }: LegalPageProps) {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-16">
      <header className="flex flex-col gap-2 border-b pb-6">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">
          Última atualização: {updatedAt}
        </p>
      </header>
      <div
        className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-muted-foreground [&_a]:text-primary [&_a]:underline-offset-4 hover:[&_a]:underline [&_h2]:mt-4 [&_h2]:font-heading [&_h2]:text-lg [&_h2]:font-medium [&_h2]:text-foreground [&_li]:ml-1 [&_strong]:text-foreground [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-1.5 [&_ul]:pl-5"
      >
        {children}
      </div>
    </article>
  );
}
