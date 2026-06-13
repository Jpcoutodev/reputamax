import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { DiagnosisResult, BusinessSearchResult } from "@/lib/providers/types";

/**
 * Consultas do painel admin — sempre via service role (a área é guardada
 * por requireAdmin). Contagens usam head+count para não trafegar linhas.
 */

/** Resolve uma query head+count para número (0 em erro/null). */
async function count(query: PromiseLike<{ count: number | null }>): Promise<number> {
  const { count: total } = await query;
  return total ?? 0;
}

function head(admin: ReturnType<typeof createAdminClient>, table: string) {
  return admin.from(table).select("*", { count: "exact", head: true });
}

/* ---------- Dashboard geral ---------- */

export interface AdminOverview {
  businessesTotal: number;
  byPlan: { trial: number; essencial: number; pro: number };
  /** MRR potencial: assinaturas pagas a preço de tabela (sem checkout ainda) */
  mrr: number;
  diagnosticsTotal: number;
  diagnosticsLast30d: number;
  leadsTotal: number;
  conversionsTotal: number;
  funnelResponsesTotal: number;
  interceptedTotal: number;
  signupsLast30d: number;
  recentBusinesses: { name: string; plan: string; createdAt: string }[];
}

const PLAN_PRICES: Record<string, number> = { essencial: 97, pro: 197 };

export async function getAdminOverview(): Promise<AdminOverview> {
  const admin = createAdminClient();
  const d30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    businessesTotal,
    trial,
    essencial,
    pro,
    diagnosticsTotal,
    diagnosticsLast30d,
    leadsTotal,
    conversionsTotal,
    funnelResponsesTotal,
    interceptedTotal,
    signupsLast30d,
    recent,
  ] = await Promise.all([
    count(head(admin, "businesses")),
    count(head(admin, "businesses").eq("plan", "trial")),
    count(head(admin, "businesses").eq("plan", "essencial")),
    count(head(admin, "businesses").eq("plan", "pro")),
    count(head(admin, "diagnostics")),
    count(head(admin, "diagnostics").gte("created_at", d30)),
    count(head(admin, "diagnostics").not("lead_email", "is", null)),
    count(head(admin, "diagnostics").not("converted_business_id", "is", null)),
    count(head(admin, "funnel_responses")),
    count(head(admin, "funnel_responses").lte("rating", 3)),
    count(head(admin, "businesses").gte("created_at", d30)),
    admin
      .from("businesses")
      .select("name, plan, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  return {
    businessesTotal,
    byPlan: { trial, essencial, pro },
    mrr: essencial * PLAN_PRICES.essencial + pro * PLAN_PRICES.pro,
    diagnosticsTotal,
    diagnosticsLast30d,
    leadsTotal,
    conversionsTotal,
    funnelResponsesTotal,
    interceptedTotal,
    signupsLast30d,
    recentBusinesses: (recent.data ?? []).map((b) => ({
      name: b.name,
      plan: b.plan ?? "trial",
      createdAt: b.created_at,
    })),
  };
}

/* ---------- Métricas da landing ---------- */

export interface LandingMetrics {
  views: number;
  viewsLast30d: number;
  uniqueSessions: number;
  diagnosticoViews: number;
  businessesSelected: number;
  diagnosticsCreated: number;
  leadsCaptured: number;
}

export async function getLandingMetrics(): Promise<LandingMetrics> {
  const admin = createAdminClient();
  const d30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [views, viewsLast30d, diagnosticoViews, businessesSelected, sessions, diagnosticsCreated, leadsCaptured] =
    await Promise.all([
      count(head(admin, "analytics_events").eq("event", "landing_view")),
      count(head(admin, "analytics_events").eq("event", "landing_view").gte("created_at", d30)),
      count(head(admin, "analytics_events").eq("event", "diagnostico_view")),
      count(head(admin, "analytics_events").eq("event", "diagnostico_negocio_selecionado")),
      admin
        .from("analytics_events")
        .select("session_id")
        .eq("event", "landing_view")
        .not("session_id", "is", null)
        .limit(10000),
      count(head(admin, "diagnostics")),
      count(head(admin, "diagnostics").not("lead_email", "is", null)),
    ]);

  const uniqueSessions = new Set((sessions.data ?? []).map((s) => s.session_id)).size;

  return {
    views,
    viewsLast30d,
    uniqueSessions,
    diagnosticoViews,
    businessesSelected,
    diagnosticsCreated,
    leadsCaptured,
  };
}

/* ---------- CRM ---------- */

export type CrmStage =
  | "diagnostico"
  | "lead"
  | "contatado"
  | "negociacao"
  | "cliente"
  | "perdido";

export const CRM_STAGES: CrmStage[] = [
  "diagnostico",
  "lead",
  "contatado",
  "negociacao",
  "cliente",
  "perdido",
];

/** Fase efetiva: a manual (crm_stage) vence; senão deriva dos dados. */
function effectiveStage(row: {
  crm_stage?: string | null;
  lead_email: string | null;
  converted_business_id: string | null;
}): CrmStage {
  if (row.crm_stage && CRM_STAGES.includes(row.crm_stage as CrmStage)) {
    return row.crm_stage as CrmStage;
  }
  if (row.converted_business_id) return "cliente";
  if (row.lead_email) return "lead";
  return "diagnostico";
}

/**
 * A coluna crm_stage só existe após a migration 0004. Detecta uma vez por
 * processo para o CRM funcionar antes e depois da migration (degrada sem fase manual).
 */
let crmStageColumnCache: boolean | null = null;
async function hasCrmStageColumn(): Promise<boolean> {
  if (crmStageColumnCache !== null) return crmStageColumnCache;
  const admin = createAdminClient();
  const { error } = await admin.from("diagnostics").select("crm_stage").limit(1);
  crmStageColumnCache = !error;
  return crmStageColumnCache;
}

export interface CrmEntry {
  id: string;
  businessName: string;
  category: string;
  rating: number;
  reviewCount: number;
  score: number | null;
  leadEmail: string | null;
  leadWhatsapp: string | null;
  stage: CrmStage;
  createdAt: string;
}

export interface CrmFilters {
  stage?: CrmStage;
  search?: string;
  page?: number;
}

const CRM_PAGE_SIZE = 25;

interface DiagnosticRow {
  id: string;
  business_name: string;
  business_snapshot: BusinessSearchResult | null;
  result: DiagnosisResult | null;
  lead_email: string | null;
  lead_whatsapp: string | null;
  converted_business_id: string | null;
  crm_stage?: string | null;
  created_at: string;
}

export async function getCrmEntries(
  filters: CrmFilters
): Promise<{ entries: CrmEntry[]; total: number; pageSize: number }> {
  const admin = createAdminClient();
  const page = Math.max(1, filters.page ?? 1);
  const hasStage = await hasCrmStageColumn();

  const columns = hasStage
    ? "id, business_name, business_snapshot, result, lead_email, lead_whatsapp, converted_business_id, crm_stage, created_at"
    : "id, business_name, business_snapshot, result, lead_email, lead_whatsapp, converted_business_id, created_at";

  let query = admin
    .from("diagnostics")
    .select(columns, { count: "exact" })
    .order("created_at", { ascending: false });

  if (filters.stage) {
    if (hasStage) {
      // fase manual OU (sem fase manual + condição derivada equivalente)
      const derivedCondition: Partial<Record<CrmStage, string>> = {
        diagnostico:
          "and(crm_stage.is.null,lead_email.is.null,converted_business_id.is.null)",
        lead: "and(crm_stage.is.null,lead_email.not.is.null,converted_business_id.is.null)",
        cliente: "and(crm_stage.is.null,converted_business_id.not.is.null)",
      };
      const parts = [`crm_stage.eq.${filters.stage}`];
      const derived = derivedCondition[filters.stage];
      if (derived) parts.push(derived);
      query = query.or(parts.join(","));
    } else {
      // sem a coluna: só as fases derivadas dos dados
      if (filters.stage === "cliente") {
        query = query.not("converted_business_id", "is", null);
      } else if (filters.stage === "lead") {
        query = query.not("lead_email", "is", null).is("converted_business_id", null);
      } else if (filters.stage === "diagnostico") {
        query = query.is("lead_email", null).is("converted_business_id", null);
      }
    }
  }
  if (filters.search) {
    const term = filters.search.replaceAll("%", "").replaceAll(",", "").trim();
    if (term) {
      query = query.or(`business_name.ilike.%${term}%,lead_email.ilike.%${term}%`);
    }
  }

  const from = (page - 1) * CRM_PAGE_SIZE;
  const { data: rawData, count } = await query.range(from, from + CRM_PAGE_SIZE - 1);
  // select dinâmico perde a inferência do Supabase — tipamos manualmente
  const data = (rawData ?? []) as unknown as DiagnosticRow[];

  const entries: CrmEntry[] = data.map((d) => {
    const snapshot = d.business_snapshot as BusinessSearchResult | null;
    const result = d.result as DiagnosisResult | null;
    return {
      id: d.id,
      businessName: d.business_name,
      category: snapshot?.category ?? "",
      rating: snapshot?.rating ?? 0,
      reviewCount: snapshot?.reviewCount ?? 0,
      score: result?.score ?? null,
      leadEmail: d.lead_email,
      leadWhatsapp: d.lead_whatsapp,
      stage: effectiveStage(d),
      createdAt: d.created_at,
    };
  });

  return { entries, total: count ?? 0, pageSize: CRM_PAGE_SIZE };
}

export interface CrmDiagnosticDetail {
  id: string;
  business: BusinessSearchResult;
  result: DiagnosisResult | null;
  leadEmail: string | null;
  leadWhatsapp: string | null;
  stage: CrmStage;
  createdAt: string;
}

export async function getCrmDiagnostic(id: string): Promise<CrmDiagnosticDetail | null> {
  const admin = createAdminClient();
  const hasStage = await hasCrmStageColumn();
  const columns = hasStage
    ? "id, business_snapshot, result, lead_email, lead_whatsapp, converted_business_id, crm_stage, created_at"
    : "id, business_snapshot, result, lead_email, lead_whatsapp, converted_business_id, created_at";

  const { data: rawData } = await admin
    .from("diagnostics")
    .select(columns)
    .eq("id", id)
    .maybeSingle();
  if (!rawData) return null;
  const data = rawData as unknown as DiagnosticRow;

  return {
    id: data.id,
    business: data.business_snapshot as BusinessSearchResult,
    result: data.result,
    leadEmail: data.lead_email,
    leadWhatsapp: data.lead_whatsapp,
    stage: effectiveStage(data),
    createdAt: data.created_at,
  };
}
