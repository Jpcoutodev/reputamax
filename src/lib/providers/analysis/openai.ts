import type { AnalysisProvider } from "../types";
import { createLlmAnalysisProvider, type LlmComplete } from "./llm-analysis";

/**
 * OpenAI (GPT) — SERVIDOR APENAS (OPENAI_API_KEY não existe no browser).
 * Modelo padrão: gpt-5.1 (sobrescreva com OPENAI_MODEL).
 */

const DEFAULT_BASE_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-5.1";

export const completeOpenai: LlmComplete = async (messages, maxTokens) => {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY ausente — configure no .env.local");

  const res = await fetch(process.env.OPENAI_BASE_URL ?? DEFAULT_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? DEFAULT_MODEL,
      messages,
      max_completion_tokens: maxTokens,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenAI ${res.status}: ${text.slice(0, 300)}`);
  }
  const data = await res.json();
  const content: string = (data.choices?.[0]?.message?.content ?? "").trim();
  if (!content) throw new Error("OpenAI: resposta vazia");
  return content;
};

export const openaiAnalysisProvider: AnalysisProvider =
  createLlmAnalysisProvider(completeOpenai);
