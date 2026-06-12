import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/logo";
import { AdminNav } from "@/components/admin/admin-nav";
import { LogoutButton } from "@/components/app-shell/logout-button";
import { requireAdmin } from "@/lib/data/admin";

export const metadata = { title: { default: "Admin", template: "%s | Reputamax Admin" } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col bg-navy p-4 md:flex print:!hidden">
        <div className="flex items-center gap-2 px-2 py-2">
          <Logo href="/admin" dark className="text-base" />
          <Badge variant="secondary" className="bg-white/10 text-white">
            Admin
          </Badge>
        </div>
        <div className="mt-6 flex-1">
          <AdminNav />
        </div>
        <div className="flex flex-col gap-2 border-t border-white/10 pt-4">
          <p className="truncate px-3 text-xs text-white/50">{admin.email}</p>
          <div className="[&_button]:text-white/60 [&_button:hover]:text-white">
            <LogoutButton />
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b bg-background px-4 md:hidden print:hidden">
          <Logo href="/admin" className="text-base" />
          <Badge variant="secondary" className="bg-accent text-accent-foreground">
            Admin
          </Badge>
        </header>
        <main className="mx-auto w-full max-w-[1100px] flex-1 px-4 py-8 md:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
