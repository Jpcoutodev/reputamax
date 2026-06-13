import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { getPublicBusiness } from "@/lib/data/public-business";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const metadata = { robots: { index: false } };

export default async function ObrigadoPage({ params }: PageProps) {
  const { slug } = await params;
  const business = await getPublicBusiness(slug);
  if (!business) notFound();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-surface px-4 py-12 text-center">
      <CheckCircle2 className="size-14 text-success" />
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-medium tracking-tight">Obrigado!</h1>
        <p className="max-w-sm text-muted-foreground">
          O responsável já foi avisado e vai cuidar disso pessoalmente. Sua
          opinião ajuda a {business.name} a melhorar de verdade.
        </p>
      </div>
      <p className="text-xs text-muted-foreground">
        Pesquisa de satisfação por{" "}
        <Link href="/" className="font-medium text-primary underline-offset-4 hover:underline">
          Reputamax
        </Link>
      </p>
    </main>
  );
}
