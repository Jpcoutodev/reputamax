"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MetricSnapshot } from "@/lib/mock-data/app-data";

interface EvolutionChartProps {
  data: MetricSnapshot[];
}

function formatDate(date: string): string {
  const [, month, day] = date.split("-");
  return `${day}/${month}`;
}

export function EvolutionChart({ data }: EvolutionChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id="ratingFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={false}
            minTickGap={40}
          />
          <YAxis
            yAxisId="rating"
            domain={[3.5, 5]}
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => v.toFixed(1)}
          />
          <YAxis yAxisId="count" orientation="right" hide />
          <Tooltip
            formatter={(value, name) =>
              name === "Nota"
                ? [Number(value).toFixed(2), "Nota"]
                : [value, "Avaliações"]
            }
            labelFormatter={(label) => formatDate(String(label))}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid var(--border)",
              fontSize: 13,
            }}
          />
          <Area
            yAxisId="count"
            type="monotone"
            dataKey="reviewCount"
            name="Avaliações"
            stroke="var(--success)"
            strokeWidth={1.5}
            fill="none"
            strokeDasharray="4 4"
          />
          <Area
            yAxisId="rating"
            type="monotone"
            dataKey="rating"
            name="Nota"
            stroke="#4F46E5"
            strokeWidth={2}
            fill="url(#ratingFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
