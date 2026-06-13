"use client";

import Link from "next/link";
import { LogIn, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** Menu sanduíche do cabeçalho — só no mobile (no desktop os botões ficam inline). */
export function MarketingMobileMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="icon" aria-label="Abrir menu">
            <Menu className="size-5" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem render={<Link href="/diagnostico" />}>
          <Search className="size-4" />
          Fazer diagnóstico grátis
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/login" />}>
          <LogIn className="size-4" />
          Entrar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
