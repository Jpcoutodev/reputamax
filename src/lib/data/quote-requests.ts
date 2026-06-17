import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/config";

/** Pedidos de orçamento de implantação (tabela quote_requests). Só service role. */

export interface QuoteRequestRow {
  id: string;
  name: string;
  company: string;
  segment: string | null;
  storeCount: number | null;
  businessName: string | null;
  diagnosticId: string | null;
  leadEmail: string | null;
  leadWhatsapp: string | null;
  createdAt: string;
}

export interface QuoteRequestsResult {
  rows: QuoteRequestRow[];
  total: number;
  tableMissing: boolean;
}

interface JoinedDiagnostic {
  lead_email: string | null;
  lead_whatsapp: string | null;
}

/** Lista os pedidos de orçamento, com o contato do diagnóstico vinculado. */
export async function getQuoteRequests(): Promise<QuoteRequestsResult> {
  if (!supabaseAdminConfigured()) {
    return { rows: [], total: 0, tableMissing: true };
  }

  const admin = createAdminClient();
  const { data, error, count } = await admin
    .from("quote_requests")
    .select(
      "id, name, company, segment, store_count, business_name, diagnostic_id, created_at, diagnostics(lead_email, lead_whatsapp)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    // tabela ausente (migration 0006 pendente)
    return { rows: [], total: 0, tableMissing: true };
  }

  const rows: QuoteRequestRow[] = (data ?? []).map((r) => {
    const diag = (Array.isArray(r.diagnostics) ? r.diagnostics[0] : r.diagnostics) as
      | JoinedDiagnostic
      | null
      | undefined;
    return {
      id: r.id,
      name: r.name,
      company: r.company,
      segment: r.segment,
      storeCount: r.store_count,
      businessName: r.business_name,
      diagnosticId: r.diagnostic_id,
      leadEmail: diag?.lead_email ?? null,
      leadWhatsapp: diag?.lead_whatsapp ?? null,
      createdAt: r.created_at,
    };
  });

  return { rows, total: count ?? 0, tableMissing: false };
}
