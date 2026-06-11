# Reputamax — Especificação completa do produto (v1, mock-first)

> **Instrução para o agente de código:** Este documento é a fonte única de verdade do projeto. Construa o fluxo completo e todas as telas usando **dados mock** por trás de uma camada de abstração (seção 5). As APIs reais (Google Business Profile, WhatsApp, pagamentos) serão conectadas depois — o código deve estar pronto para essa troca sem refatoração das telas.

---

## 1. Visão geral

**Produto:** Reputamax (https://reputamax.app) — SaaS de gestão ativa de reputação no Google para negócios locais brasileiros (clínicas, restaurantes, barbearias, oficinas, petshops).

**Proposta de valor:** transformar avaliações do Google em máquina de atrair clientes, através de:
1. **Diagnóstico gratuito** da reputação (lead magnet e onboarding público).
2. **Página de avaliação com filtro inteligente** (QR code / link): notas altas vão pro Google, notas baixas viram feedback privado.
3. **Dashboard** com evolução da nota, comparação com concorrentes e central de avaliações com respostas sugeridas por IA.

**Público:** dono ou gerente de PME local. Pouco tempo, usa celular, entende cor e número antes de texto. Todo o produto em **português do Brasil**.

**Modelo de negócio (não implementar checkout agora, apenas as telas):**
- Plano Essencial — R$ 97/mês: página de avaliação + QR + dashboard básico.
- Plano Pro — R$ 197/mês: tudo do Essencial + respostas com IA + comparação com concorrentes + relatórios mensais.
- Trial de 14 dias sem cartão.

---

## 2. Estratégia de construção (mock-first)

**Fase atual (esta entrega):** todo o fluxo e todas as telas funcionando ponta a ponta com dados simulados realistas. O usuário consegue: fazer o diagnóstico grátis → criar conta → completar onboarding de ativação → usar o dashboard → ver a página pública de avaliação funcionando (com gravação real das respostas no banco).

**Fase 2 (fora deste escopo, mas o código deve prever):** trocar os providers mock por Google Business Profile API, Google Places API, disparo de e-mail real e análise por LLM real.

**Regra de ouro:** nenhum componente de tela chama API externa ou mock diretamente. Tudo passa pela camada de providers (seção 5).

---

## 3. Stack técnica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14+ (App Router) + TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| Gráficos | Recharts |
| Banco / Auth / Storage | Supabase (Postgres + Auth + RLS + Storage) |
| Hospedagem | Vercel |
| E-mail (fase 2) | Resend + React Email (criar stub) |
| Análise IA (fase 2) | API Anthropic (criar stub) |
| QR Code | lib `qrcode` (gerar SVG/PNG localmente) |
| Validação | Zod em todos os formulários e rotas de API |
| Analytics (preparar) | PostHog (apenas instrumentar eventos, chave via env) |

---

## 4. Arquitetura e estrutura de pastas

```
/src
  /app
    /(marketing)
      page.tsx                  # Landing page
      /diagnostico
        page.tsx                # Busca do negócio (Fluxo A1)
        /[diagnosticoId]
          analise/page.tsx      # Tela de análise ao vivo (A2)
          teaser/page.tsx       # Teaser + captura (A3)
          relatorio/page.tsx    # Relatório completo (A4)
    /(auth)
      login/page.tsx
      cadastro/page.tsx
    /(app)                      # Área logada, layout com sidebar
      dashboard/page.tsx
      avaliacoes/page.tsx
      feedbacks/page.tsx
      pagina-avaliacao/page.tsx # Config da página pública + QR
      concorrentes/page.tsx
      configuracoes/page.tsx
      planos/page.tsx
    /r/[slug]
      page.tsx                  # Página PÚBLICA de avaliação (Fluxo B)
      obrigado/page.tsx
    /api
      /diagnostico/route.ts
      /review-funnel/route.ts   # grava resposta da página pública
  /lib
    /providers                  # CAMADA DE ABSTRAÇÃO (seção 5)
      types.ts
      reviews/mock.ts
      reviews/google.ts         # stub: throw new Error('Not implemented')
      analysis/mock.ts
      analysis/anthropic.ts     # stub
      email/mock.ts             # loga no console
      email/resend.ts           # stub
      index.ts                  # factory: escolhe provider via env
    /supabase                   # clients (server, browser, admin)
    /mock-data                  # seeds e geradores (seção 14)
  /components
    /ui                         # shadcn
    /diagnostico
    /dashboard
    /review-funnel
```

---

## 5. Camada de providers (CRÍTICO)

Toda fonte de dados externa fica atrás de uma interface. A escolha mock/real vem de variável de ambiente.

```ts
// lib/providers/types.ts
export interface BusinessSearchResult {
  placeId: string;
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
  category: string;
  photoUrl?: string;
}

export interface Review {
  id: string;
  authorName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  createdAt: string;       // ISO
  replied: boolean;
  replyText?: string;
}

export interface CompetitorSnapshot {
  name: string;
  rating: number;
  reviewCount: number;
  distanceKm: number;
}

export interface ReviewDataProvider {
  searchBusiness(query: string): Promise<BusinessSearchResult[]>;
  getBusinessDetails(placeId: string): Promise<BusinessSearchResult>;
  getReviews(placeId: string): Promise<Review[]>;
  getCompetitors(placeId: string): Promise<CompetitorSnapshot[]>;
}

export interface DiagnosisResult {
  score: number;                      // 0-100
  ratingGapVsCompetitors: number;     // ex: -0.4
  responseRatePct: number;
  reviewsPerMonth: number;
  expectedReviewsPerMonth: number;
  sentimentThemes: {
    theme: string;                    // ex: "Tempo de espera"
    type: 'critica' | 'elogio';
    pct: number;                      // % das avaliações que citam
    examples: string[];               // trechos curtos
  }[];
  criticalIssues: string[];           // 3 itens
  recommendations: string[];          // 5 itens
  summary: string;                    // parágrafo executivo
}

export interface AnalysisProvider {
  analyzeReviews(business: BusinessSearchResult, reviews: Review[], competitors: CompetitorSnapshot[]): Promise<DiagnosisResult>;
  suggestReply(review: Review, businessName: string, tone: 'formal' | 'amigavel'): Promise<string>;
}
```

```ts
// lib/providers/index.ts
const useMocks = process.env.NEXT_PUBLIC_DATA_MODE !== 'live';
export const reviewProvider: ReviewDataProvider = useMocks ? mockReviewProvider : googleReviewProvider;
export const analysisProvider: AnalysisProvider = useMocks ? mockAnalysisProvider : anthropicAnalysisProvider;
export const emailProvider: EmailProvider = useMocks ? consoleEmailProvider : resendEmailProvider;
```

**Comportamento dos mocks:**
- `searchBusiness`: filtra uma lista de ~12 negócios fictícios brasileiros (seção 14) por nome; simular latência de 300–600 ms.
- `getReviews`: retorna 40–120 avaliações geradas de forma determinística a partir do placeId (mesmo negócio → mesmas avaliações sempre; usar seed no gerador).
- `analyzeReviews`: calcula score e métricas com regras determinísticas a partir dos dados mock (não precisa de IA): score = média ponderada de (nota relativa aos concorrentes, taxa de resposta, ritmo de avaliações, % de críticas). Temas de sentimento vêm de tags pré-atribuídas nas avaliações mock.
- `suggestReply`: monta resposta por template variando por nota e tom.
- Latências simuladas tornam os estados de loading reais e testáveis.

---

## 6. Modelo de dados (Supabase)

Executar como migration SQL. Habilitar RLS em **todas** as tabelas.

```sql
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

-- Avaliações sincronizadas (fase 2 grava da API; fase mock é populada por seed)
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
```

**Políticas RLS (padrão para todas as tabelas com `business_id`):**
- `select/insert/update/delete` permitidos apenas quando o `business_id` pertence a um negócio cujo `owner_id = auth.uid()`.
- `funnel_responses`: além da policy do dono, criar policy de **insert anônimo** (role `anon`) — a página pública grava sem login. Validar no servidor (rota de API) que o `business_id` existe e limitar payload.
- `diagnostics`: insert e select por `anon` permitidos apenas via rotas de API com service role; não expor select direto ao client.
- **Teste obrigatório:** criar 2 usuários de teste e verificar que um não enxerga dados do outro.

---

## 7. Mapa de rotas e telas

| Rota | Acesso | Descrição |
|---|---|---|
| `/` | Público | Landing page |
| `/diagnostico` | Público | Busca do negócio (A1) |
| `/diagnostico/[id]/analise` | Público | Análise ao vivo (A2) |
| `/diagnostico/[id]/teaser` | Público | Teaser + captura de lead (A3) |
| `/diagnostico/[id]/relatorio` | Público (após captura) | Relatório completo (A4) |
| `/cadastro`, `/login` | Público | Auth Supabase (e-mail/senha + Google) |
| `/dashboard` | Logado | Visão geral |
| `/avaliacoes` | Logado | Central de avaliações + resposta IA |
| `/feedbacks` | Logado | Feedbacks negativos interceptados |
| `/pagina-avaliacao` | Logado | Configurar página pública + QR |
| `/concorrentes` | Logado | Comparação com concorrentes |
| `/planos` | Logado | Planos (telas apenas, sem checkout) |
| `/configuracoes` | Logado | Dados do negócio, tom de voz, conta |
| `/r/[slug]` | Público | Página de avaliação com filtro (B) |
| `/r/[slug]/obrigado` | Público | Agradecimento pós-feedback negativo |

---

## 8. Fluxo A — Diagnóstico gratuito (onboarding público)

Princípio: **valor antes de cadastro**. Nenhum login até o teaser.

### A1 — Busca (`/diagnostico`)
- Headline: "Como está a reputação do seu negócio no Google?" Subtítulo: "Diagnóstico completo e gratuito em 30 segundos."
- Campo único com autocomplete (debounce 300 ms) chamando `reviewProvider.searchBusiness`. Resultados mostram nome, endereço, nota e nº de avaliações.
- Ao selecionar → cria registro em `diagnostics` (status `processing`) e navega para A2.

### A2 — Análise ao vivo (`/analise`)
- **Teatro proposital:** mesmo com mock instantâneo, a tela roda uma sequência de 15–20 s com barra de progresso e checklist animado:
  1. "✓ 87 avaliações encontradas" (usar número real do mock)
  2. "✓ Sentimento analisado por IA"
  3. "⟳ Comparando 3 concorrentes próximos…"
  4. "○ Gerando recomendações"
- Em paralelo, o servidor roda `analysisProvider.analyzeReviews` e grava `result` no diagnóstico. Ao terminar sequência + análise → redireciona para A3.

### A3 — Teaser + captura (`/teaser`)
- Mostra: score em círculo colorido (verde ≥ 80, âmbar 50–79, vermelho < 50), nota vs. média dos concorrentes, e **conteúdo bloqueado** (barras cinzas + ícone de cadeado): "3 problemas críticos e 5 recomendações bloqueados".
- Formulário: e-mail (obrigatório) + WhatsApp (opcional). Validar com Zod. Ao enviar → grava lead no diagnóstico, dispara `emailProvider.sendDiagnosisReport` (mock loga no console) e navega para A4.
- Nunca usar a palavra "cadastro" aqui — o CTA é "Ver relatório completo".

### A4 — Relatório completo (`/relatorio`)
Seções, nesta ordem:
1. **Score + resumo executivo** (parágrafo do `summary`).
2. **Cards de métricas** com semáforo de cor: nota atual, taxa de resposta, avaliações/mês vs. esperado, gap vs. concorrentes.
3. **Temas de sentimento**: barras horizontais (críticas em vermelho, elogios em verde) com % e trechos de exemplo.
4. **3 problemas críticos** (cards de alerta âmbar/vermelho).
5. **5 recomendações** numeradas — a recomendação nº 1 sempre conecta com o produto ("automatize o pedido de avaliações").
6. **CTA final:** "Resolver isso com o Reputamax — 14 dias grátis, sem cartão" → `/cadastro?diagnostico=[id]`.
- Botão secundário "Baixar PDF" pode ficar visível e desabilitado com tooltip "em breve".

### Pós-cadastro
- Se veio com `?diagnostico=`, criar o `business` já preenchido com os dados do diagnóstico (nome, place_id, snapshot) e vincular `converted_business_id`. Gerar `slug` a partir do nome (kebab-case, único).

---

## 9. Fluxo B — Página pública de avaliação (`/r/[slug]`)

A página mais importante do produto. Requisitos não-funcionais: **leve e rápida** (server component, sem JS pesado, sem auth), mobile-first, abre bem em 4G.

1. Logo + nome do negócio. Pergunta: "Como foi sua experiência?"
2. Seletor de 1 a 5 estrelas, grande, área de toque generosa.
3. **Rating 4–5:** mensagem "Que ótimo! Ajudaria muito se deixasse isso no Google — leva 30 segundos" + botão que abre `review_link` do negócio. Antes de redirecionar, gravar via `/api/review-funnel`: `{rating, redirected_to_google: true}`.
4. **Rating 1–3:** abre formulário privado: "O que podemos melhorar?" (textarea) + nome e contato opcionais. Grava em `funnel_responses` e vai para `/r/[slug]/obrigado` ("Obrigado! O responsável já foi avisado e vai cuidar disso pessoalmente.").
5. Rodapé discreto: "Pesquisa de satisfação por Reputamax" (link pro site — motor de crescimento viral).
6. Negócio sem `review_link` configurado: rating alto mostra agradecimento simples (sem botão quebrado).

---

## 10. Fluxo C — Área logada

Layout com sidebar (desktop) / bottom nav (mobile): Dashboard, Avaliações, Feedbacks, Página de avaliação, Concorrentes, Configurações. Badge do plano + dias restantes de trial no topo.

### Dashboard (`/dashboard`)
1. **Checklist de ativação** (card no topo, some quando 100%):
   - ① Confirme os dados do seu negócio → `/configuracoes`
   - ② Personalize sua página de avaliação → `/pagina-avaliacao`
   - ③ Baixe e posicione seu QR code → `/pagina-avaliacao`
   - ④ Peça suas 3 primeiras avaliações (botão "copiar mensagem pronta" com texto WhatsApp pré-escrito contendo o link `/r/[slug]`)
   - Persistir em `businesses.onboarding_steps`.
2. Cards de métricas: nota atual (com Δ do mês), total de avaliações, avaliações novas este mês, feedbacks negativos interceptados (com texto "críticas que NÃO viraram público" — é o número que vende o produto).
3. Gráfico (Recharts) de evolução de nota e nº de avaliações usando `metric_snapshots` (no modo mock, semear 90 dias de histórico com tendência de melhora discreta).
4. Feed "Atividade recente": últimas respostas do funil e avaliações.

### Avaliações (`/avaliacoes`)
- Lista das avaliações (mock via seed na tabela `reviews`): autor, estrelas, texto, data, status respondida/não.
- Filtros: por nota, respondidas/não respondidas.
- Ação "Responder": modal com textarea + botão "Sugerir resposta com IA" → `analysisProvider.suggestReply` preenche o campo (editável). "Publicar no Google" no modo mock apenas marca `replied = true` e salva `reply_text`, com toast "Resposta registrada (modo demonstração)".

### Feedbacks (`/feedbacks`)
- Lista de `funnel_responses` com rating ≤ 3: nota, texto, contato, data. Ação "Marcar como resolvido". Estado vazio: "Nenhuma crítica interceptada ainda — bom sinal!"

### Página de avaliação (`/pagina-avaliacao`)
- Preview ao vivo da `/r/[slug]` (iframe ou render do mesmo componente).
- Configurar: logo (upload → Supabase Storage), mensagem de boas-vindas, `review_link` do Google (campo com texto de ajuda explicando onde pegar o link no perfil do Google).
- QR code: preview + botões "Baixar PNG" e "Baixar PDF pronto pra imprimir" (A6 com QR centralizado, nome do negócio e instrução "Avalie sua experiência").

### Concorrentes (`/concorrentes`)
- Tabela comparativa (dados de `reviewProvider.getCompetitors`): nota, nº de avaliações, distância, com a linha do próprio negócio destacada e posição no "ranking local".

### Configurações e Planos
- Configurações: dados do negócio, tom de voz das respostas (formal/amigável), conta.
- Planos: cards Essencial vs. Pro (Pro com selo "Mais popular"), botão "Assinar" abre modal "Pagamentos em breve — você está no trial gratuito".

---

## 11. Design system

**Direção:** moderno, clean, confiável — "fintech para reputação". O produto vende credibilidade; a interface é a prova.

- **Cores:**
  - Fundo: branco `#FFFFFF`; superfícies `#F8F8FB`; texto `#16161D`.
  - Primária (única cor de marca nas ações): índigo profundo `#4F46E5` (harmoniza com o navy `#1a1a2e` já usado no site).
  - Semáforo de dados: verde `#16A34A`, âmbar `#D97706`, vermelho `#DC2626` — usados SOMENTE para significado (score, métricas, alertas), nunca decoração.
- **Tipografia:** Inter (ou Geist). Títulos `font-medium` (500), nunca 700+. Corpo 16 px. Números de métrica grandes (24–32 px).
- **Elemento assinatura:** o **anel de score** colorido — aparece no diagnóstico, no dashboard e no relatório; é a identidade visual do produto.
- **Espaçamento generoso**: uma ideia por seção; max-width de conteúdo 1100 px; cards com borda sutil (sem sombras pesadas), `rounded-xl`.
- **Mobile-first obrigatório** em `/r/[slug]` e no fluxo de diagnóstico.
- **Copy:** sentence case, voz ativa, verbos concretos ("Baixar QR code", não "Submeter"). Erros dizem o que houve e como resolver. Estados vazios convidam à ação.
- Acessibilidade mínima: foco visível, contraste AA, labels em todos os inputs.

---

## 12. Eventos de analytics (instrumentar com PostHog, chave via env; se ausente, no-op)

`diagnostico_iniciado`, `diagnostico_negocio_selecionado`, `diagnostico_lead_capturado`, `diagnostico_cta_clicado`, `cadastro_concluido`, `onboarding_passo_concluido` (com nº), `qr_baixado`, `funil_resposta_recebida` (com rating), `resposta_ia_gerada`.

---

## 13. Variáveis de ambiente

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_DATA_MODE=mock        # mock | live
NEXT_PUBLIC_APP_URL=https://reputamax.app
NEXT_PUBLIC_POSTHOG_KEY=          # opcional
# Fase 2 (deixar documentadas, não usadas ainda):
GOOGLE_MAPS_API_KEY=
GOOGLE_BUSINESS_PROFILE_CREDENTIALS=
ANTHROPIC_API_KEY=
RESEND_API_KEY=
```

---

## 14. Dados mock (seeds)

Criar em `/lib/mock-data`:

1. **12 negócios fictícios brasileiros** com variedade de situação, ex.:
   - Clínica Sorriso Sumaré (odontologia, 4.2, 87 avaliações, responde pouco) — caso "médio com potencial".
   - Restaurante Sabor da Serra (4.6, 412) — caso bom.
   - Oficina do Carlão (3.8, 54, muitas críticas de prazo) — caso ruim.
   - Barbearia Navalha de Ouro, Petshop Amigo Fiel, Academia Corpo em Forma, etc.
2. **Gerador determinístico de avaliações** (seed = placeId): nomes brasileiros, textos curtos realistas em PT-BR, cada avaliação com tags de tema (`tempo_espera`, `atendimento`, `preco`, `qualidade`, `limpeza`, `prazo`) que alimentam a análise.
3. **3 concorrentes por negócio**, sempre com pelo menos um acima do negócio analisado (cria a tensão do diagnóstico).
4. **Seed do banco** (script `npm run seed`): cria usuário demo (`demo@reputamax.app` / senha em env de dev), 1 business completo com slug `clinica-sorriso`, avaliações na tabela `reviews`, 90 dias de `metric_snapshots`, ~15 `funnel_responses` variadas.

---

## 15. Fase 2 — pontos de troca (documentar no README, não implementar)

| Mock | Real (futuro) |
|---|---|
| `mockReviewProvider.searchBusiness` | Google Places API (autocomplete) |
| `mockReviewProvider.getReviews` | Google Business Profile API |
| `mockAnalysisProvider` | API Anthropic (Claude) com prompt de análise |
| `consoleEmailProvider` | Resend |
| "Publicar no Google" (marca local) | GBP API reply |
| Checkout dos planos | Asaas ou Mercado Pago (Pix + cartão) |
| (novo) Disparos WhatsApp | Meta Cloud API — plano Pro |

A troca deve exigir apenas: implementar o provider real + `NEXT_PUBLIC_DATA_MODE=live`.

---

## 16. Ordem de construção sugerida e critérios de aceite

**Ordem:**
1. Setup (Next + Tailwind + shadcn + Supabase + migrations + RLS + seed).
2. Camada de providers com mocks completos e testes unitários do gerador determinístico e do cálculo de score.
3. Fluxo B (`/r/[slug]`) — é pequeno e destrava o resto.
4. Fluxo A completo (diagnóstico) com teatro de loading.
5. Auth + criação de business pós-diagnóstico.
6. Área logada: dashboard → avaliações → feedbacks → página de avaliação/QR → concorrentes → configurações/planos.
7. Landing page.
8. Polimento: estados vazios, loading skeletons, erros, responsivo, eventos analytics.

**Critérios de aceite (testar manualmente):**
- [ ] Consigo fazer o diagnóstico ponta a ponta sem login e o relatório é coerente com os dados mock do negócio escolhido.
- [ ] O mesmo negócio gera sempre o mesmo diagnóstico (determinismo).
- [ ] Capturei o lead e ele está na tabela `diagnostics`.
- [ ] Criei conta a partir do relatório e o business nasceu pré-preenchido.
- [ ] Checklist de ativação persiste e some ao completar.
- [ ] `/r/clinica-sorriso` no celular: nota 5 → grava e abre link do Google; nota 2 → formulário privado → aparece em `/feedbacks`.
- [ ] QR code baixa em PNG e PDF e aponta para a URL correta.
- [ ] Sugestão de resposta IA preenche o modal e salvar marca como respondida.
- [ ] Gráficos do dashboard renderizam com os 90 dias de seed.
- [ ] Usuário A não acessa nenhum dado do usuário B (testar RLS com 2 contas).
- [ ] Tudo em PT-BR, sem texto placeholder em inglês.

---

## 17. Fora de escopo agora (NÃO construir)

- Integração real com qualquer API do Google.
- Disparo real de e-mail ou WhatsApp.
- Checkout/pagamentos.
- Geração de PDF do relatório de diagnóstico (botão desabilitado).
- Multi-localização (1 negócio por conta nesta fase; modelar pensando em N no futuro).
- Painel administrativo interno.
