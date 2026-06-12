import type {
  BusinessSearchResult,
  CompetitorSnapshot,
  Review,
  ReviewDataProvider,
  ReviewTheme,
} from "../types";

/**
 * Google Places API (New) — busca, detalhes, avaliações (máx. 5) e concorrentes.
 *
 * SERVIDOR APENAS: a chave (GOOGLE_MAPS_API_KEY) não existe no browser.
 * Client components nunca chamam este provider — a busca passa por /api/places/search.
 *
 * Limitação conhecida: a Places API retorna no máximo 5 avaliações por negócio.
 * A sincronização completa virá da Google Business Profile API (aguardando aprovação).
 */

const BASE = "https://places.googleapis.com/v1";

function apiKey(): string {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    throw new Error(
      "GOOGLE_MAPS_API_KEY ausente — configure no .env.local ou use NEXT_PUBLIC_DATA_MODE=mock"
    );
  }
  return key;
}

async function placesFetch<T>(
  path: string,
  fieldMask: string,
  init?: { method?: string; body?: unknown }
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: init?.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey(),
      "X-Goog-FieldMask": fieldMask,
    },
    body: init?.body ? JSON.stringify(init.body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Places API ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.json() as Promise<T>;
}

/* ---------- mapeamento de respostas ---------- */

interface PlaceDto {
  id: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  rating?: number;
  userRatingCount?: number;
  primaryTypeDisplayName?: { text?: string };
  primaryType?: string;
  location?: { latitude: number; longitude: number };
  reviews?: ReviewDto[];
}

interface ReviewDto {
  name?: string;
  rating?: number;
  text?: { text?: string };
  originalText?: { text?: string };
  authorAttribution?: { displayName?: string };
  publishTime?: string;
}

function toSearchResult(place: PlaceDto): BusinessSearchResult {
  return {
    placeId: place.id,
    name: place.displayName?.text ?? "Negócio sem nome",
    address: place.formattedAddress ?? "",
    rating: place.rating ?? 0,
    reviewCount: place.userRatingCount ?? 0,
    category: place.primaryTypeDisplayName?.text ?? "",
  };
}

/** Tagger simples de temas por palavra-chave — alimenta a análise de sentimento
 *  enquanto a análise por LLM (fase Anthropic) não entra. */
const themeKeywords: Record<ReviewTheme, RegExp> = {
  tempo_espera: /esper|demor|fila|atras[oa]|horári|hora marcad/i,
  atendimento: /atend|educad|gentil|gross|simpátic|recep|equipe|funcionári/i,
  preco: /preç|caro|barat|valor|cobr|orçament|custo/i,
  qualidade: /qualidade|excelente|ótim|perfeit|ruim|péssim|capricho|profissional/i,
  limpeza: /limp|suj|higien|organiza/i,
  prazo: /prazo|entreg|combinad|promet/i,
};

function inferThemes(text: string): ReviewTheme[] {
  const themes = (Object.keys(themeKeywords) as ReviewTheme[]).filter((theme) =>
    themeKeywords[theme].test(text)
  );
  return themes.length > 0 ? themes : ["qualidade"];
}

function toReview(dto: ReviewDto, index: number, placeId: string): Review {
  const text = dto.text?.text ?? dto.originalText?.text ?? "";
  const rating = Math.min(5, Math.max(1, Math.round(dto.rating ?? 5))) as Review["rating"];
  return {
    id: dto.name ?? `${placeId}-google-${index}`,
    authorName: dto.authorAttribution?.displayName ?? "Cliente do Google",
    rating,
    text,
    createdAt: dto.publishTime ?? new Date().toISOString(),
    // a Places API não expõe respostas do dono — vem com a GBP API
    replied: false,
    themes: inferThemes(text),
  };
}

function haversineKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
): number {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/* ---------- provider ---------- */

export const googleReviewProvider: ReviewDataProvider = {
  async searchBusiness(query: string): Promise<BusinessSearchResult[]> {
    const data = await placesFetch<{ places?: PlaceDto[] }>(
      "/places:searchText",
      "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.primaryTypeDisplayName",
      {
        method: "POST",
        body: {
          textQuery: query,
          languageCode: "pt-BR",
          regionCode: "BR",
          maxResultCount: 6,
        },
      }
    );
    return (data.places ?? []).map(toSearchResult);
  },

  async getBusinessDetails(placeId: string): Promise<BusinessSearchResult> {
    const place = await placesFetch<PlaceDto>(
      `/places/${encodeURIComponent(placeId)}?languageCode=pt-BR`,
      "id,displayName,formattedAddress,rating,userRatingCount,primaryTypeDisplayName"
    );
    return toSearchResult(place);
  },

  async getReviews(placeId: string): Promise<Review[]> {
    const place = await placesFetch<PlaceDto>(
      `/places/${encodeURIComponent(placeId)}?languageCode=pt-BR`,
      "id,reviews"
    );
    return (place.reviews ?? []).map((dto, i) => toReview(dto, i, placeId));
  },

  async getCompetitors(placeId: string): Promise<CompetitorSnapshot[]> {
    const place = await placesFetch<PlaceDto>(
      `/places/${encodeURIComponent(placeId)}?languageCode=pt-BR`,
      "id,location,primaryType"
    );
    if (!place.location) return [];

    const body: Record<string, unknown> = {
      maxResultCount: 10,
      languageCode: "pt-BR",
      rankPreference: "POPULARITY",
      locationRestriction: {
        circle: { center: place.location, radius: 3000 },
      },
    };
    if (place.primaryType) {
      body.includedPrimaryTypes = [place.primaryType];
    }

    const data = await placesFetch<{ places?: PlaceDto[] }>(
      "/places:searchNearby",
      "places.id,places.displayName,places.rating,places.userRatingCount,places.location",
      { method: "POST", body }
    );

    return (data.places ?? [])
      .filter((p) => p.id !== place.id && p.rating !== undefined)
      .sort((a, b) => (b.userRatingCount ?? 0) - (a.userRatingCount ?? 0))
      .slice(0, 3)
      .map((p) => ({
        name: p.displayName?.text ?? "Concorrente",
        rating: p.rating ?? 0,
        reviewCount: p.userRatingCount ?? 0,
        distanceKm: p.location
          ? Math.round(haversineKm(place.location!, p.location) * 10) / 10
          : 0,
      }));
  },
};
