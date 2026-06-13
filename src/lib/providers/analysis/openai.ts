import type { LlmComplete } from "./llm-analysis";

/**
 * OpenAI (GPT) — SERVIDOR APENAS (OPENAI_API_KEY não existe no browser).
 * O modelo é resolvido em runtime (admin > env > default).
 */
const DEFAULT_BASE_URL = "https://api.openai.com/v1/chat/completions";

export function makeOpenaiComplete(model: string): LlmComplete {
  return async (messages, maxTokens) => {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error("OPENAI_API_KEY ausente — configure no .env.local");

    const res = await fetch(process.env.OPENAI_BASE_URL ?? DEFAULT_BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model, messages, max_completion_tokens: maxTokens }),
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
}
