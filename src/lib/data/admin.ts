import "server-only";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/config";

export interface AdminUser {
  userId: string;
  email: string;
}

/** Usuário logado se for admin; null caso contrário (deduplicado por request). */
export const getAdminUser = cache(async (): Promise<AdminUser | null> => {
  if (!supabaseAdminConfigured()) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data } = await admin
    .from("admins")
    .select("user_id, email")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!data) return null;

  return { userId: data.user_id, email: data.email };
});

/**
 * Guard das páginas /admin: exige login + presença na tabela admins.
 * Não-admins recebem 404 (a área nem "existe" para eles).
 */
export async function requireAdmin(): Promise<AdminUser> {
  if (!supabaseAdminConfigured()) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/admin");

  const adminUser = await getAdminUser();
  if (!adminUser) notFound();
  return adminUser;
}
