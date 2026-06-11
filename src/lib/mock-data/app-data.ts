import { findBusinessBySlug, type MockBusiness } from "./businesses";

/** Negócio demo da área logada (na fase mock, todo login cai aqui) */
export const DEMO_SLUG = "clinica-sorriso";

export function getDemoBusiness(): MockBusiness {
  const b = findBusinessBySlug(DEMO_SLUG);
  if (!b) throw new Error("Negócio demo não encontrado nos mocks");
  return b;
}

export interface MetricSnapshot {
  date: string; // yyyy-MM-dd
  rating: number;
  reviewCount: number;
}

/** 90 dias de histórico com tendência discreta de melhora */
export function generateMetricSnapshots(business: MockBusiness): MetricSnapshot[] {
  const snapshots: MetricSnapshot[] = [];
  const end = new Date("2026-06-09T12:00:00Z");
  const startRating = business.rating - 0.3;
  const startCount = Math.max(1, business.reviewCount - Math.round(business.reviewsPerMonth * 3));

  for (let i = 89; i >= 0; i--) {
    const d = new Date(end.getTime() - i * 24 * 60 * 60 * 1000);
    const progress = (89 - i) / 89;
    // pequena oscilação determinística para o gráfico não ser uma reta
    const wobble = Math.sin((89 - i) / 7) * 0.04;
    const rating = Math.min(5, startRating + (business.rating - startRating) * progress + wobble);
    const reviewCount = Math.round(startCount + (business.reviewCount - startCount) * progress);
    snapshots.push({
      date: d.toISOString().slice(0, 10),
      rating: Math.round(rating * 100) / 100,
      reviewCount,
    });
  }
  return snapshots;
}

export interface FunnelResponse {
  id: string;
  rating: 1 | 2 | 3 | 4 | 5;
  redirectedToGoogle: boolean;
  feedbackText?: string;
  customerName?: string;
  customerContact?: string;
  resolved: boolean;
  createdAt: string; // ISO
}

/** ~15 respostas variadas do funil para o negócio demo */
export const demoFunnelResponses: FunnelResponse[] = [
  { id: "fr-01", rating: 5, redirectedToGoogle: true, resolved: false, createdAt: "2026-06-08T14:32:00Z" },
  { id: "fr-02", rating: 2, redirectedToGoogle: false, feedbackText: "Esperei 50 minutos mesmo com horário marcado. Acho que precisam rever a agenda.", customerName: "Roberta M.", customerContact: "(11) 98765-4321", resolved: false, createdAt: "2026-06-07T10:15:00Z" },
  { id: "fr-03", rating: 5, redirectedToGoogle: true, resolved: false, createdAt: "2026-06-06T18:40:00Z" },
  { id: "fr-04", rating: 4, redirectedToGoogle: true, resolved: false, createdAt: "2026-06-05T09:22:00Z" },
  { id: "fr-05", rating: 1, redirectedToGoogle: false, feedbackText: "Fui mal atendida na recepção, a moça foi grossa comigo. Saí sem ser atendida.", customerName: "Cláudia S.", resolved: false, createdAt: "2026-06-03T16:05:00Z" },
  { id: "fr-06", rating: 5, redirectedToGoogle: true, resolved: false, createdAt: "2026-06-02T11:48:00Z" },
  { id: "fr-07", rating: 3, redirectedToGoogle: false, feedbackText: "O atendimento foi bom mas o orçamento veio bem mais caro do que falaram por telefone.", customerName: "Pedro A.", customerContact: "pedro.alves@email.com", resolved: true, createdAt: "2026-05-30T15:30:00Z" },
  { id: "fr-08", rating: 5, redirectedToGoogle: true, resolved: false, createdAt: "2026-05-28T13:12:00Z" },
  { id: "fr-09", rating: 4, redirectedToGoogle: true, resolved: false, createdAt: "2026-05-26T17:55:00Z" },
  { id: "fr-10", rating: 2, redirectedToGoogle: false, feedbackText: "A sala de espera estava cheia e abafada. Faltou organização nos horários.", resolved: true, createdAt: "2026-05-24T10:02:00Z" },
  { id: "fr-11", rating: 5, redirectedToGoogle: true, resolved: false, createdAt: "2026-05-21T14:20:00Z" },
  { id: "fr-12", rating: 5, redirectedToGoogle: true, resolved: false, createdAt: "2026-05-18T09:45:00Z" },
  { id: "fr-13", rating: 3, redirectedToGoogle: false, feedbackText: "Dentista ótimo, mas demoraram muito pra me chamar.", customerName: "Fernando L.", resolved: false, createdAt: "2026-05-15T16:38:00Z" },
  { id: "fr-14", rating: 4, redirectedToGoogle: true, resolved: false, createdAt: "2026-05-12T11:10:00Z" },
  { id: "fr-15", rating: 5, redirectedToGoogle: true, resolved: false, createdAt: "2026-05-09T15:27:00Z" },
];
