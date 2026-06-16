"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function LogsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function update(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "todos") params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`/admin/logs?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={searchParams.get("status") ?? "todos"}
        onValueChange={(v) => update("status", v)}
      >
        <SelectTrigger className="w-44" aria-label="Filtrar por status">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os status</SelectItem>
          <SelectItem value="ok">Sucesso</SelectItem>
          <SelectItem value="fallback">Caiu no determinístico</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={searchParams.get("provider") ?? "todos"}
        onValueChange={(v) => update("provider", v)}
      >
        <SelectTrigger className="w-44" aria-label="Filtrar por IA">
          <SelectValue placeholder="IA" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todas as IAs</SelectItem>
          <SelectItem value="minimax">MiniMax</SelectItem>
          <SelectItem value="anthropic">Claude</SelectItem>
          <SelectItem value="openai">GPT</SelectItem>
          <SelectItem value="mock">Determinístico</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
