"use client";

import { useState } from "react";
import { Loader2, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateAiModel, updateAiProvider, updatePrompt } from "@/app/admin/actions";

interface ProviderModel {
  presets: string[];
  default: string;
  current: string | null;
  effective: string;
}

interface ProviderOption {
  id: string;
  label: string;
  description: string;
  keyConfigured: boolean;
  model: ProviderModel | null;
}

interface PromptField {
  key: string;
  label: string;
  help: string;
  defaultValue: string;
  currentOverride: string | null;
}

interface AiSettingsProps {
  activeProvider: string;
  providers: ProviderOption[];
  prompts: PromptField[];
}

export function AiSettings({ activeProvider, providers, prompts }: AiSettingsProps) {
  const [provider, setProvider] = useState(activeProvider);
  const [savingProvider, setSavingProvider] = useState(false);
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(prompts.map((p) => [p.key, p.currentOverride ?? p.defaultValue]))
  );
  const [savingKey, setSavingKey] = useState<string | null>(null);

  // modelo digitável por provider (inicia com a escolha atual ou o efetivo)
  const [models, setModels] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      providers
        .filter((p) => p.model)
        .map((p) => [p.id, p.model!.current ?? p.model!.effective])
    )
  );
  const [savingModel, setSavingModel] = useState<string | null>(null);

  const activeOption = providers.find((p) => p.id === provider);

  async function handleSaveModel(providerId: string, modelConfig: ProviderModel) {
    setSavingModel(providerId);
    const value = (models[providerId] ?? "").trim();
    // igual ao default = remove o override (volta a env > default)
    const toSave = value === modelConfig.default ? "" : value;
    const result = await updateAiModel(providerId, toSave);
    setSavingModel(null);
    if (!result.ok) {
      toast.error("Não foi possível salvar o modelo.");
      return;
    }
    toast.success("Modelo atualizado — vale a partir da próxima análise.");
  }

  async function handleProviderChange(next: string | null) {
    if (!next || next === provider) return;
    const selected = providers.find((p) => p.id === next);
    if (selected && !selected.keyConfigured && next !== "mock") {
      toast.warning(
        `A chave do ${selected.label} não está configurada no servidor — a análise vai cair no fallback determinístico até você adicioná-la.`
      );
    }
    setProvider(next);
    setSavingProvider(true);
    const result = await updateAiProvider(next);
    setSavingProvider(false);
    if (!result.ok) {
      setProvider(provider);
      toast.error("Não foi possível trocar o provider.");
      return;
    }
    toast.success("Provider de IA atualizado — vale a partir da próxima análise.");
  }

  async function handleSavePrompt(field: PromptField) {
    setSavingKey(field.key);
    const value = values[field.key] ?? "";
    // salvar igual ao padrão = remover override
    const toSave = value.trim() === field.defaultValue.trim() ? "" : value;
    const result = await updatePrompt(field.key, toSave);
    setSavingKey(null);
    if (!result.ok) {
      toast.error(result.error ?? "Não foi possível salvar o prompt.");
      return;
    }
    toast.success(
      toSave ? "Prompt salvo — vale a partir da próxima análise." : "Prompt restaurado ao padrão."
    );
  }

  async function handleReset(field: PromptField) {
    setValues((prev) => ({ ...prev, [field.key]: field.defaultValue }));
    setSavingKey(field.key);
    const result = await updatePrompt(field.key, "");
    setSavingKey(null);
    if (result.ok) toast.success("Prompt restaurado ao padrão.");
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Provider ativo */}
      <Card className="rounded-xl border shadow-none">
        <CardContent className="flex flex-col gap-4 p-6">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <h2 className="font-medium">Inteligência artificial ativa</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Modelo que escreve as análises de diagnóstico e as sugestões de
            resposta. A troca vale imediatamente, sem deploy. As métricas
            (score, gap, taxas) são sempre calculadas pelo sistema — a IA gera
            apenas os textos.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Select value={provider} onValueChange={handleProviderChange}>
              <SelectTrigger className="w-72" aria-label="Provider de IA">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {providers.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {savingProvider ? (
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            ) : null}
          </div>

          {/* Modelo do provider ativo — presets + digitação livre */}
          {activeOption?.model ? (
            <div className="flex flex-col gap-2 rounded-lg border bg-surface p-4">
              <Label htmlFor="ai-model" className="text-sm font-medium">
                Modelo do {activeOption.label}
              </Label>
              <p className="text-xs text-muted-foreground">
                Escolha um modelo da lista ou digite o nome de um novo. Em caso de
                erro, a análise cai no modo determinístico automaticamente.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  id="ai-model"
                  list="ai-model-presets"
                  className="w-72 font-mono text-xs"
                  placeholder={activeOption.model.default}
                  value={models[provider] ?? ""}
                  onChange={(e) =>
                    setModels((prev) => ({ ...prev, [provider]: e.target.value }))
                  }
                />
                <datalist id="ai-model-presets">
                  {activeOption.model.presets.map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
                <Button
                  size="sm"
                  onClick={() => handleSaveModel(provider, activeOption.model!)}
                  disabled={savingModel === provider}
                >
                  {savingModel === provider ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : null}
                  Salvar modelo
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Em uso agora: <span className="font-mono">{activeOption.model.effective}</span>
                {activeOption.model.current
                  ? " (definido aqui)"
                  : " (padrão do sistema)"}
              </p>
            </div>
          ) : null}

          <ul className="flex flex-col gap-1.5">
            {providers.map((p) => (
              <li key={p.id} className="flex items-center gap-2 text-sm">
                <Badge
                  variant="secondary"
                  className={
                    p.keyConfigured || p.id === "mock"
                      ? "bg-success-soft text-success"
                      : "bg-surface text-muted-foreground"
                  }
                >
                  {p.id === "mock" ? "sempre disponível" : p.keyConfigured ? "chave OK" : "sem chave"}
                </Badge>
                <span className="font-medium">{p.label}</span>
                <span className="text-muted-foreground">— {p.description}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Prompts */}
      {prompts.map((field) => {
        const isCustom = (values[field.key] ?? "").trim() !== field.defaultValue.trim();
        return (
          <Card key={field.key} className="rounded-xl border shadow-none">
            <CardContent className="flex flex-col gap-3 p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label htmlFor={field.key} className="text-base font-medium">
                  {field.label}
                </Label>
                {isCustom ? (
                  <Badge variant="secondary" className="bg-warning-soft text-warning">
                    Customizado
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-surface text-muted-foreground">
                    Padrão
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{field.help}</p>
              <Textarea
                id={field.key}
                rows={8}
                value={values[field.key] ?? ""}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                }
                className="font-mono text-xs"
              />
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => handleSavePrompt(field)}
                  disabled={savingKey === field.key}
                >
                  {savingKey === field.key ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : null}
                  Salvar prompt
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleReset(field)}
                  disabled={savingKey === field.key || !isCustom}
                >
                  <RotateCcw className="size-3.5" />
                  Restaurar padrão
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
