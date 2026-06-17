import Link from "next/link";
import { Suspense } from "react";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CrmFilters } from "@/components/admin/crm-filters";
import { CrmStageSelect } from "@/components/admin/crm-stage-select";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteDiagnostic } from "@/app/admin/actions";
import { CRM_STAGES, getCrmEntries, type CrmStage } from "@/lib/data/admin-queries";

export const metadata = { title: "CRM" };

interface PageProps {
  searchParams: Promise<{ fase?: string; q?: string; page?: string }>;
}

export default async function CrmPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const stage = CRM_STAGES.includes(params.fase as CrmStage)
    ? (params.fase as CrmStage)
    : undefined;
  const page = Math.max(1, Number(params.page) || 1);

  const { entries, total, pageSize } = await getCrmEntries({
    stage,
    search: params.q,
    page,
  });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function pageHref(p: number): string {
    const sp = new URLSearchParams();
    if (params.fase) sp.set("fase", params.fase);
    if (params.q) sp.set("q", params.q);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return `/admin/crm${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-medium tracking-tight">CRM</h1>
        <p className="text-sm text-muted-foreground">
          Todos os negócios que passaram pelo diagnóstico. Mude a fase pelo
          dropdown e clique no nome para ver contato e relatório completo.{" "}
          {total} registro{total === 1 ? "" : "s"}.
        </p>
      </div>

      <Suspense>
        <CrmFilters />
      </Suspense>

      <Card className="rounded-xl border shadow-none">
        <CardContent className="p-2 sm:p-4">
          {entries.length === 0 ? (
            <p className="p-10 text-center text-sm text-muted-foreground">
              Nenhum registro com esses filtros.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Negócio</TableHead>
                  <TableHead>Fase</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Relatório</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <Link
                        href={`/admin/crm/${entry.id}`}
                        className="block max-w-56 truncate font-medium underline-offset-4 hover:text-primary hover:underline"
                      >
                        {entry.businessName}
                      </Link>
                      <span className="text-xs text-muted-foreground">
                        {entry.rating > 0
                          ? `${entry.rating.toFixed(1)}★ · ${entry.reviewCount} avaliações`
                          : entry.category}
                      </span>
                    </TableCell>
                    <TableCell>
                      <CrmStageSelect id={entry.id} stage={entry.stage} />
                    </TableCell>
                    <TableCell className="tabular-nums">{entry.score ?? "—"}</TableCell>
                    <TableCell>
                      {entry.leadEmail || entry.leadWhatsapp ? (
                        <span className="block max-w-48">
                          {entry.leadEmail ? (
                            <a
                              href={`mailto:${entry.leadEmail}`}
                              className="block truncate text-sm underline-offset-4 hover:text-primary hover:underline"
                            >
                              {entry.leadEmail}
                            </a>
                          ) : null}
                          {entry.leadWhatsapp ? (
                            <a
                              href={`https://wa.me/55${entry.leadWhatsapp.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener"
                              className="text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
                            >
                              {entry.leadWhatsapp}
                            </a>
                          ) : null}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          render={<Link href={`/admin/crm/${entry.id}`} />}
                        >
                          <FileText className="size-3.5" />
                          Ver / PDF
                        </Button>
                        <DeleteButton
                          action={deleteDiagnostic.bind(null, entry.id)}
                          title="Excluir este lead?"
                          description={`O diagnóstico de ${entry.businessName} será removido permanentemente do CRM.`}
                          successMessage="Lead excluído."
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-2 text-sm">
          {page > 1 ? (
            <Button variant="outline" size="sm" render={<Link href={pageHref(page - 1)} />}>
              Anterior
            </Button>
          ) : null}
          <span className="text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          {page < totalPages ? (
            <Button variant="outline" size="sm" render={<Link href={pageHref(page + 1)} />}>
              Próxima
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
