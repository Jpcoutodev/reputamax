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
        "inline-flex items-center",
        className
      )}
    >
      <img 
        src="/logo.png" 
        alt="Reputamax" 
        className="h-16 w-auto object-contain scale-[2.5] origin-left"
      />
    </Link>
  );
}
