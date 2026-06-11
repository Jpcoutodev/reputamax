# Reputamax

SaaS de gestão ativa de reputação no Google para negócios locais brasileiros.
Especificação completa em [reputamax-especificacao.md](./reputamax-especificacao.md).

## Fase atual: visual mock-first

Todas as telas funcionam ponta a ponta com **dados simulados determinísticos** —
nenhuma API externa, nenhum banco. A troca para dados reais (fase 2) acontece
apenas na camada de providers, sem refatorar telas.

```bash
npm install
npm run dev    # http://localhost:3000
```

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

## Fase 2 — pontos de troca (não implementados)

| Mock | Real (futuro) |
|---|---|
| `mockReviewProvider.searchBusiness` | Google Places API |
| `mockReviewProvider.getReviews` | Google Business Profile API |
| `mockAnalysisProvider` | API Anthropic (Claude) |
| `consoleEmailProvider` | Resend |
| Auth/persistência mock (localStorage) | Supabase (Postgres + Auth + RLS + Storage) |
| "Publicar no Google" (marca local) | GBP API reply |
| Checkout dos planos | Asaas ou Mercado Pago |

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
