import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarsProps {
  rating: number;
  size?: number;
  className?: string;
}

/** Exibição estática de estrelas (leitura) */
export function Stars({ rating, size = 16, className }: StarsProps) {
  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      aria-label={`${rating} de 5 estrelas`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={
            i <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted-foreground/30"
          }
        />
      ))}
    </span>
  );
}
