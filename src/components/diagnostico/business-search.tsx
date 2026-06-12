"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MapPin, Search, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { BusinessSearchResult } from "@/lib/providers/types";
import { track } from "@/components/analytics/track";

interface BusinessSearchProps {
  /** "inline": resultados empurram o conteúdo (página /diagnostico).
   *  "overlay": resultados em dropdown absoluto (hero da landing). */
  variant?: "inline" | "overlay";
  autoFocus?: boolean;
  className?: string;
}

export function BusinessSearch({
  variant = "inline",
  autoFocus = false,
  className,
}: BusinessSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BusinessSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        // a busca roda no servidor (chave do Google nunca vai ao browser)
        const res = await fetch(`/api/places/search?q=${encodeURIComponent(query)}`);
        const data = res.ok ? await res.json() : { results: [] };
        setResults(data.results ?? []);
      } catch {
        setResults([]);
      }
      setLoading(false);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  async function handleSelect(business: BusinessSearchResult) {
    setNavigating(true);
    track("diagnostico_negocio_selecionado", { name: business.name });
    try {
      // cria o diagnóstico no banco e navega com o id real
      const res = await fetch("/api/diagnostico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placeId: business.placeId }),
      });
      if (res.ok) {
        const { id } = await res.json();
        router.push(`/diagnostico/${id}/analise`);
        return;
      }
    } catch {
      // sem rede/banco: cai no modo demonstração abaixo
    }
    // modo demonstração (Supabase não configurado): id = placeId determinístico
    router.push(`/diagnostico/${business.placeId}/analise`);
  }

  const showEmpty = !loading && query.trim().length >= 2 && results.length === 0;

  const resultsList = (
    <ul className="flex w-full flex-col gap-2" role="listbox" aria-label="Negócios encontrados">
      {results.map((business) => (
        <li key={business.placeId}>
          <button
            type="button"
            role="option"
            aria-selected={false}
            onClick={() => handleSelect(business)}
            disabled={navigating}
            className="flex w-full items-center justify-between gap-4 rounded-xl border bg-background p-4 text-left transition-colors hover:border-primary focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
          >
            <span className="min-w-0">
              <span className="block font-medium">{business.name}</span>
              <span className="flex items-center gap-1 truncate text-sm text-muted-foreground">
                <MapPin className="size-3.5 shrink-0" />
                {business.address}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-1.5 text-sm">
              <Star className="size-4 fill-amber-400 text-amber-400" />
              <span className="font-medium">{business.rating.toFixed(1)}</span>
              <span className="text-muted-foreground">({business.reviewCount})</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoFocus={autoFocus}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Digite o nome do seu negócio…"
          aria-label="Nome do seu negócio"
          className="h-14 rounded-xl bg-background pl-12 text-base"
        />
        {loading || navigating ? (
          <Loader2 className="absolute right-4 top-1/2 size-5 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : null}
      </div>

      {variant === "overlay" ? (
        results.length > 0 || showEmpty ? (
          <div className="absolute inset-x-0 top-full z-30 mt-2 rounded-xl border bg-background p-2 shadow-lg">
            {results.length > 0 ? (
              resultsList
            ) : (
              <p className="p-3 text-sm text-muted-foreground">
                Nenhum negócio encontrado. Tente &quot;sorriso&quot;, &quot;serra&quot; ou
                &quot;barbearia&quot;.
              </p>
            )}
          </div>
        ) : null
      ) : (
        <div className="mt-4 flex flex-col gap-4">
          {results.length > 0 ? resultsList : null}
          {showEmpty ? (
            <p className="text-sm text-muted-foreground">
              Nenhum negócio encontrado com esse nome. Tente outro termo — por
              exemplo, &quot;clínica&quot;, &quot;restaurante&quot; ou &quot;barbearia&quot;.
            </p>
          ) : null}
          {query.trim().length < 2 ? (
            <p className="text-sm text-muted-foreground">
              Dica: experimente buscar por &quot;sorriso&quot;, &quot;serra&quot; ou &quot;carlão&quot;.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
