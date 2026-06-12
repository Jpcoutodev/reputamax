import { BusinessSearch } from "@/components/diagnostico/business-search";
import { TrackView } from "@/components/analytics/track";

export const metadata = { title: "Diagnóstico gratuito" };

export default function DiagnosticoPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-8 px-4 py-20">
      <TrackView event="diagnostico_view" />
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-3xl font-medium tracking-tight md:text-4xl">
          Como está a reputação do seu negócio no Google?
        </h1>
        <p className="text-lg text-muted-foreground">
          Diagnóstico completo e gratuito em 30 segundos.
        </p>
      </div>
      <BusinessSearch variant="inline" autoFocus />
    </div>
  );
}
