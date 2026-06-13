import { renderToBuffer } from "@react-pdf/renderer";
import { z } from "zod";
import { getAdminUser } from "@/lib/data/admin";
import { getCrmDiagnostic } from "@/lib/data/admin-queries";
import { DiagnosisDocument } from "@/lib/pdf/diagnosis-document";

// @react-pdf/renderer precisa do runtime Node (não edge)
export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 50);
}

/** Gera o PDF real do diagnóstico (apenas admin). Download direto. */
export async function GET(_request: Request, context: RouteContext) {
  const admin = await getAdminUser();
  if (!admin) {
    return new Response("Não autorizado", { status: 403 });
  }

  const { id } = await context.params;
  if (!z.string().uuid().safeParse(id).success) {
    return new Response("ID inválido", { status: 400 });
  }

  const diagnostic = await getCrmDiagnostic(id);
  if (!diagnostic) {
    return new Response("Diagnóstico não encontrado", { status: 404 });
  }
  if (!diagnostic.result) {
    return new Response("Análise ainda não concluída", { status: 409 });
  }

  const buffer = await renderToBuffer(
    DiagnosisDocument({
      business: diagnostic.business,
      result: diagnostic.result,
      generatedAt: diagnostic.createdAt,
    })
  );

  const filename = `diagnostico-${slugify(diagnostic.business.name)}.pdf`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
