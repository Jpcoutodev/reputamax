"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { updateBusinessProfile } from "@/app/(app)/actions";

const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

interface SettingsFormsProps {
  initialName: string;
  initialCategory: string;
  initialAddress: string;
  initialTone: "amigavel" | "formal";
  accountEmail: string;
  slug: string;
}

export function SettingsForms({
  initialName,
  initialCategory,
  initialAddress,
  initialTone,
  accountEmail,
  slug,
}: SettingsFormsProps) {
  const [name, setName] = useState(initialName);
  const [category, setCategory] = useState(initialCategory);
  const [address, setAddress] = useState(initialAddress);
  const [tone, setTone] = useState<"amigavel" | "formal">(initialTone);
  const [savingBusiness, setSavingBusiness] = useState(false);

  const [email, setEmail] = useState(accountEmail);
  const [password, setPassword] = useState("");
  const [savingAccount, setSavingAccount] = useState(false);

  async function handleSaveBusiness(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) {
      toast.error("O nome do negócio precisa ter pelo menos 2 caracteres.");
      return;
    }
    setSavingBusiness(true);
    const result = await updateBusinessProfile({
      name: name.trim(),
      category: category.trim(),
      address: address.trim(),
      tone,
    });
    setSavingBusiness(false);
    if (!result.ok) {
      toast.error(result.error ?? "Não foi possível salvar. Tente de novo.");
      return;
    }
    toast.success(
      result.demo ? "Dados salvos (modo demonstração)." : "Dados do negócio salvos!"
    );
  }

  async function handleSaveAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!supabaseConfigured) {
      toast.success("Dados da conta salvos (modo demonstração).");
      return;
    }
    setSavingAccount(true);
    const supabase = createClient();
    const updates: { email?: string; password?: string } = {};
    if (email && email !== accountEmail) updates.email = email;
    if (password) updates.password = password;

    if (!updates.email && !updates.password) {
      setSavingAccount(false);
      toast.info("Nada para salvar — altere o e-mail ou a senha primeiro.");
      return;
    }

    const { error } = await supabase.auth.updateUser(updates);
    setSavingAccount(false);
    if (error) {
      toast.error("Não foi possível atualizar a conta. Tente de novo.");
      return;
    }
    setPassword("");
    toast.success(
      updates.email
        ? "Enviamos um link de confirmação para o novo e-mail."
        : "Senha atualizada!"
    );
  }

  return (
    <>
      <Card className="rounded-xl border shadow-none">
        <CardContent className="p-6">
          <form onSubmit={handleSaveBusiness} className="flex flex-col gap-5">
            <h2 className="font-medium">Dados do negócio</h2>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="businessName">Nome</Label>
              <Input
                id="businessName"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="slug">Endereço da página</Label>
                <Input id="slug" value={`reputamax.app/r/${slug}`} disabled />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <Separator />

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tone">Tom de voz das respostas com IA</Label>
              <Select
                value={tone}
                onValueChange={(v) => setTone((v ?? "amigavel") as typeof tone)}
              >
                <SelectTrigger id="tone" className="w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="amigavel">Amigável — próximo e caloroso</SelectItem>
                  <SelectItem value="formal">Formal — profissional e direto</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Usado quando a IA sugere respostas às suas avaliações.
              </p>
            </div>

            <div>
              <Button type="submit" disabled={savingBusiness}>
                {savingBusiness ? <Loader2 className="size-4 animate-spin" /> : null}
                Salvar alterações
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-xl border shadow-none">
        <CardContent className="p-6">
          <form onSubmit={handleSaveAccount} className="flex flex-col gap-5">
            <h2 className="font-medium">Sua conta</h2>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="accountEmail">E-mail de acesso</Label>
              <Input
                id="accountEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Nova senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Deixe em branco para manter"
              />
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={savingAccount}>
                {savingAccount ? <Loader2 className="size-4 animate-spin" /> : null}
                Salvar conta
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="text-danger hover:text-danger"
                onClick={() => toast.info("Exclusão de conta estará disponível em breve.")}
              >
                Excluir conta
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
