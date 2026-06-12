import type { AnalysisProvider } from "../types";
import { createLlmAnalysisProvider, type LlmComplete } from "./llm-analysis";

/**
 * MiniMax — SERVIDOR APENAS (MINIMAX_API_KEY não existe no browser).
 * Endpoint internacional; modelo padrão MiniMax-M2.
 */

const DEFAULT_BASE_URL = "https://api.minimax.io/v1/text/chatcompletion_v2";
const DEFAULT_MODEL = "MiniMax-M2";

export const completeMinimax: LlmComplete = async (messages, maxTokens) => {
  const key = process.env.MINIMAX_API_KEY;
  if (!key) throw new Error("MINIMAX_API_KEY ausente — configure no .env.local");

  const res = await fetch(process.env.MINIMAX_BASE_URL ?? DEFAULT_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: process.env.MINIMAX_MODEL ?? DEFAULT_MODEL,
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
};

export const minimaxAnalysisProvider: AnalysisProvider =
  createLlmAnalysisProvider(completeMinimax);
