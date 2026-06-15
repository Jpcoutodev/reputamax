import Link from "next/link";
import {
  Bell,
  Check,
  Dumbbell,
  Hotel,
  MessageSquareOff,
  MessageSquareReply,
  ScissorsLineDashed,
  Search,
  Sparkles,
  Star,
  Stethoscope,
  Store,
  TrendingDown,
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
import type { Metadata } from "next";
import { ScoreRing } from "@/components/score-ring";
import { BusinessSearch } from "@/components/diagnostico/business-search";
import { TrackView } from "@/components/analytics/track";
import { JsonLd } from "@/components/seo/json-ld";
import { faqs } from "@/lib/landing-content";
import { landingSchemas } from "@/lib/structured-data";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Reputamax — Gestão ativa de reputação no Google para negócios locais",
  description: siteConfig.description,
  alternates: { canonical: "/" },
};
import { AnimateOnScroll } from "@/components/landing/animate-on-scroll";
import { CountUp } from "@/components/landing/count-up";

const problems = [
  {
    icon: TrendingDown,
    stat: "3x",
    title: "Clientes insatisfeitos avaliam mais",
    description:
      "Estudos mostram que clientes insatisfeitos têm até 3x mais chance de deixar uma avaliação do que clientes satisfeitos. Sem gestão ativa, sua nota é naturalmente distorcida para baixo. Seus clientes felizes saem calados. Os irritados vão direto pro Google.",
  },
  {
    icon: Search,
    stat: "90%",
    title: "90% pesquisam antes de comprar",
    description:
      "9 em cada 10 consumidores leem avaliações antes de escolher um negócio local. Se sua nota está abaixo de 4.5, você perde clientes todos os dias para concorrentes melhor avaliados — mesmo que seu serviço seja superior.",
  },
  {
    icon: MessageSquareOff,
    stat: "45%",
    title: "Avaliações negativas sem resposta",
    description:
      "Cada avaliação negativa sem resposta diz ao próximo cliente: \"esse negócio não se importa\". 45% dos consumidores evitam negócios que não respondem críticas. Seu silêncio está custando dinheiro.",
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
      <div className="flex justify-between text-[10px] text-foreground/80">
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
    <div className="relative w-full max-w-md animate-fade-in-up" style={{ animationDelay: "400ms" }}>
      <Card className="rounded-xl border shadow-none backdrop-blur-sm bg-background/80">
        <CardContent className="flex flex-col gap-5 p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-heading font-semibold">Reputamax Dashboard</span>
            <span className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-xs text-foreground/80">
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
              <span className="text-sm text-foreground/80">Score de reputação</span>
              <span className="flex items-center gap-1.5 text-sm font-heading font-semibold text-success">
                <TrendingUp className="size-4" />
                +12 nos últimos 90 dias
              </span>
            </div>
          </div>

          <HeroSparkline />

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-0.5 rounded-lg bg-surface p-3">
              <span className="text-xs text-foreground/80">Nota Google</span>
              <span className="flex items-center gap-1.5 text-xl font-heading font-semibold tabular-nums">
                4.7
                <Star className="size-4 fill-amber-400 text-amber-400" />
              </span>
              <span className="text-xs font-heading font-semibold text-success">+0.4 neste mês</span>
            </div>
            <div className="flex flex-col gap-0.5 rounded-lg bg-surface p-3">
              <span className="text-xs text-foreground/80">Taxa de resposta</span>
              <span className="text-xl font-heading font-semibold tabular-nums">98%</span>
              <span className="text-xs text-foreground/80">última semana</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Floating chip — top right */}
      <div className="animate-float absolute -right-3 -top-4 flex items-center gap-2 rounded-xl border bg-background/90 backdrop-blur-sm px-3 py-2 text-xs shadow-lg sm:-right-6">
        <span className="flex size-6 items-center justify-center rounded-full bg-accent">
          <MessageSquareReply className="size-3.5 text-accent-foreground" />
        </span>
        <span>
          <span className="block font-heading font-semibold">Nova avaliação</span>
          <span className="text-foreground/80">IA respondeu ✓</span>
        </span>
      </div>

      {/* Floating chip — bottom left */}
      <div className="animate-float-delayed absolute -bottom-4 -left-3 flex items-center gap-2 rounded-xl border bg-background/90 backdrop-blur-sm px-3 py-2 text-xs shadow-lg sm:-left-6">
        <span className="flex size-6 items-center justify-center rounded-full bg-success-soft">
          <Star className="size-3.5 fill-success text-success" />
        </span>
        <span className="font-heading font-semibold">12 avaliações hoje</span>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <>
      <JsonLd data={landingSchemas()} />
      <TrackView event="landing_view" />

      {/* ─── Pitch + mockup ─── */}
      <section className="bg-surface">
        <div className="mx-auto grid w-full max-w-[1100px] items-center gap-14 px-4 py-20 md:grid-cols-2 md:py-28">
          <AnimateOnScroll>
            <div className="flex flex-col items-start gap-6">
              <Badge variant="secondary" className="bg-accent text-accent-foreground">
                Gestão ativa de reputação
              </Badge>
              <h2 className="text-3xl font-heading font-bold leading-[1.15] tracking-tight md:text-4xl lg:text-5xl">
                Boa reputação não é só status.{" "}
                <span className="text-gradient">É mais clientes entrando pela porta.</span>
              </h2>
              <p className="text-lg leading-relaxed text-foreground/80">
                Cada estrela a menos no Google é dinheiro saindo do bolso. O Reputamax
                responde avaliações com IA, alerta você em tempo real e faz sua nota
                subir mês após mês.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Button size="lg" render={<Link href="/diagnostico" />}>
                  Começar diagnóstico grátis
                </Button>
                <Link
                  href="#como-funciona"
                  className="group flex items-center gap-1.5 text-sm font-heading font-semibold text-primary underline-offset-4 hover:underline"
                >
                  Veja como funciona
                  <span className="inline-block transition-transform group-hover:translate-y-0.5">↓</span>
                </Link>
              </div>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll delay={200}>
            <div className="flex justify-center">
              <HeroMockup />
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden border-b bg-surface">
        {/* Dot grid background */}
        <div className="dot-grid-bg pointer-events-none absolute inset-0" />
        {/* Radial fade overlay */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,transparent_0%,var(--surface)_70%)]" />

        <div className="relative mx-auto flex w-full max-w-2xl flex-col items-center gap-8 px-4 py-24 md:py-32">
          <div className="flex flex-col items-center gap-4 text-center">
            <Badge
              variant="secondary"
              className="animate-fade-in-up bg-accent text-accent-foreground"
            >
              Gestão ativa de reputação
            </Badge>
            <h1
              className="animate-fade-in-up text-4xl font-heading font-bold tracking-tight md:text-5xl"
              style={{ animationDelay: "100ms" }}
            >
              Como está a reputação do seu negócio{" "}
              <span className="text-gradient">no Google?</span>
            </h1>
            <p
              className="animate-fade-in-up max-w-lg text-xl sm:text-2xl font-medium text-foreground/90"
              style={{ animationDelay: "200ms" }}
            >
              Faça um <span className="font-bold text-primary">diagnóstico grátis</span> em 30 segundos
            </p>
          </div>
          <div className="animate-fade-in-up w-full" style={{ animationDelay: "300ms" }}>
            <BusinessSearch variant="inline" className="text-center" />
          </div>
          <ul
            className="animate-fade-in-up flex flex-wrap items-center justify-center gap-3"
            style={{ animationDelay: "400ms" }}
          >
            <li className="flex items-center gap-1.5 rounded-full bg-success px-4 py-1.5 text-sm font-bold text-white shadow-lg shadow-success/25 ring-1 ring-white/20 transition-transform hover:scale-105 cursor-default">
              <Check className="size-4" strokeWidth={3} /> Grátis
            </li>
            <li className="flex items-center gap-1.5 rounded-full bg-success px-4 py-1.5 text-sm font-bold text-white shadow-lg shadow-success/25 ring-1 ring-white/20 transition-transform hover:scale-105 cursor-default">
              <Check className="size-4" strokeWidth={3} /> Resultado em 30 segundos
            </li>
            <li className="flex items-center gap-1.5 rounded-full bg-success px-4 py-1.5 text-sm font-bold text-white shadow-lg shadow-success/25 ring-1 ring-white/20 transition-transform hover:scale-105 cursor-default">
              <Check className="size-4" strokeWidth={3} /> Sem cartão
            </li>
          </ul>
        </div>
      </section>

      {/* ─── O problema ─── */}
      <section className="border-t">
        <div className="mx-auto w-full max-w-[1100px] px-4 py-20">
          <AnimateOnScroll>
            <div className="flex flex-col items-center gap-3 text-center">
              <Badge variant="secondary" className="bg-danger-soft text-danger">
                O problema
              </Badge>
              <h2 className="max-w-2xl text-3xl font-heading font-bold tracking-tight">
                O problema que você não vê (mas seus clientes veem)
              </h2>
            </div>
          </AnimateOnScroll>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {problems.map((problem, i) => (
              <AnimateOnScroll key={problem.title} delay={i * 150}>
                <Card className="card-hover-glow group relative h-full overflow-hidden rounded-xl border border-border/50 bg-background shadow-sm">
                  {/* ícone marca d'água no canto */}
                  <div className="absolute -right-6 -top-6 text-danger/[0.04] transition-transform duration-500 group-hover:scale-110 group-hover:text-danger/[0.06]">
                    <problem.icon className="size-40 -rotate-12" />
                  </div>
                  <CardContent className="relative flex flex-col gap-5 p-8">
                    <div className="flex items-center justify-between">
                      <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-danger/20 to-danger/5 text-danger shadow-inner shadow-danger/20 ring-1 ring-danger/20">
                        <problem.icon className="size-7" />
                      </div>
                      <span className="font-heading text-3xl font-bold text-danger/80">
                        {problem.stat}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <h3 className="text-xl font-heading font-bold tracking-tight text-foreground/90">
                        {problem.title}
                      </h3>
                      <p className="text-base leading-relaxed text-foreground/80">
                        {problem.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </AnimateOnScroll>
            ))}
          </div>
          <AnimateOnScroll delay={300}>
            <div className="mt-8 relative overflow-hidden rounded-xl border border-warning/20 bg-gradient-to-r from-warning/10 via-surface to-transparent p-8 text-center sm:text-left sm:flex sm:items-center sm:justify-between shadow-sm">
              <div className="absolute left-0 top-0 h-full w-1.5 bg-warning" />
              <p className="text-lg font-heading font-semibold text-foreground/90 max-w-3xl">
                A diferença entre <span className="font-bold text-foreground">3.8</span> e <span className="font-bold text-foreground">4.6</span> estrelas pode significar até{" "}
                <span className="text-warning font-bold bg-warning/10 px-2 py-0.5 rounded-md inline-block mt-1 sm:mt-0">35% mais clientes</span> entrando pela sua porta.
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ─── A solução ─── */}
      <section className="border-y bg-surface">
        <div className="mx-auto w-full max-w-[1100px] px-4 py-20">
          <AnimateOnScroll>
            <div className="flex flex-col items-center gap-3 text-center">
              <Badge variant="secondary" className="bg-accent text-accent-foreground">
                A solução
              </Badge>
              <h2 className="max-w-2xl text-3xl font-heading font-bold tracking-tight">
                Gestão ativa de reputação: sua nota sobe, seus clientes aumentam
              </h2>
              <p className="text-lg text-foreground/90 max-w-xl">
                O Reputamax transforma suas avaliações em uma máquina de atrair clientes.
              </p>
            </div>
          </AnimateOnScroll>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {solutions.map((solution, i) => (
              <AnimateOnScroll key={solution.title} delay={i * 120}>
                <Card className="card-hover-glow group relative h-full overflow-hidden rounded-xl border border-border/50 bg-background shadow-none">
                  <div className="absolute -right-6 -top-6 text-primary/[0.03] transition-transform duration-500 group-hover:scale-110 group-hover:text-primary/[0.05]">
                    <solution.icon className="size-40 rotate-12" />
                  </div>
                  
                  <CardContent className="relative flex flex-col gap-5 p-8">
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary shadow-inner shadow-primary/20 ring-1 ring-primary/20">
                      <solution.icon className="size-7" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <h3 className="text-xl font-heading font-bold tracking-tight text-foreground/90">
                        {solution.title}
                      </h3>
                      <p className="text-base leading-relaxed text-foreground/80">
                        {solution.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </AnimateOnScroll>
            ))}
          </div>
          <AnimateOnScroll delay={300}>
            <div className="mt-10 flex justify-center">
              <Button size="lg" render={<Link href="/diagnostico" />}>
                Quero melhorar minha nota
              </Button>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ─── Passo a passo ─── */}
      <section id="como-funciona" className="mx-auto w-full max-w-[1100px] scroll-mt-20 px-4 py-20">
        <AnimateOnScroll>
          <div className="flex flex-col items-center gap-3 text-center">
            <Badge variant="secondary" className="bg-accent text-accent-foreground">
              Passo a passo
            </Badge>
            <h2 className="text-3xl font-heading font-bold tracking-tight">Como o Reputamax funciona</h2>
          </div>
        </AnimateOnScroll>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <AnimateOnScroll key={step.title} delay={i * 150} className="overflow-visible">
              <div className={`flex flex-col gap-3 ${i < steps.length - 1 ? "step-connector" : ""}`}>
                <span className="relative z-[1] flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-lg font-heading font-semibold text-primary-foreground shadow-md shadow-primary/20">
                  {i + 1}
                </span>
                <h3 className="relative z-[1] font-heading font-semibold">{step.title}</h3>
                <p className="relative z-[1] text-sm text-foreground/80">{step.description}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </section>

      {/* ─── Sem / Com Reputamax ─── */}
      <section className="border-y bg-surface">
        <div className="mx-auto w-full max-w-[1100px] px-4 py-20">
          <AnimateOnScroll>
            <div className="flex flex-col items-center gap-3 text-center">
              <Badge variant="secondary" className="bg-accent text-accent-foreground">
                Por que gestão ativa
              </Badge>
              <h2 className="max-w-xl text-3xl font-heading font-bold tracking-tight">
                Sem gestão ativa, você está perdendo dinheiro
              </h2>
            </div>
          </AnimateOnScroll>
          <div className="mx-auto mt-12 grid max-w-3xl gap-6 md:grid-cols-2">
            <AnimateOnScroll>
              <Card className="card-hover-glow h-full rounded-xl border shadow-none">
                <CardContent className="flex flex-col gap-4 p-6">
                  <h3 className="font-heading font-semibold text-foreground/80">Sem Reputamax</h3>
                  <ul className="flex flex-col gap-3">
                    {withoutItems.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-foreground/80">
                        <X className="mt-0.5 size-4 shrink-0 text-danger" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </AnimateOnScroll>
            <AnimateOnScroll delay={200}>
              <Card className="card-hover-glow h-full rounded-xl border-2 border-primary shadow-none">
                <CardContent className="flex flex-col gap-4 p-6">
                  <h3 className="font-heading font-semibold">Com Reputamax</h3>
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
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* ─── Números de impacto ─── */}
      <section className="mx-auto w-full max-w-[1100px] px-4 py-20">
        <AnimateOnScroll>
          <div className="flex flex-col items-center gap-3 text-center">
            <Badge variant="secondary" className="bg-accent text-accent-foreground">
              Números de impacto
            </Badge>
            <h2 className="text-3xl font-heading font-bold tracking-tight">O peso real das avaliações</h2>
          </div>
        </AnimateOnScroll>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {impactNumbers.map((stat, i) => (
            <AnimateOnScroll key={stat.value} delay={i * 120}>
              <div className="flex flex-col items-center gap-2 text-center">
                <CountUp
                  value={stat.value}
                  className="text-4xl font-heading font-bold text-gradient"
                />
                <p className="text-sm text-foreground/80">{stat.description}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </section>

      {/* ─── Para quem é ─── */}
      <section className="border-y bg-surface">
        <div className="mx-auto flex w-full max-w-[1100px] flex-col items-center gap-3 px-4 py-20 text-center">
          <AnimateOnScroll>
            <div className="flex flex-col items-center gap-3">
              <Badge variant="secondary" className="bg-accent text-accent-foreground">
                Para quem é
              </Badge>
              <h2 className="text-3xl font-heading font-bold tracking-tight">
                Feito para negócios que querem crescer
              </h2>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll delay={200}>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {audiences.map((audience) => (
                <span
                  key={audience.label}
                  className="pill-hover flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-sm"
                >
                  <audience.icon className="size-4 text-primary" />
                  {audience.label}
                </span>
              ))}
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ─── Planos ─── */}
      <section className="mx-auto w-full max-w-[1100px] px-4 py-20">
        <AnimateOnScroll>
          <h2 className="text-center text-3xl font-heading font-bold tracking-tight">
            Planos simples, sem surpresa
          </h2>
        </AnimateOnScroll>
        <div className="mx-auto mt-12 grid max-w-3xl gap-6 md:grid-cols-2">
          <AnimateOnScroll>
            <Card className="card-hover-glow h-full rounded-xl border shadow-none">
              <CardContent className="flex flex-col gap-4 p-8">
                <h3 className="font-heading font-semibold">Essencial</h3>
                <p className="text-3xl font-heading font-bold">
                  R$ 97<span className="text-base font-normal text-foreground/80">/mês</span>
                </p>
                <ul className="flex flex-col gap-2 text-sm text-foreground/80">
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-success" />
                    Página de avaliação inteligente
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-success" />
                    QR code pronto pra imprimir
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-success" />
                    Dashboard de reputação
                  </li>
                </ul>
              </CardContent>
            </Card>
          </AnimateOnScroll>
          <AnimateOnScroll delay={200}>
            <Card className="card-hover-glow relative h-full rounded-xl border-2 border-primary shadow-none">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Mais popular</Badge>
              <CardContent className="flex flex-col gap-4 p-8">
                <h3 className="font-heading font-semibold">Pro</h3>
                <p className="text-3xl font-heading font-bold">
                  R$ 197<span className="text-base font-normal text-foreground/80">/mês</span>
                </p>
                <ul className="flex flex-col gap-2 text-sm text-foreground/80">
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-success" />
                    Tudo do Essencial
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-success" />
                    Respostas com IA
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-success" />
                    Comparação com concorrentes
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-success" />
                    Relatórios mensais
                  </li>
                </ul>
              </CardContent>
            </Card>
          </AnimateOnScroll>
        </div>
        <AnimateOnScroll>
          <p className="mt-6 text-center text-sm text-foreground/80">
            14 dias grátis em qualquer plano. Sem cartão de crédito.
          </p>
        </AnimateOnScroll>
      </section>

      {/* ─── FAQ ─── */}
      <section className="border-t bg-surface">
        <div className="mx-auto w-full max-w-2xl px-4 py-20">
          <AnimateOnScroll>
            <div className="flex flex-col items-center gap-3 text-center">
              <Badge variant="secondary" className="bg-accent text-accent-foreground">
                FAQ
              </Badge>
              <h2 className="text-3xl font-heading font-bold tracking-tight">Dúvidas frequentes</h2>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll delay={150}>
            <Accordion className="mt-10">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="py-4 text-base">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-foreground/80">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ─── CTA final ─── */}
      <section className="relative overflow-hidden border-t mesh-gradient">
        {/* Subtle dot grid overlay */}
        <div className="pointer-events-none absolute inset-0 dot-grid-bg opacity-30" />

        <div className="relative mx-auto flex w-full max-w-[1100px] flex-col items-center gap-6 px-4 py-24 text-center">
          <AnimateOnScroll>
            <div className="flex flex-col items-center gap-6">
              <Badge variant="secondary" className="bg-white/10 text-white">
                Última chance
              </Badge>
              <h2 className="text-3xl font-heading font-bold tracking-tight text-white md:text-4xl">
                Sua reputação não pode esperar
              </h2>
              <p className="max-w-lg text-white/70">
                Enquanto você lê isso, clientes estão pesquisando seu negócio no
                Google e decidindo se entram ou passam direto. Descubra como está sua
                reputação e comece a reverter o jogo.
              </p>
              <Button
                size="lg"
                className="btn-shimmer animate-pulse-glow"
                render={<Link href="/diagnostico" />}
              >
                Quero melhorar minha nota
              </Button>
              <ul className="flex flex-wrap items-center justify-center gap-4 text-sm font-medium text-white/80 mt-2">
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
          </AnimateOnScroll>
        </div>
      </section>
    </>
  );
}
