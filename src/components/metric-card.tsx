import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

type Semaphore = "verde" | "ambar" | "vermelho" | "neutro";

const semaphoreText: Record<Semaphore, string> = {
  verde: "text-success",
  ambar: "text-warning",
  vermelho: "text-danger",
  neutro: "text-foreground",
};

interface MetricCardProps {
  label: string;
  value: string;
  hint?: string;
  semaphore?: Semaphore;
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({
  label,
  value,
  hint,
  semaphore = "neutro",
  icon,
  className,
}: MetricCardProps) {
  return (
    <Card className={cn("rounded-xl border shadow-none", className)}>
      <CardContent className="flex flex-col gap-1 p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-muted-foreground">{label}</span>
          {icon}
        </div>
        <span className={cn("text-3xl font-medium tabular-nums", semaphoreText[semaphore])}>
          {value}
        </span>
        {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      </CardContent>
    </Card>
  );
}
