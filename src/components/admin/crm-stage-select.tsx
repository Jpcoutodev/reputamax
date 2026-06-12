"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { updateCrmStage } from "@/app/admin/actions";
import type { CrmStage } from "@/lib/data/admin-queries";

export const stageConfig: Record<CrmStage, { label: string; className: string }> = {
  diagnostico: { label: "Diagnóstico", className: "text-muted-foreground" },
  lead: { label: "Lead", className: "text-warning" },
  contatado: { label: "Contatado", className: "text-primary" },
  negociacao: { label: "Em negociação", className: "text-primary" },
  cliente: { label: "Cliente", className: "text-success" },
  perdido: { label: "Perdido", className: "text-danger" },
};

interface CrmStageSelectProps {
  id: string;
  stage: CrmStage;
}

/** Dropdown de fase por registro do CRM — grava na hora. */
export function CrmStageSelect({ id, stage: initial }: CrmStageSelectProps) {
  const [stage, setStage] = useState<CrmStage>(initial);
  const [saving, setSaving] = useState(false);

  async function handleChange(next: string | null) {
    if (!next || next === stage) return;
    const previous = stage;
    setStage(next as CrmStage);
    setSaving(true);
    const result = await updateCrmStage(id, next);
    setSaving(false);
    if (!result.ok) {
      setStage(previous);
      toast.error("Não foi possível mudar a fase. Tente de novo.");
      return;
    }
    toast.success(`Fase alterada para "${stageConfig[next as CrmStage].label}".`);
  }

  return (
    <Select value={stage} onValueChange={handleChange} disabled={saving}>
      <SelectTrigger
        size="sm"
        className={cn("w-40 font-medium", stageConfig[stage].className)}
        aria-label="Fase no funil"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(stageConfig) as CrmStage[]).map((s) => (
          <SelectItem key={s} value={s}>
            {stageConfig[s].label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
