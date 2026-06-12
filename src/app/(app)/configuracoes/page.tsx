import { SettingsForms } from "@/components/configuracoes/settings-forms";
import { getCurrentBusiness } from "@/lib/data/business";

export const metadata = { title: "Configurações" };

export default async function ConfiguracoesPage() {
  const business = await getCurrentBusiness();

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-medium tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground">
          Dados do negócio, tom de voz das respostas e sua conta.
        </p>
      </div>
      <SettingsForms
        initialName={business.name}
        initialCategory={business.category ?? ""}
        initialAddress={business.address ?? ""}
        initialTone={business.tone}
        accountEmail={business.accountEmail ?? ""}
        slug={business.slug}
      />
    </div>
  );
}
