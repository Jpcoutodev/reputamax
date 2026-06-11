"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { GoogleIcon } from "@/components/google-icon";

const loginSchema = z.object({
  email: z.string().email("Digite um e-mail válido."),
  password: z.string().min(6, "A senha tem pelo menos 6 caracteres."),
});

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const next: typeof errors = {};
      for (const issue of parsed.error.issues) {
        next[issue.path[0] as "email" | "password"] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setSubmitting(true);
    // fase mock: auth real (Supabase) entra na fase 2
    await new Promise((r) => setTimeout(r, 600));
    router.push("/dashboard");
  }

  return (
    <Card className="w-full max-w-sm rounded-xl border shadow-none">
      <CardContent className="flex flex-col gap-6 p-8">
        <div className="flex flex-col gap-1 text-center">
          <h1 className="text-xl font-medium tracking-tight">Entrar na sua conta</h1>
          <p className="text-sm text-muted-foreground">
            Bem-vindo de volta! Acesse seu painel de reputação.
          </p>
        </div>

        <Button variant="outline" type="button" onClick={() => router.push("/dashboard")}>
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
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
              <Link
                href="#"
                className="text-xs text-primary underline-offset-4 hover:underline"
              >
                Esqueci minha senha
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={Boolean(errors.password)}
            />
            {errors.password ? (
              <p className="text-sm text-danger">{errors.password}</p>
            ) : null}
          </div>
          <Button type="submit" disabled={submitting}>
            {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
            Entrar
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Ainda não tem conta?{" "}
          <Link href="/cadastro" className="text-primary underline-offset-4 hover:underline">
            Comece grátis
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
