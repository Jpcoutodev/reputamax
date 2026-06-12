/**
 * Seed do banco (dev): cria usuário demo + negócio clinica-sorriso com
 * avaliações, 90 dias de métricas e respostas de funil.
 *
 * Uso: npm run seed
 * Requer .env.local com NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import { findBusinessBySlug } from "../src/lib/mock-data/businesses";
import { generateReviews } from "../src/lib/mock-data/review-generator";
import {
  demoFunnelResponses,
  generateMetricSnapshots,
} from "../src/lib/mock-data/app-data";

const DEMO_SLUG = "clinica-sorriso";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error(
      "✗ Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local antes de rodar o seed."
    );
    process.exit(1);
  }

  const email = process.env.SEED_DEMO_EMAIL ?? "demo@reputamax.app";
  const password = process.env.SEED_DEMO_PASSWORD ?? "reputamax123";
  if (!process.env.SEED_DEMO_PASSWORD) {
    console.warn(
      "⚠ SEED_DEMO_PASSWORD não definido — usando senha padrão 'reputamax123' (apenas dev!)."
    );
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. usuário demo
  let userId: string;
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createError) {
    // provavelmente já existe — procura
    const { data: list, error: listError } = await admin.auth.admin.listUsers();
    if (listError) throw listError;
    const existing = list.users.find((u) => u.email === email);
    if (!existing) throw createError;
    userId = existing.id;
    console.log(`• Usuário demo já existia: ${email}`);
  } else {
    userId = created.user.id;
    console.log(`✓ Usuário demo criado: ${email}`);
  }

  // 2. negócio demo (idempotente por slug)
  const { data: existingBusiness } = await admin
    .from("businesses")
    .select("id")
    .eq("slug", DEMO_SLUG)
    .maybeSingle();
  if (existingBusiness) {
    console.log(`• Negócio '${DEMO_SLUG}' já existe — seed já foi rodado. Nada a fazer.`);
    return;
  }

  const mock = findBusinessBySlug(DEMO_SLUG);
  if (!mock) throw new Error(`Mock '${DEMO_SLUG}' não encontrado`);

  const { data: business, error: businessError } = await admin
    .from("businesses")
    .insert({
      owner_id: userId,
      name: mock.name,
      slug: mock.slug,
      category: mock.category,
      address: mock.address,
      google_place_id: mock.placeId,
      review_link: `https://search.google.com/local/writereview?placeid=${mock.placeId}`,
    })
    .select("id")
    .single();
  if (businessError) throw businessError;
  console.log(`✓ Negócio criado: ${mock.name} (/r/${mock.slug})`);

  // 3. avaliações
  const reviews = generateReviews(mock.placeId);
  const { error: reviewsError } = await admin.from("reviews").insert(
    reviews.map((r) => ({
      business_id: business.id,
      external_id: r.id,
      author_name: r.authorName,
      rating: r.rating,
      text: r.text,
      replied: r.replied,
      reply_text: r.replyText ?? null,
      review_created_at: r.createdAt,
    }))
  );
  if (reviewsError) throw reviewsError;
  console.log(`✓ ${reviews.length} avaliações inseridas`);

  // 4. métricas (90 dias)
  const snapshots = generateMetricSnapshots(mock);
  const { error: snapshotsError } = await admin.from("metric_snapshots").insert(
    snapshots.map((s) => ({
      business_id: business.id,
      date: s.date,
      rating: s.rating,
      review_count: s.reviewCount,
    }))
  );
  if (snapshotsError) throw snapshotsError;
  console.log(`✓ ${snapshots.length} dias de métricas inseridos`);

  // 5. respostas do funil
  const { error: funnelError } = await admin.from("funnel_responses").insert(
    demoFunnelResponses.map((f) => ({
      business_id: business.id,
      rating: f.rating,
      redirected_to_google: f.redirectedToGoogle,
      feedback_text: f.feedbackText ?? null,
      customer_name: f.customerName ?? null,
      customer_contact: f.customerContact ?? null,
      resolved: f.resolved,
      created_at: f.createdAt,
    }))
  );
  if (funnelError) throw funnelError;
  console.log(`✓ ${demoFunnelResponses.length} respostas de funil inseridas`);

  console.log(`\nPronto! Faça login com ${email} / ${password}`);
}

main().catch((err) => {
  console.error("✗ Seed falhou:", err);
  process.exit(1);
});
