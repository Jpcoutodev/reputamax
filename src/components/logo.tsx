import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  href?: string;
  className?: string;
  /** fundo escuro (navy): inverte o logo para branco */
  dark?: boolean;
  /** usar o logo horizontal antigo (landing page) */
  landscape?: boolean;
}

export function Logo({ href = "/", className, dark = false, landscape = false }: LogoProps) {
  return (
    <Link href={href} className={cn("inline-flex items-center justify-center", className)}>
      {landscape ? (
        <img
          src="/logo-landscape.png"
          alt="Reputamax"
          className={cn("h-9 w-auto object-contain sm:h-10", dark && "brightness-0 invert")}
        />
      ) : (
        <img
          src="/logo.png"
          alt="Reputamax"
          className={cn("h-10 w-auto object-contain", dark && "brightness-0 invert")}
        />
      )}
    </Link>
  );
}
