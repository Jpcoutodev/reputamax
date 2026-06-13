import type {
  AnalysisProvider,
  AnalyzeOptions,
  BusinessSearchResult,
  CompetitorSnapshot,
  DiagnosisResult,
  Review,
  ReviewTheme,
  SentimentTheme,
} from "../types";
import { findBusinessByPlaceId } from "@/lib/mock-data/businesses";

const themeLabels: Record<ReviewTheme, string> = {
  tempo_espera: "Tempo de espera",
  atendimento: "Atendimento",
  preco: "Preço",
  qualidade: "Qualidade",
  limpeza: "Limpeza",
  prazo: "Prazo de entrega",
};

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function buildSentimentThemes(reviews: Review[]): SentimentTheme[] {
  const buckets = new Map<string, { count: number; critica: number; examples: string[] }>();
  for (const review of reviews) {
    for (const theme of review.themes) {
      const bucket = buckets.get(theme) ?? { count: 0, critica: 0, examples: [] };
      bucket.count++;
      if (review.rating <= 3) bucket.critica++;
      if (bucket.examples.length < 2) bucket.examples.push(review.text);
      buckets.set(theme, bucket);
    }
  }
  return [...buckets.entries()]
    .map(([theme, b]) => ({
      theme: themeLabels[theme as ReviewTheme] ?? theme,
      type: (b.critica / b.count > 0.5 ? "critica" : "elogio") as "critica" | "elogio",
      pct: Math.round((b.count / reviews.length) * 100),
      examples: b.examples,
    }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 6);
}

export const mockAnalysisProvider: AnalysisProvider = {
  async analyzeReviews(
    business: BusinessSearchResult,
    reviews: Review[],
    competitors: CompetitorSnapshot[],
    options: AnalyzeOptions = {}
  ): Promise<DiagnosisResult> {
    await new Promise((r) => setTimeout(r, 400 + Math.random() * 300));

    // a fonte expõe respostas do dono? (Places API não → não penaliza o score)
    const responseDataAvailable = options.responseDataAvailable ?? true;

    const mock = findBusinessByPlaceId(business.placeId);
    // sem concorrentes encontrados (possível em modo live), gap = 0
    const avgCompetitorRating =
      competitors.length > 0
        ? competitors.reduce((sum, c) => sum + c.rating, 0) / competitors.length
        : business.rating;
    const ratingGap = Math.round((business.rating - avgCompetitorRating) * 10) / 10;

    const repliedCount = reviews.filter((r) => r.replied).length;
    const responseRatePct = Math.round((repliedCount / (reviews.length || 1)) * 100);

    // live: estimativa conservadora (perfis acumulam avaliações ao longo de ~2 anos)
    const reviewsPerMonth =
      mock?.reviewsPerMonth ?? Math.max(1, Math.round(business.reviewCount / 24));
    const expectedReviewsPerMonth = Math.max(8, Math.round(reviewsPerMonth * 2.5));

    const negativePct =
      (reviews.filter((r) => r.rating <= 3).length / (reviews.length || 1)) * 100;

    // score = média ponderada determinística.
    // Pesos: nota relativa 35%, taxa de resposta 25%, ritmo 20%, % críticas 20%.
    // Sem dado de resposta, os 25% são redistribuídos entre os 3 fatores
    // mensuráveis (a régua segue 0–100, sem penalizar o que não medimos).
    const ratingScore = clamp(((business.rating - avgCompetitorRating + 1) / 2) * 100, 0, 100);
    const paceScore = clamp((reviewsPerMonth / expectedReviewsPerMonth) * 100, 0, 100);
    const negativeScore = clamp(100 - negativePct * 2, 0, 100);

    let score: number;
    if (responseDataAvailable) {
      const responseScore = responseRatePct;
      score = Math.round(
        ratingScore * 0.35 + responseScore * 0.25 + paceScore * 0.2 + negativeScore * 0.2
      );
    } else {
      // pesos normalizados sem a taxa de resposta (0.35 + 0.20 + 0.20 = 0.75)
      score = Math.round(
        (ratingScore * 0.35 + paceScore * 0.2 + negativeScore * 0.2) / 0.75
      );
    }

    const sentimentThemes = buildSentimentThemes(reviews);
    const topCritica = sentimentThemes.find((t) => t.type === "critica");

    // problema #1 muda conforme temos (ou não) dado de resposta
    const firstIssue =
      responseDataAvailable && responseRatePct < 50
        ? `Você responde apenas ${responseRatePct}% das avaliações — clientes em potencial percebem o silêncio como descaso.`
        : ratingGap < 0
          ? `Sua nota está ${Math.abs(ratingGap).toFixed(1)} ponto abaixo da média dos concorrentes próximos — cada décimo conta na busca local.`
          : "Seu volume de avaliações é baixo para o seu porte, o que limita sua prova social e visibilidade no Google.";

    const criticalIssues = [
      firstIssue,
      `Seu negócio recebe ~${reviewsPerMonth} avaliações/mês, mas negócios do seu porte deveriam receber ~${expectedReviewsPerMonth} — você está perdendo prova social todos os meses.`,
      topCritica
        ? `"${topCritica.theme}" aparece em ${topCritica.pct}% das avaliações como crítica recorrente — e está visível para qualquer cliente que pesquisa você no Google.`
        : `${Math.round(negativePct)}% das suas avaliações são neutras ou negativas e estão públicas no Google.`,
    ];

    const responseRec = responseDataAvailable
      ? `Responda 100% das avaliações ${responseRatePct < 50 ? "— hoje você responde só " + responseRatePct + "%" : "para manter sua taxa alta"}: respostas mostram ao Google e aos clientes que o negócio é ativo.`
      : "Responda 100% das avaliações, positivas e negativas: respostas mostram ao Google e aos clientes que o negócio é ativo e cuida da relação.";

    const recommendations = [
      "Automatize o pedido de avaliações: peça a nota a cada cliente atendido com um QR code ou link — clientes satisfeitos avaliam quando o pedido chega na hora certa.",
      "Intercepte críticas antes de virarem públicas: direcione notas baixas para um canal privado de feedback e resolva o problema direto com o cliente.",
      responseRec,
      topCritica
        ? `Ataque a causa raiz de "${topCritica.theme.toLowerCase()}": é o tema mais citado nas críticas e o que mais derruba sua nota.`
        : "Monitore semanalmente os temas das críticas para agir antes que virem padrão.",
      competitors.length > 0
        ? `Acompanhe seus 3 concorrentes diretos: o líder da sua região tem nota ${Math.max(...competitors.map((c) => c.rating)).toFixed(1)} — cada décimo de diferença muda sua posição no mapa do Google.`
        : "Monitore os concorrentes diretos da sua região: cada décimo de nota muda sua posição no mapa do Google.",
    ];

    const summary =
      `${business.name} tem nota ${business.rating.toFixed(1)} com ${business.reviewCount} avaliações — ` +
      (ratingGap < 0
        ? `${Math.abs(ratingGap).toFixed(1)} ponto abaixo da média dos concorrentes próximos (${avgCompetitorRating.toFixed(1)}). `
        : `ligeiramente acima da média dos concorrentes próximos (${avgCompetitorRating.toFixed(1)}). `) +
      (responseDataAvailable
        ? `A taxa de resposta às avaliações é de ${responseRatePct}% e o `
        : `O `) +
      `ritmo atual é de ~${reviewsPerMonth} novas avaliações por mês, ` +
      `abaixo do potencial estimado de ${expectedReviewsPerMonth}. ` +
      (topCritica
        ? `O tema "${topCritica.theme}" concentra as críticas recorrentes e merece atenção imediata. `
        : "") +
      `Com um processo ativo de coleta e resposta, a nota tende a subir nos próximos 60–90 dias.`;

    return {
      score,
      ratingGapVsCompetitors: ratingGap,
      responseRatePct,
      responseDataAvailable,
      reviewsPerMonth,
      expectedReviewsPerMonth,
      sentimentThemes,
      criticalIssues,
      recommendations,
      summary,
    };
  },

  async suggestReply(
    review: Review,
    businessName: string,
    tone: "formal" | "amigavel"
  ): Promise<string> {
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
    const firstName = review.authorName.split(" ")[0];

    if (review.rating >= 4) {
      return tone === "amigavel"
        ? `Oi, ${firstName}! Que alegria ler isso 😊 Obrigado por dedicar um tempinho pra avaliar a ${businessName}. Esperamos você de novo em breve!`
        : `Prezado(a) ${firstName}, agradecemos sua avaliação. É muito gratificante saber que sua experiência na ${businessName} foi positiva. Esperamos atendê-lo(a) novamente.`;
    }
    if (review.rating === 3) {
      return tone === "amigavel"
        ? `Oi, ${firstName}! Obrigado pelo retorno sincero. Queremos melhorar exatamente nesses pontos — se puder, chama a gente pra contar mais detalhes. Sua opinião faz diferença de verdade!`
        : `Prezado(a) ${firstName}, agradecemos seu feedback. Registramos suas observações e estamos trabalhando para melhorar. Ficamos à disposição para conversar pelos nossos canais de atendimento.`;
    }
    return tone === "amigavel"
      ? `Oi, ${firstName}. Sentimos muito pela experiência — não é esse o padrão que buscamos na ${businessName}. Queremos resolver isso pessoalmente: pode nos chamar pelo telefone ou WhatsApp? Vamos cuidar do seu caso com prioridade.`
      : `Prezado(a) ${firstName}, lamentamos sinceramente o ocorrido. Sua experiência não reflete o padrão de atendimento da ${businessName}. Pedimos que entre em contato conosco para que possamos resolver a situação adequadamente.`;
  },
};
