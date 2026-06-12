import { NextResponse } from "next/server";
import { z } from "zod";
import { getAnalysisProvider } from "@/lib/data/ai";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/config";
import { getCurrentBusiness } from "@/lib/data/business";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const bodySchema = z.object({
  rating: z.number().int().min(1).max(5),
  text: z.string().min(1).max(2000),
  authorName: z.string().min(1).max(120),
});

/** Sugestão de resposta por IA — roda no servidor (chave do LLM não vai ao browser). */
export async function POST(request: Request) {
  if (!rateLimit(`ai-reply:${clientIp(request)}`, 20, 60_000)) {
    return NextResponse.json({ error: "muitas_requisicoes" }, { status: 429 });
  }

  // área logada: exige sessão quando o Supabase está configurado
  if (supabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "nao_autenticado" }, { status: 401 });
    }
  }

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "payload_invalido" }, { status: 400 });
  }

  const business = await getCurrentBusiness();
  const analysisProvider = await getAnalysisProvider();
  const reply = await analysisProvider.suggestReply(
    {
      id: "suggest",
      authorName: parsed.data.authorName,
      rating: parsed.data.rating as 1 | 2 | 3 | 4 | 5,
      text: parsed.data.text,
      createdAt: new Date().toISOString(),
      replied: false,
      themes: [],
    },
    business.name,
    business.tone
  );

  return NextResponse.json({ reply });
}
