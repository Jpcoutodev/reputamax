import Link from "next/link";
import { Logo } from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { BottomNav, SidebarNav } from "@/components/app-shell/nav";
import { LogoutButton } from "@/components/app-shell/logout-button";
import { getCurrentBusiness, trialDaysLeft } from "@/lib/data/business";

const planLabels: Record<string, string> = {
  trial: "Trial gratuito",
  essencial: "Plano Essencial",
  pro: "Plano Pro",
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const business = await getCurrentBusiness();
  const daysLeft = trialDaysLeft(business);
  const isTrial = business.plan === "trial";
  const planLabel = planLabels[business.plan] ?? business.plan;

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
                {planLabel}
              </span>
              {isTrial ? (
                <span className="text-xs text-muted-foreground">
                  {daysLeft} dia{daysLeft === 1 ? "" : "s"} restante{daysLeft === 1 ? "" : "s"}
                </span>
              ) : null}
            </div>
            <Badge>Ver planos</Badge>
          </Link>
          <LogoutButton />
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
              {isTrial ? `Trial · ${daysLeft} dias restantes` : planLabel}
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
