import { Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Stars } from "@/components/stars";
import { findBusinessByPlaceId, getCompetitorsFor } from "@/lib/mock-data/businesses";
import { getDemoBusiness } from "@/lib/mock-data/app-data";
import { getCurrentBusiness } from "@/lib/data/business";
import { getMetricSnapshotsForBusiness } from "@/lib/data/app-queries";

export const metadata = { title: "Concorrentes" };

export default async function ConcorrentesPage() {
  const business = await getCurrentBusiness();
  const snapshots = await getMetricSnapshotsForBusiness(business);
  const latest = snapshots[snapshots.length - 1];

  // concorrentes ainda vêm do provider mock — a Places API substitui isso
  const mockRef =
    (business.googlePlaceId ? findBusinessByPlaceId(business.googlePlaceId) : undefined) ??
    getDemoBusiness();
  const competitors = getCompetitorsFor(mockRef);

  const ownRating = latest?.rating ?? mockRef.rating;
  const ownReviewCount = latest?.reviewCount ?? mockRef.reviewCount;

  const ranking = [
    {
      name: business.name,
      rating: ownRating,
      reviewCount: ownReviewCount,
      distanceKm: 0,
      isOwn: true,
    },
    ...competitors.map((c) => ({ ...c, isOwn: false })),
  ].sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);

  const ownPosition = ranking.findIndex((r) => r.isOwn) + 1;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-medium tracking-tight">Concorrentes</h1>
        <p className="text-sm text-muted-foreground">
          Como sua reputação se compara com os negócios mais próximos da sua categoria.
        </p>
      </div>

      <Card className="rounded-xl border shadow-none">
        <CardContent className="flex items-center gap-4 p-6">
          <span className="flex size-12 items-center justify-center rounded-xl bg-accent">
            <Trophy className="size-6 text-accent-foreground" />
          </span>
          <div>
            <p className="text-2xl font-medium">
              {ownPosition}º lugar{" "}
              <span className="text-base font-normal text-muted-foreground">
                de {ranking.length} no ranking local
              </span>
            </p>
            <p className="text-sm text-muted-foreground">
              {ownPosition === 1
                ? "Você lidera a região — continue coletando avaliações pra manter a posição."
                : `Faltam ${(ranking[0].rating - ownRating).toFixed(1)} ponto(s) de nota para alcançar o líder.`}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border shadow-none">
        <CardContent className="p-2 sm:p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Negócio</TableHead>
                <TableHead>Nota</TableHead>
                <TableHead className="text-right">Avaliações</TableHead>
                <TableHead className="text-right">Distância</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ranking.map((row, i) => (
                <TableRow
                  key={row.name}
                  className={row.isOwn ? "bg-accent/60 hover:bg-accent/60" : ""}
                >
                  <TableCell className="font-medium tabular-nums">{i + 1}º</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-2 font-medium">
                      {row.name}
                      {row.isOwn ? <Badge>Você</Badge> : null}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-2">
                      <span className="font-medium tabular-nums">
                        {row.rating.toFixed(1)}
                      </span>
                      <Stars rating={row.rating} size={13} />
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.reviewCount}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {row.isOwn ? "—" : `${row.distanceKm.toFixed(1)} km`}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Dados dos concorrentes em modo demonstração — passam a vir do Google Maps
        quando a busca ao vivo for ativada.
      </p>
    </div>
  );
}
