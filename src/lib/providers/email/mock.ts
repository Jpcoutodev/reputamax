import type { EmailProvider } from "../types";

/** Provider mock: apenas loga no console (fase 2 troca por Resend) */
export const consoleEmailProvider: EmailProvider = {
  async sendDiagnosisReport(to: string, diagnosticoId: string): Promise<void> {
    console.info(
      `[email mock] Relatório de diagnóstico ${diagnosticoId} "enviado" para ${to}`
    );
  },
};
