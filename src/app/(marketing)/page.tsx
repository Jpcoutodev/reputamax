import Link from "next/link";
import {
  Bell,
  Check,
  Dumbbell,
  Hotel,
  MessageSquareReply,
  ScissorsLineDashed,
  Search,
  Sparkles,
  Star,
  Stethoscope,
  Store,
  TrendingUp,
  UtensilsCrossed,
  Wrench,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScoreRing } from "@/components/score-ring";
import { BusinessSearch } from "@/components/diagnostico/business-search";
import { TrackView } from "@/components/analytics/track";

const problems = [
  {
    title: "Clientes insatisfeitos avaliam mais",
    description:
      "Estudos mostram que clientes insatisfeitos têm até 3x mais chance de deixar uma avaliação do que clientes satisfeitos. Sem gestão ativa, sua nota é naturalmente distorcida para baixo. Seus clientes felizes saem calados. Os irritados vão direto pro Google.",
  },
  {
    title: "90% pesquisam antes de comprar",
    description:
      "9 em cada 10 consumidores leem avaliações antes de escolher um negócio local. Se sua nota está abaixo de 4.5, você perde clientes todos os dias para concorrentes melhor avaliados — mesmo que seu serviço seja superior.",
  },
  {
    title: "Avaliações negativas sem resposta",
    description:
      "Cada avaliação negativa sem resposta diz ao próximo cliente: “esse negócio não se importa”. 45% dos consumidores evitam negócios que não respondem críticas. Seu silêncio está custando dinheiro.",
  },
];

const solutions = [
  {
    icon: Search,
    title: "Diagnóstico instantâneo gratuito",
    description:
      "Busque seu negócio e em 30 segundos descubra: sua nota real, avaliações sem resposta, comparação com concorrentes e um score de saúde da sua reputação de 0 a 100. Grátis, para sempre.",
  },
  {
    icon: Sparkles,
    title: "Respostas inteligentes com IA",
    description:
      "A IA do Reputamax gera respostas personalizadas para cada avaliação — empáticas para críticas, calorosas para elogios. Você revisa, ajusta se quiser, e publica com um clique. Sem perder horas pensando no que escrever.",
  },
  {
    icon: Bell,
    title: "Alertas em tempo real",
    description:
      "No instante em que uma nota baixa é publicada, você recebe uma notificação. Atue em minutos, não em semanas — uma resposta rápida pode até fazer o cliente mudar a avaliação e impedir que uma crise de reputação se espalhe.",
  },
  {
    icon: TrendingUp,
    title: "Sua nota subindo mês a mês",
    description:
      "O Reputamax usa um motor inteligente que canaliza a voz dos seus clientes satisfeitos para o lugar certo. Resultado: mais avaliações positivas no Google, sua nota crescendo de forma consistente e mais clientes encontrando seu negócio na busca.",
  },
];

const steps = [
  {
    title: "Busque seu negócio",
    description: "Encontre seu negócio no Google em um clique. Sem configuração complicada.",
  },
  {
    title: "Receba seu diagnóstico",
    description: "Em 30 segundos, veja o raio-x completo da sua reputação online.",
  },
  {
    title: "Ative a gestão ativa",
    description:
      "Respostas com IA, alertas em tempo real e coleta de avaliações começam a funcionar automaticamente.",
  },
  {
    title: "Veja sua nota subir",
    description: "Acompanhe a evolução no dashboard e veja mais clientes chegando.",
  },
];

const withoutItems = [
  "Avaliações negativas sem resposta há meses",
  "Apenas clientes insatisfeitos avaliam espontaneamente",
  "Nota caindo gradualmente",
  "Clientes potenciais escolhendo o concorrente",
  "Problemas recorrentes que você nem sabe que existem",
];

const withItems = [
  "Toda avaliação respondida em minutos com IA",
  "Clientes satisfeitos direcionados para avaliar no Google",
  "Nota subindo mês a mês",
  "Mais clientes chegando pela busca do Google",
  "Relatórios mostrando exatamente onde melhorar",
];

const impactNumbers = [
  { value: "90%", description: "dos consumidores leem avaliações antes de visitar um negócio local" },
  { value: "3x", description: "clientes insatisfeitos têm 3x mais chance de avaliar do que os satisfeitos" },
  { value: "35%", description: "mais clientes com nota acima de 4.5 vs abaixo de 4.0" },
  { value: "45%", description: "dos consumidores evitam negócios que não respondem avaliações negativas" },
];

const audiences = [
  { icon: UtensilsCrossed, label: "Restaurantes e bares" },
  { icon: Stethoscope, label: "Clínicas e consultórios" },
  { icon: Store, label: "Lojas e comércio" },
  { icon: Dumbbell, label: "Academias" },
  { icon: ScissorsLineDashed, label: "Salões e estética" },
  { icon: Hotel, label: "Hotéis e pousadas" },
  { icon: Wrench, label: "Oficinas e serviços" },
];

const faqs = [
  {
    question: "Preciso de conhecimento técnico?",
    answer:
      "Nenhum. Você busca seu negócio, recebe o diagnóstico e o Reputamax faz o resto: página de avaliação pronta, QR code pra imprimir e respostas sugeridas pela IA. Se você usa WhatsApp, sabe usar o Reputamax.",
  },
  {
    question: "O diagnóstico é realmente grátis?",
    answer:
      "Sim, e sem pegadinha: não pedimos cartão de crédito nem criação de conta para ver o relatório completo. O diagnóstico é nossa forma de mostrar o valor do produto antes de você decidir.",
  },
  {
    question: "Funciona para qualquer tipo de negócio?",
    answer:
      "Funciona para qualquer negócio local com perfil no Google: restaurantes, clínicas, salões, academias, oficinas, pet shops, hotéis e muito mais. Se seus clientes te procuram no Google, o Reputamax é pra você.",
  },
  {
    question: "Como o sistema faz minha nota subir?",
    answer:
      "Com dois movimentos: primeiro, sua página de avaliação inteligente direciona clientes satisfeitos para o Google e intercepta críticas em privado — assim os elogios viram estrelas públicas e os problemas chegam só pra você resolver. Segundo, a IA te ajuda a responder 100% das avaliações, o que melhora sua imagem e seu posicionamento na busca local.",
  },
  {
    question: "É seguro conectar minha conta Google?",
    answer:
      "Sim. Usamos a conexão oficial do Google (OAuth), a mesma tecnologia de “Entrar com Google” que você já usa em outros apps. Não temos acesso à sua senha e você pode revogar a permissão a qualquer momento direto na sua conta Google.",
  },
];

/** Sparkline simples do mockup do hero — sem lib de gráfico pra manter a landing leve */
function HeroSparkline() {
  return (
    <div className="flex flex-col gap-1">
      <svg viewBox="0 0 280 64" className="h-16 w-full" aria-hidden>
        <defs>
          <linearGradient id="heroSpark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,52 C30,50 45,44 70,42 C100,40 115,34 140,30 C165,26 185,24 210,16 C235,9 260,8 280,4 L280,64 L0,64 Z"
          fill="url(#heroSpark)"
        />
        <path
          d="M0,52 C30,50 45,44 70,42 C100,40 115,34 140,30 C165,26 185,24 210,16 C235,9 260,8 280,4"
          fill="none"
          stroke="#4F46E5"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>Jan</span>
        <span>Mar</span>
        <span>Mai</span>
        <span>Jul</span>
        <span>Set</span>
      </div>
    </div>
  );
}

function HeroMockup() {
  return (
    <div className="relative w-full max-w-md">
      <Card className="rounded-xl border shadow-none">
        <CardContent className="flex flex-col gap-5 p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Reputamax Dashboard</span>
            <span className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="size-2 animate-pulse rounded-full bg-success" />
                Ao vivo
              </span>
              <Badge variant="secondary" className="bg-success-soft text-success">
                Saudável
              </Badge>
            </span>
          </div>

          <div className="flex items-center gap-5">
            <ScoreRing score={87} size={104} strokeWidth={9} caption="/100" animate={false} />
            <div className="flex flex-1 flex-col gap-1">
              <span className="text-sm text-muted-foreground">Score de reputação</span>
              <span className="flex items-center gap-1.5 text-sm font-medium text-success">
                <TrendingUp className="size-4" />
                +12 nos últimos 90 dias
              </span>
            </div>
          </div>

          <HeroSparkline />

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-0.5 rounded-lg bg-surface p-3">
              <span className="text-xs text-muted-foreground">Nota Google</span>
              <span className="flex items-center gap-1.5 text-xl font-medium tabular-nums">
                4.7
                <Star className="size-4 fill-amber-400 text-amber-400" />
              </span>
              <span className="text-xs font-medium text-success">+0.4 neste mês</span>
            </div>
            <div className="flex flex-col gap-0.5 rounded-lg bg-surface p-3">
              <span className="text-xs text-muted-foreground">Taxa de resposta</span>
              <span className="text-xl font-medium tabular-nums">98%</span>
              <span className="text-xs text-muted-foreground">última semana</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* chips flutuantes */}
      <div className="absolute -right-3 -top-4 flex items-center gap-2 rounded-xl border bg-background px-3 py-2 text-xs shadow-sm sm:-right-6">
        <span className="flex size-6 items-center justify-center rounded-full bg-accent">
          <MessageSquareReply className="size-3.5 text-accent-foreground" />
        </span>
        <span>
          <span className="block font-medium">Nova avaliação</span>
          <span className="text-muted-foreground">IA respondeu ✓</span>
        </span>
      </div>
      <div className="absolute -bottom-4 -left-3 flex items-center gap-2 rounded-xl border bg-background px-3 py-2 text-xs shadow-sm sm:-left-6">
        <span className="flex size-6 items-center justify-center rounded-full bg-success-soft">
          <Star className="size-3.5 fill-success text-success" />
        </span>
        <span className="font-medium">12 avaliações hoje</span>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <>
      <TrackView event="landing_view" />
      {/* Hero — busca centralizada, primeira coisa que a pessoa lê */}
      <section className="border-b bg-surface">
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-8 px-4 py-20 md:py-24">
          <div className="flex flex-col items-center gap-3 text-center">
            <Badge variant="secondary" className="bg-accent text-accent-foreground">
              Gestão ativa de reputação
            </Badge>
            <h1 className="text-3xl font-medium tracking-tight md:text-4xl">
              Como está a reputação do seu negócio no Google?
            </h1>
            <p className="text-lg text-muted-foreground">
              Diagnóstico completo e gratuito em 30 segundos.
            </p>
          </div>
          <BusinessSearch variant="inline" className="text-center" />
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
            <li className="flex items-center gap-1.5">
              <Check className="size-4 text-success" /> Grátis
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="size-4 text-success" /> Resultado em 30 segundos
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="size-4 text-success" /> Sem cartão
            </li>
          </ul>
        </div>
      </section>

      {/* Pitch + mockup do dashboard */}
      <section className="mx-auto grid w-full max-w-[1100px] items-center gap-14 px-4 py-20 md:grid-cols-2 md:py-24">
        <div className="flex flex-col items-start gap-6">
          <h2 className="text-3xl font-medium leading-tight tracking-tight md:text-4xl">
            Cada estrela a menos no Google é dinheiro saindo pela porta.{" "}
            <span className="text-primary">O Reputamax resolve isso.</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Respostas com IA em segundos, alertas em tempo real a cada avaliação
            crítica e um sistema inteligente que faz sua nota subir mês após mês.
          </p>
          <Link
            href="#como-funciona"
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            Veja como funciona ↓
          </Link>
        </div>
        <div className="flex justify-center">
          <HeroMockup />
        </div>
      </section>

      {/* O problema */}
      <section className="border-t">
        <div className="mx-auto w-full max-w-[1100px] px-4 py-20">
        <div className="flex flex-col items-center gap-3 text-center">
          <Badge variant="secondary" className="bg-danger-soft text-danger">
            O problema
          </Badge>
          <h2 className="max-w-2xl text-3xl font-medium tracking-tight">
            O problema que você não vê (mas seus clientes veem)
          </h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {problems.map((problem) => (
            <Card key={problem.title} className="rounded-xl border shadow-none">
              <CardContent className="flex flex-col gap-3 p-6">
                <h3 className="font-medium">{problem.title}</h3>
                <p className="text-sm text-muted-foreground">{problem.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-8 rounded-xl border border-warning/40 bg-warning-soft p-6 text-center">
          <p className="font-medium">
            A diferença entre 3.8 e 4.6 estrelas pode significar até{" "}
            <span className="text-warning">35% mais clientes</span> entrando pela sua porta.
          </p>
        </div>
        </div>
      </section>

      {/* A solução */}
      <section className="border-y bg-surface">
        <div className="mx-auto w-full max-w-[1100px] px-4 py-20">
          <div className="flex flex-col items-center gap-3 text-center">
            <Badge variant="secondary" className="bg-accent text-accent-foreground">
              A solução
            </Badge>
            <h2 className="max-w-2xl text-3xl font-medium tracking-tight">
              Gestão ativa de reputação: sua nota sobe, seus clientes aumentam
            </h2>
            <p className="text-muted-foreground">
              O Reputamax transforma suas avaliações em uma máquina de atrair clientes.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {solutions.map((solution) => (
              <Card key={solution.title} className="rounded-xl border shadow-none">
                <CardContent className="flex flex-col gap-3 p-6">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <solution.icon className="size-5" />
                  </span>
                  <h3 className="font-medium">{solution.title}</h3>
                  <p className="text-sm text-muted-foreground">{solution.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <Button size="lg" render={<Link href="/diagnostico" />}>
              Quero melhorar minha nota
            </Button>
          </div>
        </div>
      </section>

      {/* Passo a passo */}
      <section id="como-funciona" className="mx-auto w-full max-w-[1100px] scroll-mt-20 px-4 py-20">
        <div className="flex flex-col items-center gap-3 text-center">
          <Badge variant="secondary" className="bg-accent text-accent-foreground">
            Passo a passo
          </Badge>
          <h2 className="text-3xl font-medium tracking-tight">Como o Reputamax funciona</h2>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.title} className="flex flex-col gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-primary text-lg font-medium text-primary-foreground">
                {i + 1}
              </span>
              <h3 className="font-medium">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sem / Com Reputamax */}
      <section className="border-y bg-surface">
        <div className="mx-auto w-full max-w-[1100px] px-4 py-20">
          <div className="flex flex-col items-center gap-3 text-center">
            <Badge variant="secondary" className="bg-accent text-accent-foreground">
              Por que gestão ativa
            </Badge>
            <h2 className="max-w-xl text-3xl font-medium tracking-tight">
              Sem gestão ativa, você está perdendo dinheiro
            </h2>
          </div>
          <div className="mx-auto mt-12 grid max-w-3xl gap-6 md:grid-cols-2">
            <Card className="rounded-xl border shadow-none">
              <CardContent className="flex flex-col gap-4 p-6">
                <h3 className="font-medium text-muted-foreground">Sem Reputamax</h3>
                <ul className="flex flex-col gap-3">
                  {withoutItems.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <X className="mt-0.5 size-4 shrink-0 text-danger" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="rounded-xl border-2 border-primary shadow-none">
              <CardContent className="flex flex-col gap-4 p-6">
                <h3 className="font-medium">Com Reputamax</h3>
                <ul className="flex flex-col gap-3">
                  {withItems.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-success" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Números de impacto */}
      <section className="mx-auto w-full max-w-[1100px] px-4 py-20">
        <div className="flex flex-col items-center gap-3 text-center">
          <Badge variant="secondary" className="bg-accent text-accent-foreground">
            Números de impacto
          </Badge>
          <h2 className="text-3xl font-medium tracking-tight">O peso real das avaliações</h2>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {impactNumbers.map((stat) => (
            <div key={stat.value} className="flex flex-col items-center gap-2 text-center">
              <span className="text-4xl font-medium text-primary tabular-nums">{stat.value}</span>
              <p className="text-sm text-muted-foreground">{stat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Para quem é */}
      <section className="border-y bg-surface">
        <div className="mx-auto flex w-full max-w-[1100px] flex-col items-center gap-3 px-4 py-20 text-center">
          <Badge variant="secondary" className="bg-accent text-accent-foreground">
            Para quem é
          </Badge>
          <h2 className="text-3xl font-medium tracking-tight">
            Feito para negócios que querem crescer
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {audiences.map((audience) => (
              <span
                key={audience.label}
                className="flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-sm"
              >
                <audience.icon className="size-4 text-primary" />
                {audience.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Planos */}
      <section className="mx-auto w-full max-w-[1100px] px-4 py-20">
        <h2 className="text-center text-3xl font-medium tracking-tight">
          Planos simples, sem surpresa
        </h2>
        <div className="mx-auto mt-12 grid max-w-3xl gap-6 md:grid-cols-2">
          <Card className="rounded-xl border shadow-none">
            <CardContent className="flex flex-col gap-4 p-8">
              <h3 className="font-medium">Essencial</h3>
              <p className="text-3xl font-medium">
                R$ 97<span className="text-base text-muted-foreground">/mês</span>
              </p>
              <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                <li>Página de avaliação inteligente</li>
                <li>QR code pronto pra imprimir</li>
                <li>Dashboard de reputação</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="relative rounded-xl border-2 border-primary shadow-none">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Mais popular</Badge>
            <CardContent className="flex flex-col gap-4 p-8">
              <h3 className="font-medium">Pro</h3>
              <p className="text-3xl font-medium">
                R$ 197<span className="text-base text-muted-foreground">/mês</span>
              </p>
              <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                <li>Tudo do Essencial</li>
                <li>Respostas com IA</li>
                <li>Comparação com concorrentes</li>
                <li>Relatórios mensais</li>
              </ul>
            </CardContent>
          </Card>
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          14 dias grátis em qualquer plano. Sem cartão de crédito.
        </p>
      </section>

      {/* FAQ */}
      <section className="border-t bg-surface">
        <div className="mx-auto w-full max-w-2xl px-4 py-20">
          <div className="flex flex-col items-center gap-3 text-center">
            <Badge variant="secondary" className="bg-accent text-accent-foreground">
              FAQ
            </Badge>
            <h2 className="text-3xl font-medium tracking-tight">Dúvidas frequentes</h2>
          </div>
          <Accordion className="mt-10">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="py-4 text-base">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA final */}
      <section className="border-t bg-navy">
        <div className="mx-auto flex w-full max-w-[1100px] flex-col items-center gap-6 px-4 py-20 text-center">
          <Badge variant="secondary" className="bg-white/10 text-white">
            Última chance
          </Badge>
          <h2 className="text-3xl font-medium tracking-tight text-white">
            Sua reputação não pode esperar
          </h2>
          <p className="max-w-lg text-white/70">
            Enquanto você lê isso, clientes estão pesquisando seu negócio no
            Google e decidindo se entram ou passam direto. Descubra como está sua
            reputação e comece a reverter o jogo.
          </p>
          <Button size="lg" render={<Link href="/diagnostico" />}>
            Quero melhorar minha nota
          </Button>
          <p className="text-sm text-white/50">
            Diagnóstico gratuito. Sem cartão de crédito. Resultado em 30 segundos.
          </p>
        </div>
      </section>
    </>
  );
}
