"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface CountUpProps {
  value: string;
  className?: string;
}

/**
 * Animates a number counting up from 0 when it enters the viewport.
 * Handles suffixes like "%" or "x" (e.g. "90%", "3x", "35%").
 */
export function CountUp({ value, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [displayed, setDisplayed] = useState(value);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          observer.unobserve(el);

          // Parse numeric part and suffix
          const match = value.match(/^([\d.]+)(.*)$/);
          if (!match) {
            setDisplayed(value);
            return;
          }

          const target = parseFloat(match[1]);
          const suffix = match[2];
          const isFloat = match[1].includes(".");
          const duration = 1200; // ms
          const startTime = performance.now();

          function tick(now: number) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = target * eased;

            if (isFloat) {
              setDisplayed(current.toFixed(1) + suffix);
            } else {
              setDisplayed(Math.round(current) + suffix);
            }

            if (progress < 1) {
              requestAnimationFrame(tick);
            }
          }

          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value, hasAnimated]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {displayed}
    </span>
  );
}
