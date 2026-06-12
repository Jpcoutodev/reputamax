import Link from "next/link";
import { Suspense } from "react";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { getCrmEntries, type CrmStage } from "@/lib/data/admin-queries";

export const metadata = { title: "CRM" };

const stageBadges: Record<CrmStage, { label: string; className: string }> = {
  diagnostico: { label: "Diagnóstico", className: "bg-surface text-muted-foreground" },
  lead: { label: "Lead", className: "bg-warning-soft text-warning" },
  cliente: { label: "Cliente", className: "bg-success-soft text-success" },
};

const VALID_STAGES: CrmStage[] = ["diagnostico", "lead", "cliente"];

interface PageProps {
  searchParams: Promise<{ fase?: string; q?: string; page?: string }>;
}

export default async function CrmPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const stage = VALID_STAGES.includes(params.fase as CrmStage)
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
          Todos os negócios que passaram pelo diagnóstico, com a fase de cada um
          no funil. {total} registro{total === 1 ? "" : "s"}.
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
                {entries.map((entry) => {
                  const badge = stageBadges[entry.stage];
                  return (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <span className="block max-w-56 truncate font-medium">
                          {entry.businessName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {entry.rating > 0
                            ? `${entry.rating.toFixed(1)}★ · ${entry.reviewCount} avaliações`
                            : entry.category}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={badge.className}>
                          {badge.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {entry.score ?? "—"}
                      </TableCell>
                      <TableCell>
                        {entry.leadEmail ? (
                          <span className="block max-w-48">
                            <span className="block truncate text-sm">{entry.leadEmail}</span>
                            {entry.leadWhatsapp ? (
                              <span className="text-xs text-muted-foreground">
                                {entry.leadWhatsapp}
                              </span>
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
                        <Button
                          size="sm"
                          variant="outline"
                          render={
                            <Link href={`/admin/crm/${entry.id}`} target="_blank" />
                          }
                        >
                          <FileText className="size-3.5" />
                          Ver / PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
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
