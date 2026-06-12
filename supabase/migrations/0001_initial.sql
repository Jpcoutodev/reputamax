-- Reputamax — schema inicial (spec seção 6)
-- Executar no SQL Editor do Supabase ou via `supabase db push`.

-- ============================================================
-- Tabelas
-- ============================================================

-- Negócios (tenant principal)
create table businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) not null,
  name text not null,
  slug text unique not null,            -- usado em /r/[slug]
  category text,
  address text,
  google_place_id text,
  logo_url text,
  review_link text,                     -- link "escreva uma avaliação" do Google
  welcome_message text,                 -- mensagem da página pública
  tone text default 'amigavel',         -- tom das respostas IA
  plan text default 'trial',            -- trial | essencial | pro
  trial_ends_at timestamptz default now() + interval '14 days',
  onboarding_steps jsonb default '{"perfil":false,"pagina":false,"qr":false,"primeiras":false}',
  created_at timestamptz default now()
);

-- Diagnósticos (público, pré-cadastro)
create table diagnostics (
  id uuid primary key default gen_random_uuid(),
  place_id text not null,
  business_name text not null,
  business_snapshot jsonb not null,     -- BusinessSearchResult
  result jsonb,                         -- DiagnosisResult
  status text default 'processing',     -- processing | ready
  lead_email text,
  lead_whatsapp text,
  lead_captured_at timestamptz,
  converted_business_id uuid references businesses(id),
  created_at timestamptz default now()
);

-- Respostas da página pública de avaliação (Fluxo B)
create table funnel_responses (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) not null,
  rating int not null check (rating between 1 and 5),
  redirected_to_google boolean default false,
  feedback_text text,                   -- só quando rating <= 3
  customer_name text,
  customer_contact text,
  resolved boolean default false,
  created_at timestamptz default now()
);

-- Snapshot diário de métricas (alimenta gráficos)
create table metric_snapshots (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) not null,
  date date not null,
  rating numeric(2,1),
  review_count int,
  unique (business_id, date)
);

-- Avaliações sincronizadas (fase GBP API; por enquanto populada por seed)
create table reviews (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) not null,
  external_id text,
  author_name text,
  rating int,
  text text,
  replied boolean default false,
  reply_text text,
  review_created_at timestamptz,
  created_at timestamptz default now()
);

-- Índices para as consultas mais comuns
create index idx_funnel_responses_business on funnel_responses (business_id, created_at desc);
create index idx_metric_snapshots_business on metric_snapshots (business_id, date);
create index idx_reviews_business on reviews (business_id, review_created_at desc);
create index idx_businesses_owner on businesses (owner_id);

-- ============================================================
-- RLS — habilitar em TODAS as tabelas
-- ============================================================

alter table businesses enable row level security;
alter table diagnostics enable row level security;
alter table funnel_responses enable row level security;
alter table metric_snapshots enable row level security;
alter table reviews enable row level security;

-- businesses: dono faz tudo no próprio negócio
create policy "businesses_owner_all" on businesses
  for all using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

-- Página pública /r/[slug] precisa ler dados básicos do negócio sem login
create policy "businesses_public_read" on businesses
  for select using (true);

-- funnel_responses: dono lê/atualiza; insert anônimo via rota de API
create policy "funnel_owner_select" on funnel_responses
  for select using (
    business_id in (select id from businesses where owner_id = (select auth.uid()))
  );
create policy "funnel_owner_update" on funnel_responses
  for update using (
    business_id in (select id from businesses where owner_id = (select auth.uid()))
  );
-- insert pelo role anon (a rota de API valida business_id e limita payload)
create policy "funnel_anon_insert" on funnel_responses
  for insert to anon, authenticated
  with check (true);

-- metric_snapshots: somente o dono
create policy "metrics_owner_all" on metric_snapshots
  for all using (
    business_id in (select id from businesses where owner_id = (select auth.uid()))
  )
  with check (
    business_id in (select id from businesses where owner_id = (select auth.uid()))
  );

-- reviews: somente o dono
create policy "reviews_owner_all" on reviews
  for all using (
    business_id in (select id from businesses where owner_id = (select auth.uid()))
  )
  with check (
    business_id in (select id from businesses where owner_id = (select auth.uid()))
  );

-- diagnostics: NENHUMA policy de select/insert para anon/authenticated.
-- Todo acesso é feito pelas rotas de API com service role (que ignora RLS).
