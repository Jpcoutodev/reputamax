# Reputamax

SaaS de gestão ativa de reputação no Google para negócios locais brasileiros.
Especificação completa em [reputamax-especificacao.md](./reputamax-especificacao.md).

## Como rodar

```bash
npm install
npm run dev    # http://localhost:3000
```

O app tem dois modos, detectados automaticamente:

- **Sem `.env.local`** → modo demonstração: tudo funciona com dados simulados,
  sem banco (login entra direto, nada é persistido).
- **Com Supabase configurado** → modo real: auth de verdade, diagnósticos,
  leads, respostas do funil e configurações gravados no banco com RLS.

## Ativando o Supabase (modo real)

1. Crie um projeto grátis em [supabase.com](https://supabase.com) (região São Paulo).
2. No painel: **SQL Editor → New query**, cole o conteúdo de
   [supabase/migrations/0001_initial.sql](./supabase/migrations/0001_initial.sql) e execute.
3. Em **Project Settings → API**, copie as chaves e crie o `.env.local`
   (use o [.env.example](./.env.example) como modelo):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (em "service_role" — nunca exponha no client)
4. Em **Authentication → Sign In / Up**, desative "Confirm email" para
   testar sem servidor de e-mail (ou mantenha e o app mostra a tela
   "confirme seu e-mail").
5. Semeie o banco com o negócio demo: `npm run seed`
   (cria `demo@reputamax.app` / senha `reputamax123` ou a de `SEED_DEMO_PASSWORD`).
6. Reinicie o `npm run dev`.

Login com Google: ative o provider Google em **Authentication → Providers**
no Supabase (precisa de credenciais OAuth do Google Cloud). Sem isso o botão
mostra um aviso e o login por e-mail/senha continua funcionando.

> **Migrations**: rode também a `0002_security_hardening.sql` no SQL Editor —
> remove políticas anônimas substituídas por acesso via servidor.

## Ativando a busca real (Google Places API)

1. Em [console.cloud.google.com](https://console.cloud.google.com): crie um
   projeto → **APIs & Services → Library** → ative **"Places API (New)"**.
2. **APIs & Services → Credentials → Create credentials → API key**.
   Em "API restrictions", restrinja a chave à Places API (New).
3. No `.env.local`:
   ```
   GOOGLE_MAPS_API_KEY=AIza...
   NEXT_PUBLIC_DATA_MODE=live
   ```
4. Reinicie o servidor. A busca do diagnóstico passa a encontrar qualquer
   negócio real do Google Maps; análise e respostas de IA continuam nos
   providers mock (toggles independentes: `NEXT_PUBLIC_AI_MODE`,
   `NEXT_PUBLIC_EMAIL_MODE`).

Custos: a Places API tem cota gratuita mensal por SKU; acima dela a busca de
texto custa na faixa de US$ 30/1000 chamadas. O autocomplete tem debounce de
300 ms e mínimo de 2 caracteres para economizar chamadas.

Limitação conhecida: a Places API retorna **no máximo 5 avaliações** por
negócio e não inclui respostas do dono — a sincronização completa virá da
Google Business Profile API (aguardando aprovação do Google).

### Roteiro de demonstração

1. **Diagnóstico grátis** — `/diagnostico`: busque "sorriso", "serra" ou "carlão",
   selecione o negócio e acompanhe a análise ao vivo → teaser (captura de lead) → relatório completo.
2. **Cadastro/Login** — `/cadastro` e `/login` (auth mock: qualquer dado válido entra).
3. **Área logada** — `/dashboard`: checklist de ativação (persiste em localStorage),
   métricas, gráfico de 90 dias e atividade recente. Demais telas: `/avaliacoes`
   (resposta com IA mock), `/feedbacks`, `/pagina-avaliacao` (QR code real em PNG/PDF),
   `/concorrentes`, `/configuracoes`, `/planos`.
4. **Página pública** — `/r/clinica-sorriso`: nota 4–5 direciona ao Google;
   nota 1–3 abre feedback privado → `/r/clinica-sorriso/obrigado`.

## Stack

Next.js (App Router) + TypeScript · Tailwind CSS v4 + shadcn/ui (Base UI) ·
Recharts · Zod · qrcode · lucide-react.

## Arquitetura

- `src/lib/providers/` — **camada de abstração obrigatória**: nenhuma tela chama
  API/mock diretamente. `index.ts` escolhe o provider via `NEXT_PUBLIC_DATA_MODE`
  (`mock` | `live`).
- `src/lib/mock-data/` — 12 negócios fictícios, gerador determinístico de
  avaliações (seed = placeId), concorrentes e dados da área logada.
- `src/app/(marketing)` — landing + fluxo de diagnóstico (A1–A4).
- `src/app/(auth)` — login e cadastro.
- `src/app/(app)` — área logada com sidebar/bottom nav.
- `src/app/r/[slug]` — página pública de avaliação (Fluxo B, mobile-first).

## Próximas integrações (não implementadas)

| Hoje | Real (futuro) | Dependência |
|---|---|---|
| `mockReviewProvider.searchBusiness` | Google Places API | Chave do Google Cloud (liberação imediata) |
| `mockReviewProvider.getReviews` | Google Business Profile API | **Aprovação do Google pendente** |
| "Publicar no Google" (salva no banco) | GBP API reply | Idem acima |
| `mockAnalysisProvider` | API Anthropic (Claude) | `ANTHROPIC_API_KEY` |
| `consoleEmailProvider` | Resend | `RESEND_API_KEY` |
| Checkout dos planos | Asaas ou Mercado Pago | — |

A troca deve exigir apenas implementar o provider real + `NEXT_PUBLIC_DATA_MODE=live`.

## Variáveis de ambiente

```
NEXT_PUBLIC_DATA_MODE=mock        # mock | live
NEXT_PUBLIC_APP_URL=https://reputamax.app
# Fase 2 (documentadas, não usadas ainda):
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_POSTHOG_KEY=
GOOGLE_MAPS_API_KEY=
GOOGLE_BUSINESS_PROFILE_CREDENTIALS=
ANTHROPIC_API_KEY=
RESEND_API_KEY=
```
