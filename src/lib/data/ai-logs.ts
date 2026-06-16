import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/config";

/**
 * Logs das chamadas de IA (tabela ai_logs). Tudo via service role.
 * Resiliente: se a tabela não existir (migration 0005 pendente), grava no-op
 * e a leitura retorna vazio — o app nunca quebra por causa do log.
 */

export interface AiLogEntry {
  operation: "analyze" | "reply";
  provider: string;
  model: string | null;
  status: "ok" | "fallback";
  fallback: boolean;
  error?: string;
  durationMs: number;
  businessName?: string;
  diagnosticId?: string;
}

/** Grava um log (fire-and-forget; nunca lança). */
export async function logAiCall(entry: AiLogEntry): Promise<void> {
  if (!supabaseAdminConfigured()) return;
  try {
    const admin = createAdminClient();
    await admin.from("ai_logs").insert({
      operation: entry.operation,
      provider: entry.provider,
      model: entry.model,
      status: entry.status,
      fallback: entry.fallback,
      error: entry.error?.slice(0, 1000) ?? null,
      duration_ms: entry.durationMs,
      business_name: entry.businessName ?? null,
      diagnostic_id: entry.diagnosticId ?? null,
    });
  } catch {
    // tabela ausente ou erro de rede — log é melhor-esforço
  }
}

export interface AiLogRow {
  id: string;
  operation: string;
  provider: string;
  model: string | null;
  status: string;
  fallback: boolean;
  error: string | null;
  durationMs: number | null;
  businessName: string | null;
  createdAt: string;
}

export interface AiLogsResult {
  rows: AiLogRow[];
  total: number;
  pageSize: number;
  summary: { ok: number; fallback: number; tableMissing: boolean };
}

const PAGE_SIZE = 30;

export interface AiLogFilters {
  status?: "ok" | "fallback";
  provider?: string;
  page?: number;
}

/** Lista logs com filtros + resumo (últimos 30 dias). */
export async function getAiLogs(filters: AiLogFilters): Promise<AiLogsResult> {
  const empty: AiLogsResult = {
    rows: [],
    total: 0,
    pageSize: PAGE_SIZE,
    summary: { ok: 0, fallback: 0, tableMissing: true },
  };
  if (!supabaseAdminConfigured()) return empty;

  const admin = createAdminClient();
  const page = Math.max(1, filters.page ?? 1);

  let query = admin
    .from("ai_logs")
    .select("id, operation, provider, model, status, fallback, error, duration_ms, business_name, created_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false });

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.provider) query = query.eq("provider", filters.provider);

  const from = (page - 1) * PAGE_SIZE;
  const { data, count, error } = await query.range(from, from + PAGE_SIZE - 1);
  if (error) return empty; // provável tabela ausente

  const d30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const [okCount, fbCount] = await Promise.all([
    admin
      .from("ai_logs")
      .select("*", { count: "exact", head: true })
      .eq("status", "ok")
      .gte("created_at", d30),
    admin
      .from("ai_logs")
      .select("*", { count: "exact", head: true })
      .eq("status", "fallback")
      .gte("created_at", d30),
  ]);

  return {
    rows: (data ?? []).map((r) => ({
      id: r.id,
      operation: r.operation,
      provider: r.provider,
      model: r.model,
      status: r.status,
      fallback: r.fallback ?? false,
      error: r.error,
      durationMs: r.duration_ms,
      businessName: r.business_name,
      createdAt: r.created_at,
    })),
    total: count ?? 0,
    pageSize: PAGE_SIZE,
    summary: {
      ok: okCount.count ?? 0,
      fallback: fbCount.count ?? 0,
      tableMissing: false,
    },
  };
}
