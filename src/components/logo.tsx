import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  href?: string;
  className?: string;
  dark?: boolean;
}

export function Logo({ href = "/", className, dark = false }: LogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 font-medium text-lg tracking-tight",
        dark ? "text-white" : "text-foreground",
        className
      )}
    >
      <span
        aria-hidden
        className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-semibold"
      >
        R
      </span>
      Reputamax
    </Link>
  );
}
