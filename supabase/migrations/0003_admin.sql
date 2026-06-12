-- Reputamax — painel administrativo (v3)
-- Execute no SQL Editor do Supabase (depois da 0001 e 0002).
-- Pré-requisito: o usuário coutodev7@gmail.com já deve existir no Auth
-- (criado via API admin antes desta migration).

-- ============================================================
-- 1. Administradores (allowlist)
-- ============================================================
create table admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  created_at timestamptz default now()
);

-- ============================================================
-- 2. Configurações da aplicação (chave/valor)
--    Usadas para: provider de IA ativo, prompts customizados, modelos.
-- ============================================================
create table app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

-- ============================================================
-- 3. Eventos de analytics (landing, funil de diagnóstico)
-- ============================================================
create table analytics_events (
  id uuid primary key default gen_random_uuid(),
  event text not null,
  path text,
  session_id text,
  metadata jsonb,
  created_at timestamptz default now()
);

create index idx_analytics_event_date on analytics_events (event, created_at desc);

-- ============================================================
-- RLS: tudo habilitado, NENHUMA policy — acesso exclusivamente
-- via service role no servidor (regra de ouro da spec, seção 18).
-- ============================================================
alter table admins enable row level security;
alter table app_settings enable row level security;
alter table analytics_events enable row level security;

-- ============================================================
-- Seeds
-- ============================================================

-- admin inicial (o usuário precisa existir no Auth)
insert into admins (user_id, email)
select id, 'coutodev7@gmail.com' from auth.users where email = 'coutodev7@gmail.com'
on conflict (user_id) do nothing;

-- provider de IA ativo (mock | minimax | anthropic | openai)
insert into app_settings (key, value)
values ('ai_provider', '"minimax"')
on conflict (key) do nothing;
