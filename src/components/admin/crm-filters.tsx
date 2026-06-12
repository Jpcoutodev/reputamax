"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CrmFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function update(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "todos") params.set(key, value);
    else params.delete(key);
    params.delete("page"); // filtro novo volta pra página 1
    router.push(`/admin/crm?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          defaultValue={searchParams.get("q") ?? ""}
          placeholder="Buscar por negócio ou e-mail…"
          className="w-64 pl-9"
          aria-label="Buscar no CRM"
          onKeyDown={(e) => {
            if (e.key === "Enter") update("q", (e.target as HTMLInputElement).value || null);
          }}
          onBlur={(e) => update("q", e.target.value || null)}
        />
      </div>
      <Select
        value={searchParams.get("fase") ?? "todos"}
        onValueChange={(v) => update("fase", v)}
      >
        <SelectTrigger className="w-44" aria-label="Filtrar por fase">
          <SelectValue placeholder="Fase" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todas as fases</SelectItem>
          <SelectItem value="diagnostico">Diagnóstico (sem lead)</SelectItem>
          <SelectItem value="lead">Lead capturado</SelectItem>
          <SelectItem value="cliente">Cliente (converteu)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
