"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  LayoutDashboard,
  MessageSquareWarning,
  QrCode,
  Settings,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const navItems = [
  { href: "/dashboard", label: "Dashboard", shortLabel: "Início", icon: LayoutDashboard },
  { href: "/avaliacoes", label: "Avaliações", shortLabel: "Avaliações", icon: Star },
  { href: "/feedbacks", label: "Feedbacks", shortLabel: "Feedbacks", icon: MessageSquareWarning },
  { href: "/pagina-avaliacao", label: "Página de avaliação", shortLabel: "Página", icon: QrCode },
  { href: "/concorrentes", label: "Concorrentes", shortLabel: "Rivais", icon: BarChart3 },
  { href: "/configuracoes", label: "Configurações", shortLabel: "Ajustes", icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1" aria-label="Navegação principal">
      {navItems.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
            )}
          >
            <item.icon className="size-4.5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex border-t bg-background md:hidden"
      aria-label="Navegação principal"
    >
      {navItems.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px]",
              active ? "text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon className="size-5" />
            {item.shortLabel}
          </Link>
        );
      })}
    </nav>
  );
}
