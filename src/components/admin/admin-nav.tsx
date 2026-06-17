"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FileSearch,
  FileText,
  Globe,
  LayoutDashboard,
  ScrollText,
  Settings,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/diagnostico", label: "Gerar diagnóstico", icon: FileSearch, exact: false },
  { href: "/admin/crm", label: "CRM", icon: Users, exact: false },
  { href: "/admin/orcamentos", label: "Pedidos de orçamento", icon: FileText, exact: false },
  { href: "/admin/landing", label: "Landing page", icon: Globe, exact: false },
  { href: "/admin/logs", label: "Logs de avaliação", icon: ScrollText, exact: false },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings, exact: false },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1" aria-label="Navegação do admin">
      {items.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-white/10 font-medium text-white"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon className="size-4.5" />
            {item.label}
          </Link>
        );
      })}
      <Link
        href="/dashboard"
        className="mt-4 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white"
      >
        <BarChart3 className="size-4.5" />
        Ver app do cliente
      </Link>
    </nav>
  );
}
