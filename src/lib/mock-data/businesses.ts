import type { BusinessSearchResult, CompetitorSnapshot } from "@/lib/providers/types";

export interface MockBusiness extends BusinessSearchResult {
  slug: string;
  /** taxa de resposta às avaliações, 0–1 — alimenta o diagnóstico */
  responseRate: number;
  /** avaliações novas por mês */
  reviewsPerMonth: number;
}

export const mockBusinesses: MockBusiness[] = [
  {
    placeId: "clinica-sorriso-sumare",
    slug: "clinica-sorriso",
    name: "Clínica Sorriso Sumaré",
    category: "Clínica odontológica",
    address: "Av. Sumaré, 1240 — Perdizes, São Paulo - SP",
    rating: 4.2,
    reviewCount: 87,
    responseRate: 0.18,
    reviewsPerMonth: 3,
  },
  {
    placeId: "restaurante-sabor-da-serra",
    slug: "sabor-da-serra",
    name: "Restaurante Sabor da Serra",
    category: "Restaurante",
    address: "R. das Hortênsias, 88 — Centro, Campos do Jordão - SP",
    rating: 4.6,
    reviewCount: 412,
    responseRate: 0.62,
    reviewsPerMonth: 14,
  },
  {
    placeId: "oficina-do-carlao",
    slug: "oficina-do-carlao",
    name: "Oficina do Carlão",
    category: "Oficina mecânica",
    address: "R. Marechal Deodoro, 455 — Vila Industrial, Campinas - SP",
    rating: 3.8,
    reviewCount: 54,
    responseRate: 0.05,
    reviewsPerMonth: 2,
  },
  {
    placeId: "barbearia-navalha-de-ouro",
    slug: "navalha-de-ouro",
    name: "Barbearia Navalha de Ouro",
    category: "Barbearia",
    address: "R. Augusta, 2301 — Jardins, São Paulo - SP",
    rating: 4.7,
    reviewCount: 203,
    responseRate: 0.71,
    reviewsPerMonth: 9,
  },
  {
    placeId: "petshop-amigo-fiel",
    slug: "amigo-fiel",
    name: "Petshop Amigo Fiel",
    category: "Pet shop",
    address: "Av. Brasil, 870 — Jardim América, Goiânia - GO",
    rating: 4.4,
    reviewCount: 138,
    responseRate: 0.33,
    reviewsPerMonth: 6,
  },
  {
    placeId: "academia-corpo-em-forma",
    slug: "corpo-em-forma",
    name: "Academia Corpo em Forma",
    category: "Academia",
    address: "R. Padre Anchieta, 1500 — Bigorrilho, Curitiba - PR",
    rating: 4.1,
    reviewCount: 96,
    responseRate: 0.12,
    reviewsPerMonth: 4,
  },
  {
    placeId: "pizzaria-forno-de-minas",
    slug: "forno-de-minas",
    name: "Pizzaria Forno de Minas",
    category: "Pizzaria",
    address: "Av. do Contorno, 6120 — Savassi, Belo Horizonte - MG",
    rating: 4.5,
    reviewCount: 321,
    responseRate: 0.45,
    reviewsPerMonth: 11,
  },
  {
    placeId: "salao-bela-vida",
    slug: "bela-vida",
    name: "Salão Bela Vida",
    category: "Salão de beleza",
    address: "R. Quinze de Novembro, 230 — Centro, Florianópolis - SC",
    rating: 4.3,
    reviewCount: 75,
    responseRate: 0.25,
    reviewsPerMonth: 3,
  },
  {
    placeId: "auto-center-roda-viva",
    slug: "roda-viva",
    name: "Auto Center Roda Viva",
    category: "Auto center",
    address: "Av. Fernandes Lima, 980 — Farol, Maceió - AL",
    rating: 3.9,
    reviewCount: 62,
    responseRate: 0.08,
    reviewsPerMonth: 2,
  },
  {
    placeId: "clinica-vet-sao-francisco",
    slug: "vet-sao-francisco",
    name: "Clínica Vet São Francisco",
    category: "Clínica veterinária",
    address: "R. Barão do Rio Branco, 410 — Centro, Fortaleza - CE",
    rating: 4.8,
    reviewCount: 156,
    responseRate: 0.82,
    reviewsPerMonth: 8,
  },
  {
    placeId: "padaria-pao-dourado",
    slug: "pao-dourado",
    name: "Padaria Pão Dourado",
    category: "Padaria",
    address: "R. Coronel Vicente, 67 — Moinhos de Vento, Porto Alegre - RS",
    rating: 4.0,
    reviewCount: 89,
    responseRate: 0.1,
    reviewsPerMonth: 4,
  },
  {
    placeId: "estetica-pele-de-seda",
    slug: "pele-de-seda",
    name: "Estética Pele de Seda",
    category: "Clínica de estética",
    address: "Av. Boa Viagem, 3340 — Boa Viagem, Recife - PE",
    rating: 4.9,
    reviewCount: 47,
    responseRate: 0.9,
    reviewsPerMonth: 5,
  },
];

export function findBusinessByPlaceId(placeId: string): MockBusiness | undefined {
  return mockBusinesses.find((b) => b.placeId === placeId);
}

export function findBusinessBySlug(slug: string): MockBusiness | undefined {
  return mockBusinesses.find((b) => b.slug === slug);
}

/** 3 concorrentes por negócio, sempre com pelo menos um acima do negócio analisado */
const competitorNamesByCategory: Record<string, string[]> = {
  "Clínica odontológica": ["OdontoPrime Perdizes", "Clínica Dental Vida", "Sorria Mais Odontologia"],
  Restaurante: ["Cantina da Montanha", "Bistrô Alto da Serra", "Restaurante Dona Filó"],
  "Oficina mecânica": ["Mecânica Irmãos Silva", "Auto Mecânica Precision", "Oficina São Jorge"],
  Barbearia: ["Barber House Premium", "Dom Corte Barbearia", "Barbearia El Clássico"],
  "Pet shop": ["Mundo Pet Center", "PetLove Banho & Tosa", "Bicho Chique Pet"],
  Academia: ["SmartFit Bigorrilho", "Academia Energia Total", "Studio Fit Premium"],
  Pizzaria: ["Pizzaria Bella Napoli", "Forneria 350 Graus", "Pizza & Cia Savassi"],
  "Salão de beleza": ["Espaço Glamour", "Studio Hair Design", "Salão Mãos de Fada"],
  "Auto center": ["Pneubom Auto Center", "Centro Automotivo Líder", "MaxCar Serviços"],
  "Clínica veterinária": ["Hospital Vet 24h", "Clínica Animal Care", "Vet Center Aldeota"],
  Padaria: ["Padaria Estrela do Sul", "Panificadora Trigo Real", "Confeitaria Doce Aroma"],
  "Clínica de estética": ["Espaço Corpo & Alma", "Clínica Renove Estética", "Bella Pelle Estética"],
};

export function getCompetitorsFor(business: MockBusiness): CompetitorSnapshot[] {
  const names = competitorNamesByCategory[business.category] ?? [
    "Concorrente Alfa",
    "Concorrente Beta",
    "Concorrente Gama",
  ];
  // determinístico: derivado da nota do próprio negócio, com o primeiro sempre acima
  return [
    {
      name: names[0],
      rating: Math.min(5, Math.round((business.rating + 0.4) * 10) / 10),
      reviewCount: Math.round(business.reviewCount * 1.8),
      distanceKm: 0.8,
    },
    {
      name: names[1],
      rating: Math.min(5, Math.round((business.rating + 0.1) * 10) / 10),
      reviewCount: Math.round(business.reviewCount * 1.2),
      distanceKm: 1.5,
    },
    {
      name: names[2],
      rating: Math.max(1, Math.round((business.rating - 0.3) * 10) / 10),
      reviewCount: Math.round(business.reviewCount * 0.6),
      distanceKm: 2.3,
    },
  ];
}
