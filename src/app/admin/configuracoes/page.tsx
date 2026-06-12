import { AiSettings } from "@/components/admin/ai-settings";
import { getAppSettings } from "@/lib/data/settings";
import {
  DEFAULT_ANALYSIS_RULES,
  DEFAULT_ANALYSIS_SYSTEM_PROMPT,
  DEFAULT_REPLY_SYSTEM_PROMPT,
} from "@/lib/providers/analysis/llm-analysis";

export const metadata = { title: "Configurações" };

export default async function AdminConfigPage() {
  const settings = await getAppSettings();

  const providers = [
    {
      id: "mock",
      label: "Determinístico (sem IA)",
      description: "análise por regras; fallback de todos os outros",
      keyConfigured: true,
    },
    {
      id: "minimax",
      label: `MiniMax (${process.env.MINIMAX_MODEL ?? "MiniMax-M2"})`,
      description: "crédito pré-pago em uso",
      keyConfigured: Boolean(process.env.MINIMAX_API_KEY),
    },
    {
      id: "anthropic",
      label: `Claude (${process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6"})`,
      description: "Anthropic — requer ANTHROPIC_API_KEY",
      keyConfigured: Boolean(process.env.ANTHROPIC_API_KEY),
    },
    {
      id: "openai",
      label: `GPT (${process.env.OPENAI_MODEL ?? "gpt-5.1"})`,
      description: "OpenAI — requer OPENAI_API_KEY",
      keyConfigured: Boolean(process.env.OPENAI_API_KEY),
    },
  ];

  const prompts = [
    {
      key: "ai_analysis_system",
      label: "Persona da análise (system prompt)",
      help: "Define quem a IA é ao escrever o diagnóstico. Vale para resumo, problemas, recomendações e temas.",
      defaultValue: DEFAULT_ANALYSIS_SYSTEM_PROMPT,
      currentOverride: settings.aiAnalysisSystem,
    },
    {
      key: "ai_analysis_rules",
      label: "Regras da análise",
      help: "Bloco de regras anexado ao final do prompt da análise — quantidades, restrições e direcionamento comercial (ex.: a recomendação 1 sempre conecta com o produto).",
      defaultValue: DEFAULT_ANALYSIS_RULES,
      currentOverride: settings.aiAnalysisRules,
    },
    {
      key: "ai_reply_system",
      label: "Persona das respostas a avaliações",
      help: "Usado no botão “Sugerir resposta com IA”. Variáveis disponíveis: {businessName} e {toneInstructions} (preenchidas pelo sistema).",
      defaultValue: DEFAULT_REPLY_SYSTEM_PROMPT,
      currentOverride: settings.aiReplySystem,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-medium tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground">
          Controle da IA: qual modelo gera as análises e com quais prompts.
        </p>
      </div>
      <AiSettings
        activeProvider={settings.aiProvider}
        providers={providers}
        prompts={prompts}
      />
    </div>
  );
}
