"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { scoreColor, scoreLabel } from "@/lib/score-utils";

export { scoreColor, scoreLabel };

interface ScoreRingProps {
  score: number; // 0-100
  size?: number; // px
  strokeWidth?: number;
  animate?: boolean;
  className?: string;
  caption?: string;
}

/** Anel de score — elemento assinatura do Reputamax */
export function ScoreRing({
  score,
  size = 160,
  strokeWidth = 12,
  animate = true,
  className,
  caption,
}: ScoreRingProps) {
  const [displayed, setDisplayed] = useState(animate ? 0 : score);

  useEffect(() => {
    if (!animate) return;
    let frame: number;
    const start = performance.now();
    const duration = 1200;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(Math.round(score * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [score, animate]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference * (1 - displayed / 100);
  const color = scoreColor(score);

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      role="img"
      aria-label={`Score de reputação: ${score} de 100`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          style={{ transition: animate ? undefined : "stroke-dashoffset 0.3s" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-medium tabular-nums"
          style={{ color, fontSize: size * 0.27 }}
        >
          {displayed}
        </span>
        {caption ? (
          <span className="text-muted-foreground" style={{ fontSize: size * 0.08 }}>
            {caption}
          </span>
        ) : null}
      </div>
    </div>
  );
}
