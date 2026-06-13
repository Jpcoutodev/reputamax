import type { LlmComplete } from "./llm-analysis";

/**
 * Anthropic (Claude) — SERVIDOR APENAS (ANTHROPIC_API_KEY não existe no browser).
 * O modelo é resolvido em runtime (admin > env > default).
 */
const BASE_URL = "https://api.anthropic.com/v1/messages";

export function makeAnthropicComplete(model: string): LlmComplete {
  return async (messages, maxTokens) => {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) throw new Error("ANTHROPIC_API_KEY ausente — configure no .env.local");

    const system = messages.filter((m) => m.role === "system").map((m) => m.content).join("\n");
    const userMessages = messages
      .filter((m) => m.role === "user")
      .map((m) => ({ role: "user" as const, content: m.content }));

    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({ model, max_tokens: maxTokens, system, messages: userMessages }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Anthropic ${res.status}: ${text.slice(0, 300)}`);
    }
    const data = await res.json();
    const content = (data.content ?? [])
      .filter((b: { type: string }) => b.type === "text")
      .map((b: { text: string }) => b.text)
      .join("")
      .trim();
    if (!content) throw new Error("Anthropic: resposta vazia");
    return content;
  };
}
