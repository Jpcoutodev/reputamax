import type { EmailProvider } from "../types";

/** Fase 2: envio real via Resend + React Email */
export const resendEmailProvider: EmailProvider = {
  async sendDiagnosisReport() {
    throw new Error("Not implemented: Resend (fase 2)");
  },
};
