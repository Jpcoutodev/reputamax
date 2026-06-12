-- Reputamax — endurecimento de segurança (v2)
-- Execute no SQL Editor do Supabase (depois da 0001).

-- 1. RLS é por LINHA, não por coluna: a política de leitura pública de
--    businesses expunha owner_id, plan, trial_ends_at etc. a qualquer um
--    com a anon key. A página pública /r/[slug] agora busca via servidor
--    (service role), então a política não é mais necessária.
drop policy if exists "businesses_public_read" on businesses;

-- 2. O insert do funil passa exclusivamente pela rota /api/review-funnel
--    (service role + validação Zod + checagem de slug). A política de
--    insert anônimo permitia gravar direto via PostgREST, pulando a
--    validação — removida.
drop policy if exists "funnel_anon_insert" on funnel_responses;
