import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getQuoteRequests } from "@/lib/data/quote-requests";

export const metadata = { title: "Pedidos de orçamento" };

export default async function AdminOrcamentosPage() {
  const { rows, total, tableMissing } = await getQuoteRequests();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-medium tracking-tight">Pedidos de orçamento</h1>
        <p className="text-sm text-muted-foreground">
          Solicitações de orçamento de implantação enviadas pelo relatório de
          diagnóstico. {total} pedido{total === 1 ? "" : "s"}.
        </p>
      </div>

      {tableMissing ? (
        <Card className="rounded-xl border-warning/40 bg-warning-soft shadow-none">
          <CardContent className="flex items-start gap-3 p-5">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" />
            <p className="text-sm">
              A tabela de orçamentos ainda não existe. Rode a migration{" "}
              <span className="font-mono">0006_quote_requests.sql</span> no SQL Editor
              do Supabase para começar a receber os pedidos.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-xl border shadow-none">
          <CardContent className="p-2 sm:p-4">
            {rows.length === 0 ? (
              <p className="p-10 text-center text-sm text-muted-foreground">
                Nenhum pedido de orçamento ainda.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quando</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Segmento</TableHead>
                    <TableHead className="text-right">Lojas</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Negócio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {new Date(r.createdAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "2-digit",
                        })}
                      </TableCell>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell>{r.company}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {r.segment ?? "—"}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {r.storeCount ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {(() => {
                          const wpp = r.whatsapp ?? r.leadWhatsapp;
                          if (!wpp && !r.leadEmail)
                            return <span className="text-muted-foreground">—</span>;
                          return (
                            <span className="flex flex-col">
                              {wpp ? (
                                <a
                                  href={`https://wa.me/55${wpp.replace(/\D/g, "")}`}
                                  target="_blank"
                                  rel="noopener"
                                  className="font-medium underline-offset-4 hover:text-primary hover:underline"
                                >
                                  {wpp}
                                </a>
                              ) : null}
                              {r.leadEmail ? (
                                <a
                                  href={`mailto:${r.leadEmail}`}
                                  className="truncate text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
                                >
                                  {r.leadEmail}
                                </a>
                              ) : null}
                            </span>
                          );
                        })()}
                      </TableCell>
                      <TableCell>
                        {r.diagnosticId ? (
                          <Link
                            href={`/admin/crm/${r.diagnosticId}`}
                            className="text-sm underline-offset-4 hover:text-primary hover:underline"
                          >
                            {r.businessName ?? "ver diagnóstico"}
                          </Link>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {r.businessName ?? "—"}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
