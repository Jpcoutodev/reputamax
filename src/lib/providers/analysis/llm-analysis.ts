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
 * Núcleo compartilhado da análise por LLM (MiniMax, Claude, GPT…).
 *
 * Cada provider fornece apenas a função `complete` (HTTP do modelo).
 * Estratégia híbrida: as MÉTRICAS (score, gap, taxas) vêm sempre do cálculo
 * determinístico — LLM não inventa número. O LLM gera o qualitativo
 * (resumo, problemas, recomendações, temas, respostas). Em qualquer falha,
 * o resultado determinístico é o fallback — o produto nunca quebra.
 *
 * Os prompts padrão ficam aqui e podem ser sobrescritos pelo painel admin
 * (tabela app_settings) sem deploy.
 */

export interface ChatMessage {
  role: "system" | "user";
  content: string;
}

/** Função de completação de cada provider (server-only, chave no servidor). */
export type LlmComplete = (messages: ChatMessage[], maxTokens: number) => Promise<string>;

/** Reporta o resultado de cada chamada (provider/modelo são adicionados pelo caller). */
export type AnalysisLogger = (entry: {
  operation: "analyze" | "reply";
  status: "ok" | "fallback";
  durationMs: number;
  error?: string;
  businessName?: string;
  request?: string;
  response?: string;
}) => void;

function errMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

/** Serializa as mensagens enviadas num texto legível para o log. */
function formatRequest(messages: ChatMessage[]): string {
  return messages.map((m) => `[${m.role}]\n${m.content}`).join("\n\n");
}

export interface PromptOverrides {
  /** persona/system da análise do diagnóstico */
  analysisSystem?: string;
  /** bloco de regras do prompt da análise */
  analysisRules?: string;
  /** persona/system da sugestão de resposta (suporta {businessName} e {toneInstructions}) */
  replySystem?: string;
}

export const DEFAULT_ANALYSIS_SYSTEM_PROMPT =
  "Você é um consultor de reputação online especializado em negócios locais brasileiros. " +
  "Escreva em português do Brasil, direto e concreto, falando com o dono do negócio (use 'você'). " +
  "Responda SOMENTE com JSON válido, sem markdown e sem texto fora do JSON.";

export const DEFAULT_ANALYSIS_RULES =
  `Regras:
- exatamente 3 criticalIssues e 5 recommendations;
- a recommendation 1 deve ser sobre automatizar o pedido de avaliações aos clientes satisfeitos (QR code/link na hora do atendimento);
- sentimentThemes: 3 a 6 temas baseados nos textos reais das avaliações; pct = % aproximado das avaliações que citam o tema;
- examples: trechos LITERAIS curtos copiados das avaliações fornecidas.`;

export const DEFAULT_REPLY_SYSTEM_PROMPT =
  `Você escreve respostas públicas do dono do negócio "{businessName}" a avaliações do Google, em português do Brasil. ` +
  `{toneInstructions} ` +
  `Máximo de 60 palavras. Agradeça, responda ao ponto específico citado pelo cliente e, se a nota for baixa, convide para resolver em canal direto. ` +
  `Nunca prometa reembolso nem admita culpa jurídica. Responda SOMENTE com o texto da resposta, sem aspas nem comentários.`;

const toneInstructions: Record<"amigavel" | "formal", string> = {
  amigavel: "Tom: amigável, caloroso e próximo (pode usar 1 emoji).",
  formal: "Tom: formal, profissional e cordial (sem emojis).",
};

function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("LLM: JSON não encontrado na resposta");
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

function buildAnalysisUserPrompt(
  business: BusinessSearchResult,
  reviews: Review[],
  competitors: CompetitorSnapshot[],
  base: DiagnosisResult,
  rules: string
): string {
  const reviewLines = reviews
    .slice(0, 30)
    .map((r) => `- ${r.rating}★: "${r.text}"`)
    .join("\n");
  const competitorLines = competitors
    .map((c) => `- ${c.name}: ${c.rating}★ (${c.reviewCount} avaliações, ${c.distanceKm} km)`)
    .join("\n");

  const responseLine = base.responseDataAvailable
    ? `- Taxa de resposta às avaliações: ${base.responseRatePct}%`
    : `- Taxa de resposta às avaliações: NÃO DISPONÍVEL nesta fonte de dados — NÃO comente, critique ou estime a taxa de resposta no diagnóstico.`;

  return `Analise a reputação deste negócio no Google e responda no formato JSON especificado.

NEGÓCIO: ${business.name} (${business.category || "negócio local"})
Nota: ${business.rating} | Total de avaliações: ${business.reviewCount}

MÉTRICAS CALCULADAS:
- Score de reputação: ${base.score}/100
- Diferença de nota vs. média dos concorrentes: ${base.ratingGapVsCompetitors > 0 ? "+" : ""}${base.ratingGapVsCompetitors}
${responseLine}
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

${rules}`;
}

/** Cria um AnalysisProvider a partir da função de completação de um LLM. */
export function createLlmAnalysisProvider(
  complete: LlmComplete,
  overrides: PromptOverrides = {},
  log?: AnalysisLogger
): AnalysisProvider {
  return {
    async analyzeReviews(business, reviews, competitors, options): Promise<DiagnosisResult> {
      // métricas determinísticas — sempre calculadas, são o fallback completo
      const base = await mockAnalysisProvider.analyzeReviews(
        business,
        reviews,
        competitors,
        options
      );
      const messages: ChatMessage[] = [
        {
          role: "system",
          content: overrides.analysisSystem || DEFAULT_ANALYSIS_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: buildAnalysisUserPrompt(
            business,
            reviews,
            competitors,
            base,
            overrides.analysisRules || DEFAULT_ANALYSIS_RULES
          ),
        },
      ];
      const requestText = formatRequest(messages);
      const start = Date.now();
      try {
        const content = await complete(messages, 2000);
        const parsed = enrichmentSchema.parse(extractJson(content));
        log?.({
          operation: "analyze",
          status: "ok",
          durationMs: Date.now() - start,
          businessName: business.name,
          request: requestText,
          response: content,
        });
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
        console.error("[llm] analyzeReviews falhou, usando análise determinística:", err);
        log?.({
          operation: "analyze",
          status: "fallback",
          durationMs: Date.now() - start,
          error: errMessage(err),
          businessName: business.name,
          request: requestText,
        });
        return base;
      }
    },

    async suggestReply(review, businessName, tone): Promise<string> {
      const system = (overrides.replySystem || DEFAULT_REPLY_SYSTEM_PROMPT)
        .replaceAll("{businessName}", businessName)
        .replaceAll("{toneInstructions}", toneInstructions[tone]);
      const messages: ChatMessage[] = [
        { role: "system", content: system },
        {
          role: "user",
          content: `Avaliação de ${review.authorName} (${review.rating} de 5 estrelas):\n"${review.text}"`,
        },
      ];
      const requestText = formatRequest(messages);
      const start = Date.now();
      try {
        const reply = await complete(messages, 400);
        log?.({
          operation: "reply",
          status: "ok",
          durationMs: Date.now() - start,
          businessName,
          request: requestText,
          response: reply,
        });
        return reply;
      } catch (err) {
        console.error("[llm] suggestReply falhou, usando template:", err);
        log?.({
          operation: "reply",
          status: "fallback",
          durationMs: Date.now() - start,
          error: errMessage(err),
          businessName,
          request: requestText,
        });
        return mockAnalysisProvider.suggestReply(review, businessName, tone);
      }
    },
  };
}
