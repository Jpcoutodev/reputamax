"use client";

import { useState } from "react";
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
import { getDemoBusiness } from "@/lib/mock-data/app-data";

export default function ConfiguracoesPage() {
  const business = getDemoBusiness();
  const [name, setName] = useState(business.name);
  const [category, setCategory] = useState(business.category);
  const [address, setAddress] = useState(business.address);
  const [tone, setTone] = useState<"amigavel" | "formal">("amigavel");
  const [email, setEmail] = useState("demo@reputamax.app");

  function handleSaveBusiness(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Dados do negócio salvos (modo demonstração).");
  }

  function handleSaveAccount(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Dados da conta salvos (modo demonstração).");
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-medium tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground">
          Dados do negócio, tom de voz das respostas e sua conta.
        </p>
      </div>

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
                <Input id="slug" value={`reputamax.app/r/${business.slug}`} disabled />
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
              <Select value={tone} onValueChange={(v) => setTone((v ?? "amigavel") as typeof tone)}>
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
              <Button type="submit">Salvar alterações</Button>
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
              <Input id="password" type="password" placeholder="Deixe em branco para manter" />
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit">Salvar conta</Button>
              <Button
                type="button"
                variant="ghost"
                className="text-danger hover:text-danger"
                onClick={() =>
                  toast.info("Exclusão de conta estará disponível em breve.")
                }
              >
                Excluir conta
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
