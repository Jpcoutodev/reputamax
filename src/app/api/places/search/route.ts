import { NextResponse } from "next/server";
import { z } from "zod";
import { reviewProvider } from "@/lib/providers";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const querySchema = z.string().trim().min(2).max(100);

/**
 * Busca de negócios para o diagnóstico.
 * Roda no servidor: em modo live usa a Places API (chave nunca vai ao browser);
 * em modo mock usa a lista local — o componente de busca não precisa saber qual.
 */
export async function GET(request: Request) {
  if (!rateLimit(`places:${clientIp(request)}`, 30, 60_000)) {
    return NextResponse.json({ error: "muitas_buscas" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse(searchParams.get("q") ?? "");
  if (!parsed.success) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await reviewProvider.searchBusiness(parsed.data);
    return NextResponse.json({ results });
  } catch (err) {
    console.error("[api/places/search]:", err);
    return NextResponse.json({ error: "busca_indisponivel" }, { status: 502 });
  }
}
