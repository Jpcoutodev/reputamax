import Link from "next/link";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BottomNav, SidebarNav } from "@/components/app-shell/nav";
import { getDemoBusiness } from "@/lib/mock-data/app-data";

const TRIAL_DAYS_LEFT = 11; // fase mock: cálculo real virá de businesses.trial_ends_at

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const business = getDemoBusiness();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar desktop */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r bg-sidebar p-4 md:flex">
        <Logo href="/dashboard" className="px-2 py-2" />
        <div className="mt-6 flex-1">
          <SidebarNav />
        </div>
        <div className="flex flex-col gap-3 border-t pt-4">
          <Link
            href="/planos"
            className="flex items-center justify-between rounded-lg bg-accent px-3 py-2.5 transition-colors hover:bg-accent/80"
          >
            <div className="flex flex-col">
              <span className="text-xs font-medium text-accent-foreground">
                Trial gratuito
              </span>
              <span className="text-xs text-muted-foreground">
                {TRIAL_DAYS_LEFT} dias restantes
              </span>
            </div>
            <Badge>Ver planos</Badge>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="justify-start text-muted-foreground"
            render={<Link href="/login" />}
          >
            <LogOut className="size-4" />
            Sair
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/90 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3 md:hidden">
            <Logo href="/dashboard" className="text-base" />
          </div>
          <p className="hidden text-sm text-muted-foreground md:block">
            {business.name}
          </p>
          <Link href="/planos" className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-accent text-accent-foreground">
              Trial · {TRIAL_DAYS_LEFT} dias restantes
            </Badge>
          </Link>
        </header>

        <main className="mx-auto w-full max-w-[1100px] flex-1 px-4 pb-24 pt-8 md:px-8 md:pb-12">
          {children}
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
