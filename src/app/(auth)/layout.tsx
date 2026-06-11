import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-surface px-4 py-12">
      <Logo />
      {children}
      <p className="text-xs text-muted-foreground">
        © 2026 Reputamax — Gestão de reputação para negócios locais.
      </p>
    </div>
  );
}
