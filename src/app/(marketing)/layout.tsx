import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { MarketingMobileMenu } from "@/components/marketing/mobile-menu";
import { WhatsAppButton } from "@/components/marketing/whatsapp-button";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-[1100px] items-center justify-between px-4">
          <Logo landscape />
          {/* desktop: botões inline */}
          <nav className="hidden items-center gap-1 sm:flex">
            <Button variant="ghost" render={<Link href="/blog" />}>
              Blog
            </Button>
            <Button variant="ghost" render={<Link href="/login" />}>
              Entrar
            </Button>
            <Button render={<Link href="/diagnostico" />} className="ml-1">
              Diagnóstico grátis
            </Button>
          </nav>
          {/* mobile: menu sanduíche */}
          <div className="sm:hidden">
            <MarketingMobileMenu />
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border/50 bg-surface">
        <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <Logo landscape className="text-base" />
            <p>Gestão ativa de reputação para negócios locais brasileiros.</p>
            <a
              href="mailto:contato@reputamax.app"
              className="underline-offset-4 hover:text-foreground hover:underline"
            >
              contato@reputamax.app
            </a>
          </div>
          <div className="flex flex-col gap-1 sm:items-end">
            <div className="flex gap-4">
              <Link
                href="/privacidade"
                className="underline-offset-4 hover:text-foreground hover:underline"
              >
                Política de Privacidade
              </Link>
              <Link
                href="/termos"
                className="underline-offset-4 hover:text-foreground hover:underline"
              >
                Termos de Uso
              </Link>
            </div>
            <p>© 2026 Reputamax</p>
          </div>
        </div>
      </footer>
      <WhatsAppButton />
    </div>
  );
}
