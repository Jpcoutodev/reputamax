-- Reputamax — pedidos de orçamento de implantação (v6)
-- Execute no SQL Editor do Supabase (depois da 0005).

create table quote_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text not null,
  segment text,
  store_count int,
  diagnostic_id uuid references diagnostics(id),
  business_name text,
  created_at timestamptz default now()
);

create index idx_quote_requests_date on quote_requests (created_at desc);

-- RLS habilitado, sem policies: acesso só via service role (regra da seção 18)
alter table quote_requests enable row level security;
