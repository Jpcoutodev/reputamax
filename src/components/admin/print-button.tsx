"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Abre o diálogo de impressão — "Salvar como PDF" gera o arquivo. */
export function PrintButton() {
  return (
    <Button onClick={() => window.print()}>
      <Printer className="size-4" />
      Baixar PDF
    </Button>
  );
}
