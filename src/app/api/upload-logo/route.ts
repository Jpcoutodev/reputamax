import { NextResponse } from "next/server";
import sharp from "sharp";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/config";

// sharp precisa do runtime Node
export const runtime = "nodejs";

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

/** Upload da logo do negócio: valida, redimensiona e salva no Storage. */
export async function POST(request: Request) {
  if (!supabaseAdminConfigured()) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }

  // auth + dono do negócio
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "nao_autenticado" }, { status: 401 });

  const admin = createAdminClient();
  const { data: business } = await admin
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!business) return NextResponse.json({ error: "sem_negocio" }, { status: 404 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "arquivo_ausente" }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Formato inválido. Use PNG, JPG, WEBP ou SVG." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Imagem muito grande (máx. 2 MB)." }, { status: 400 });
  }

  // redimensiona para no máx. 480px de lado, preservando transparência (PNG)
  let png: Buffer;
  try {
    const input = Buffer.from(await file.arrayBuffer());
    png = await sharp(input, { failOn: "none" })
      .resize(480, 480, { fit: "inside", withoutEnlargement: true })
      .png({ compressionLevel: 9 })
      .toBuffer();
  } catch (err) {
    console.error("[api/upload-logo] sharp:", err);
    return NextResponse.json({ error: "imagem_invalida" }, { status: 400 });
  }

  const path = `${business.id}/logo.png`;
  const { error: uploadError } = await admin.storage.from("logos").upload(path, png, {
    contentType: "image/png",
    upsert: true,
  });
  if (uploadError) {
    console.error("[api/upload-logo] upload:", uploadError.message);
    return NextResponse.json({ error: "erro_upload" }, { status: 500 });
  }

  const { data: pub } = admin.storage.from("logos").getPublicUrl(path);
  // cache-bust para o navegador buscar a versão nova após troca
  const url = `${pub.publicUrl}?v=${Date.now()}`;

  const { error: updateError } = await admin
    .from("businesses")
    .update({ logo_url: url })
    .eq("id", business.id);
  if (updateError) {
    console.error("[api/upload-logo] update:", updateError.message);
    return NextResponse.json({ error: "erro_interno" }, { status: 500 });
  }

  return NextResponse.json({ url });
}

/** Remove a logo do negócio. */
export async function DELETE() {
  if (!supabaseAdminConfigured()) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "nao_autenticado" }, { status: 401 });

  const admin = createAdminClient();
  const { data: business } = await admin
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!business) return NextResponse.json({ error: "sem_negocio" }, { status: 404 });

  await admin.storage.from("logos").remove([`${business.id}/logo.png`]);
  await admin.from("businesses").update({ logo_url: null }).eq("id", business.id);
  return NextResponse.json({ ok: true });
}
