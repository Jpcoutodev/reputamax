import type { Review, ReviewTheme } from "@/lib/providers/types";
import { findBusinessByPlaceId, type MockBusiness } from "./businesses";

/* PRNG determinístico (mulberry32) com seed derivado de string */
function hashString(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const firstNames = [
  "Ana", "Bruno", "Carla", "Daniel", "Eduarda", "Felipe", "Gabriela", "Henrique",
  "Isabela", "João", "Karina", "Lucas", "Mariana", "Nathan", "Olívia", "Paulo",
  "Quésia", "Rafael", "Sandra", "Thiago", "Vanessa", "Wagner", "Patrícia", "Marcos",
];

const lastNames = [
  "Silva", "Santos", "Oliveira", "Souza", "Costa", "Pereira", "Almeida", "Ferreira",
  "Rodrigues", "Lima", "Gomes", "Martins", "Araújo", "Ribeiro", "Carvalho", "Barbosa",
];

interface ReviewTemplate {
  text: string;
  themes: ReviewTheme[];
}

const positiveTemplates: ReviewTemplate[] = [
  { text: "Atendimento excelente, equipe muito atenciosa. Recomendo!", themes: ["atendimento"] },
  { text: "Fui super bem atendido, todos muito educados e prestativos.", themes: ["atendimento"] },
  { text: "Qualidade impecável, dá pra ver o capricho em cada detalhe.", themes: ["qualidade"] },
  { text: "Serviço de primeira, superou minhas expectativas.", themes: ["qualidade"] },
  { text: "Ambiente limpo e organizado, dá gosto de frequentar.", themes: ["limpeza"] },
  { text: "Preço justo pelo que entregam. Voltarei com certeza.", themes: ["preco", "qualidade"] },
  { text: "Tudo dentro do prazo combinado, sem surpresas. Profissionais sérios.", themes: ["prazo"] },
  { text: "Não esperei quase nada pra ser atendido, muito rápido.", themes: ["tempo_espera"] },
  { text: "Equipe atenciosa e ambiente impecável. Nota dez!", themes: ["atendimento", "limpeza"] },
  { text: "Melhor da região, qualidade e atendimento acima da média.", themes: ["qualidade", "atendimento"] },
];

const neutralTemplates: ReviewTemplate[] = [
  { text: "Bom serviço, mas o tempo de espera podia ser menor.", themes: ["tempo_espera"] },
  { text: "Atendimento ok, nada de excepcional. Cumpre o básico.", themes: ["atendimento"] },
  { text: "Qualidade boa, mas achei o preço um pouco salgado.", themes: ["preco", "qualidade"] },
  { text: "Gostei do resultado, só atrasou um pouco a entrega.", themes: ["prazo", "qualidade"] },
  { text: "Lugar razoável. Já fui melhor atendido em outras visitas.", themes: ["atendimento"] },
];

const negativeTemplates: ReviewTemplate[] = [
  { text: "Esperei mais de uma hora pra ser atendido. Falta organização.", themes: ["tempo_espera"] },
  { text: "Atendimento deixou muito a desejar, ninguém dava atenção.", themes: ["atendimento"] },
  { text: "Preço alto demais pelo que oferecem. Não compensa.", themes: ["preco"] },
  { text: "Prometeram um prazo e não cumpriram. Tive que cobrar várias vezes.", themes: ["prazo"] },
  { text: "Qualidade caiu muito. Não é mais como antes.", themes: ["qualidade"] },
  { text: "Local mal cuidado, banheiro sujo. Decepcionante.", themes: ["limpeza"] },
  { text: "Demora absurda e ninguém explica nada. Não volto.", themes: ["tempo_espera", "atendimento"] },
  { text: "Atrasaram a entrega e ainda cobraram a mais. Péssima experiência.", themes: ["prazo", "preco"] },
];

const ownerReplies = [
  "Muito obrigado pela avaliação! Ficamos felizes em atender você. 😊",
  "Agradecemos o carinho! Esperamos você em breve.",
  "Obrigado pelo feedback! Estamos sempre buscando melhorar.",
];

function pick<T>(rand: () => number, arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

/**
 * Gera 40–120 avaliações determinísticas a partir do placeId.
 * Mesmo negócio → mesmas avaliações, sempre.
 */
export function generateReviews(placeId: string): Review[] {
  const business = findBusinessByPlaceId(placeId);
  const rand = mulberry32(hashString(placeId));

  const count = business
    ? Math.min(120, Math.max(40, business.reviewCount))
    : 40 + Math.floor(rand() * 80);
  const avgRating = business?.rating ?? 4.0;
  const responseRate = business?.responseRate ?? 0.2;

  // distribuição de notas em torno da média do negócio
  const reviews: Review[] = [];
  const now = new Date("2026-06-01T12:00:00Z").getTime();

  for (let i = 0; i < count; i++) {
    const roll = rand();
    let rating: 1 | 2 | 3 | 4 | 5;
    const highBias = (avgRating - 3) / 2; // 0..1
    if (roll < 0.45 + highBias * 0.35) rating = 5;
    else if (roll < 0.65 + highBias * 0.25) rating = 4;
    else if (roll < 0.8) rating = 3;
    else if (roll < 0.9) rating = 2;
    else rating = 1;

    const template =
      rating >= 4
        ? pick(rand, positiveTemplates)
        : rating === 3
          ? pick(rand, neutralTemplates)
          : pick(rand, negativeTemplates);

    const replied = rand() < responseRate;
    const daysAgo = Math.floor(rand() * 540); // até ~18 meses
    const createdAt = new Date(now - daysAgo * 24 * 60 * 60 * 1000).toISOString();

    reviews.push({
      id: `${placeId}-rev-${i}`,
      authorName: `${pick(rand, firstNames)} ${pick(rand, lastNames)}`,
      rating,
      text: template.text,
      createdAt,
      replied,
      replyText: replied ? pick(rand, ownerReplies) : undefined,
      themes: template.themes,
    });
  }

  return reviews.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
