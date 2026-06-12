import { z } from "zod";
import type {
  AnalysisProvider,
  BusinessSearchResult,
  CompetitorSnapshot,
  DiagnosisResult,
  Review,
} from "../types";
import { mockAnalysisProvider } from "./mock";

/**
 * MiniMax (chat completion) — análise qualitativa por LLM.
 *
 * SERVIDOR APENAS: MINIMAX_API_KEY não existe no browser; client components
 * chamam via rotas de API.
 *
 * Estratégia híbrida: as MÉTRICAS (score, gap, taxas) continuam vindo do
 * cálculo determinístico (mockAnalysisProvider) — LLM não inventa número.
 * A MiniMax gera a parte qualitativa: resumo, problemas, recomendações,
 * temas de sentimento e sugestões de resposta. Em qualquer falha, o
 * resultado determinístico é usado como fallback — o produto nunca quebra.
 */

const DEFAULT_BASE_URL = "https://api.minimax.io/v1/text/chatcompletion_v2";
const DEFAULT_MODEL = "MiniMax-M2";

function config() {
  const key = process.env.MINIMAX_API_KEY;
  if (!key) {
    throw new Error("MINIMAX_API_KEY ausente — configure no .env.local (servidor apenas)");
  }
  return {
    key,
    url: process.env.MINIMAX_BASE_URL ?? DEFAULT_BASE_URL,
    model: process.env.MINIMAX_MODEL ?? DEFAULT_MODEL,
  };
}

interface ChatMessage {
  role: "system" | "user";
  content: string;
}

async function chat(messages: ChatMessage[], maxTokens: number): Promise<string> {
  const { key, url, model } = config();
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.4,
      max_tokens: maxTokens,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`MiniMax ${res.status}: ${text.slice(0, 300)}`);
  }
  const data = await res.json();
  // a MiniMax pode devolver erro com HTTP 200 dentro de base_resp
  if (data.base_resp && data.base_resp.status_code !== 0) {
    throw new Error(`MiniMax base_resp ${data.base_resp.status_code}: ${data.base_resp.status_msg}`);
  }
  let content: string = data.choices?.[0]?.message?.content ?? "";
  // modelos de raciocínio (M2) podem incluir blocos <think>
  content = content.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  if (!content) throw new Error("MiniMax: resposta vazia");
  return content;
}

function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("MiniMax: JSON não encontrado na resposta");
  return JSON.parse(text.slice(start, end + 1));
}

const enrichmentSchema = z.object({
  summary: z.string().min(20),
  criticalIssues: z.array(z.string().min(10)).min(1),
  recommendations: z.array(z.string().min(10)).min(1),
  sentimentThemes: z
    .array(
      z.object({
        theme: z.string().min(2),
        type: z.enum(["critica", "elogio"]),
        pct: z.number().min(0).max(100),
        examples: z.array(z.string()).default([]),
      })
    )
    .default([]),
});

function padWith<T>(items: T[], fallback: T[], size: number): T[] {
  const result = items.slice(0, size);
  for (const f of fallback) {
    if (result.length >= size) break;
    result.push(f);
  }
  return result;
}

export const minimaxAnalysisProvider: AnalysisProvider = {
  async analyzeReviews(
    business: BusinessSearchResult,
    reviews: Review[],
    competitors: CompetitorSnapshot[]
  ): Promise<DiagnosisResult> {
    // métricas determinísticas — sempre calculadas, são o fallback completo
    const base = await mockAnalysisProvider.analyzeReviews(business, reviews, competitors);

    try {
      const reviewLines = reviews
        .slice(0, 30)
        .map((r) => `- ${r.rating}★: "${r.text}"`)
        .join("\n");
      const competitorLines = competitors
        .map((c) => `- ${c.name}: ${c.rating}★ (${c.reviewCount} avaliações, ${c.distanceKm} km)`)
        .join("\n");

      const content = await chat(
        [
          {
            role: "system",
            content:
              "Você é um consultor de reputação online especializado em negócios locais brasileiros. " +
              "Escreva em português do Brasil, direto e concreto, falando com o dono do negócio (use 'você'). " +
              "Responda SOMENTE com JSON válido, sem markdown e sem texto fora do JSON.",
          },
          {
            role: "user",
            content: `Analise a reputação deste negócio no Google e responda no formato JSON especificado.

NEGÓCIO: ${business.name} (${business.category || "negócio local"})
Nota: ${business.rating} | Total de avaliações: ${business.reviewCount}

MÉTRICAS CALCULADAS:
- Score de reputação: ${base.score}/100
- Diferença de nota vs. média dos concorrentes: ${base.ratingGapVsCompetitors > 0 ? "+" : ""}${base.ratingGapVsCompetitors}
- Taxa de resposta às avaliações: ${base.responseRatePct}% (pode estar subestimada — dado parcial)
- Avaliações novas por mês: ~${base.reviewsPerMonth} (potencial estimado: ${base.expectedReviewsPerMonth})

CONCORRENTES PRÓXIMOS:
${competitorLines || "- (nenhum encontrado)"}

AVALIAÇÕES DE CLIENTES (amostra):
${reviewLines || "- (nenhuma disponível)"}

Responda neste formato JSON exato:
{
  "summary": "parágrafo executivo de 3 a 5 frases sobre a situação da reputação, citando números",
  "criticalIssues": ["problema crítico 1", "problema crítico 2", "problema crítico 3"],
  "recommendations": ["rec 1", "rec 2", "rec 3", "rec 4", "rec 5"],
  "sentimentThemes": [{"theme": "Nome do tema", "type": "critica" ou "elogio", "pct": número 0-100, "examples": ["trecho curto de avaliação"]}]
}

Regras:
- exatamente 3 criticalIssues e 5 recommendations;
- a recommendation 1 deve ser sobre automatizar o pedido de avaliações aos clientes satisfeitos (QR code/link na hora do atendimento);
- sentimentThemes: 3 a 6 temas baseados nos textos reais das avaliações; pct = % aproximado das avaliações que citam o tema;
- examples: trechos LITERAIS curtos copiados das avaliações fornecidas.`,
          },
        ],
        2000
      );

      const parsed = enrichmentSchema.parse(extractJson(content));
      return {
        ...base,
        summary: parsed.summary,
        criticalIssues: padWith(parsed.criticalIssues, base.criticalIssues, 3),
        recommendations: padWith(parsed.recommendations, base.recommendations, 5),
        sentimentThemes:
          parsed.sentimentThemes.length > 0
            ? parsed.sentimentThemes.map((t) => ({ ...t, pct: Math.round(t.pct) }))
            : base.sentimentThemes,
      };
    } catch (err) {
      console.error("[minimax] analyzeReviews falhou, usando análise determinística:", err);
      return base;
    }
  },

  async suggestReply(
    review: Review,
    businessName: string,
    tone: "formal" | "amigavel"
  ): Promise<string> {
    try {
      const content = await chat(
        [
          {
            role: "system",
            content:
              `Você escreve respostas públicas do dono do negócio "${businessName}" a avaliações do Google, em português do Brasil. ` +
              (tone === "amigavel"
                ? "Tom: amigável, caloroso e próximo (pode usar 1 emoji)."
                : "Tom: formal, profissional e cordial (sem emojis).") +
              " Máximo de 60 palavras. Agradeça, responda ao ponto específico citado pelo cliente e, se a nota for baixa, convide para resolver em canal direto. Nunca prometa reembolso nem admita culpa jurídica. Responda SOMENTE com o texto da resposta, sem aspas nem comentários.",
          },
          {
            role: "user",
            content: `Avaliação de ${review.authorName} (${review.rating} de 5 estrelas):\n"${review.text}"`,
          },
        ],
        400
      );
      return content;
    } catch (err) {
      console.error("[minimax] suggestReply falhou, usando template:", err);
      return mockAnalysisProvider.suggestReply(review, businessName, tone);
    }
  },
};
