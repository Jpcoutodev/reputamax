-- Reputamax — logs das chamadas de IA (v5)
-- Execute no SQL Editor do Supabase (depois da 0004).

create table ai_logs (
  id uuid primary key default gen_random_uuid(),
  operation text not null,          -- 'analyze' | 'reply'
  provider text not null,           -- mock | minimax | anthropic | openai
  model text,                       -- modelo usado (null no determinístico)
  status text not null,             -- 'ok' | 'fallback'
  fallback boolean default false,   -- caiu no determinístico após falha da IA?
  error text,                       -- mensagem de erro (quando a IA falhou)
  request text,                     -- prompt enviado para a IA
  response text,                    -- resposta crua da IA
  duration_ms int,
  business_name text,
  diagnostic_id uuid,
  created_at timestamptz default now()
);

-- Se você JÁ rodou a versão anterior desta migration (sem request/response),
-- rode apenas estas duas linhas no lugar do CREATE acima:
--   alter table ai_logs add column if not exists request text;
--   alter table ai_logs add column if not exists response text;

create index idx_ai_logs_date on ai_logs (created_at desc);
create index idx_ai_logs_status on ai_logs (status, created_at desc);

-- RLS habilitado, sem policies: acesso só via service role (regra da seção 18)
alter table ai_logs enable row level security;
