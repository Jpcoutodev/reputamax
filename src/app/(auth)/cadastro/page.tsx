"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { BadgeCheck, Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { GoogleIcon } from "@/components/google-icon";
import { createClient } from "@/lib/supabase/client";

const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const cadastroSchema = z.object({
  name: z.string().min(2, "Digite seu nome."),
  email: z.string().email("Digite um e-mail válido."),
  password: z.string().min(6, "Crie uma senha com pelo menos 6 caracteres."),
});

type FieldErrors = Partial<Record<"name" | "email" | "password", string>>;

function CadastroForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const diagnosticoId = searchParams.get("diagnostico");
  const [businessName, setBusinessName] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  useEffect(() => {
    if (!diagnosticoId) return;
    // busca o nome do negócio do diagnóstico para o banner
    fetch(`/api/diagnostico/${diagnosticoId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.business?.name) setBusinessName(data.business.name);
      })
      .catch(() => {});
  }, [diagnosticoId]);

  async function createBusinessAndEnter() {
    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(diagnosticoId ? { diagnosticoId } : {}),
    });
    if (!res.ok) {
      // conta criada mas business falhou — o layout da área logada recria
      console.error("[cadastro] onboarding falhou:", res.status);
    }
    router.push("/dashboard");
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = cadastroSchema.safeParse({ name, email, password });
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        next[issue.path[0] as keyof FieldErrors] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setSubmitting(true);

    if (!supabaseConfigured) {
      // modo demonstração (sem .env.local)
      await new Promise((r) => setTimeout(r, 800));
      router.push("/dashboard");
      return;
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: { data: { full_name: parsed.data.name } },
    });

    if (error) {
      setSubmitting(false);
      toast.error(
        error.message.includes("already registered")
          ? "Este e-mail já tem conta. Faça login."
          : "Não foi possível criar a conta. Tente novamente."
      );
      return;
    }

    if (data.session) {
      // confirmação de e-mail desativada → já entra
      await createBusinessAndEnter();
    } else {
      // confirmação de e-mail ativada no projeto Supabase
      setSubmitting(false);
      setAwaitingConfirmation(true);
    }
  }

  async function handleGoogle() {
    if (!supabaseConfigured) {
      router.push("/dashboard");
      return;
    }
    const supabase = createClient();
    const next = diagnosticoId
      ? `/dashboard?diagnostico=${diagnosticoId}`
      : "/dashboard";
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${next}` },
    });
    if (error) {
      toast.error("Cadastro com Google indisponível no momento. Use e-mail e senha.");
    }
  }

  if (awaitingConfirmation) {
    return (
      <Card className="w-full max-w-sm rounded-xl border shadow-none">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <MailCheck className="size-10 text-success" />
          <h1 className="text-xl font-medium tracking-tight">Confirme seu e-mail</h1>
          <p className="text-sm text-muted-foreground">
            Enviamos um link de confirmação para <strong>{email}</strong>. Clique
            nele para ativar sua conta e entrar.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm rounded-xl border shadow-none">
      <CardContent className="flex flex-col gap-6 p-8">
        <div className="flex flex-col gap-1 text-center">
          <h1 className="text-xl font-medium tracking-tight">Comece seus 14 dias grátis</h1>
          <p className="text-sm text-muted-foreground">
            Sem cartão de crédito. Cancele quando quiser.
          </p>
        </div>

        {businessName ? (
          <div className="flex items-center gap-2 rounded-lg bg-success-soft px-4 py-3 text-sm">
            <BadgeCheck className="size-4 shrink-0 text-success" />
            <span>
              Sua conta será criada com os dados de <strong>{businessName}</strong> já
              preenchidos.
            </span>
          </div>
        ) : null}

        <Button variant="outline" type="button" onClick={handleGoogle}>
          <GoogleIcon className="size-4" />
          Continuar com Google
        </Button>

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">ou</span>
          <Separator className="flex-1" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Seu nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Maria Souza"
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name ? <p className="text-sm text-danger">{errors.name}</p> : null}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@seunegocio.com.br"
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email ? <p className="text-sm text-danger">{errors.email}</p> : null}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo de 6 caracteres"
              aria-invalid={Boolean(errors.password)}
            />
            {errors.password ? (
              <p className="text-sm text-danger">{errors.password}</p>
            ) : null}
          </div>
          <Button type="submit" disabled={submitting}>
            {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
            Criar conta grátis
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link href="/login" className="text-primary underline-offset-4 hover:underline">
            Entrar
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function CadastroPage() {
  return (
    <Suspense fallback={<Skeleton className="h-[560px] w-full max-w-sm rounded-xl" />}>
      <CadastroForm />
    </Suspense>
  );
}
