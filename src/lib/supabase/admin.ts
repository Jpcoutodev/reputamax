import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Client com service role — ignora RLS. Usar APENAS em rotas de API/server
 * (nunca importar em código que chega ao browser).
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
