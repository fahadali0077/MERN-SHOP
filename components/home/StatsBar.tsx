"use client";

import { useEffect, useRef, useState } from "react";

interface Stat {
  label: string;
  value: number;
  suffix: string;
}

interface StatsBarProps {
  stats: Stat[];
}

export function StatsBar({ stats }: StatsBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [counts, setCounts] = useState<number[]>(stats.map(() => 0));
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered) {
          setTriggered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [triggered]);

  useEffect(() => {
    if (!triggered) return;

    const duration = 1200; // ms
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      setCounts(stats.map((s) => Math.round(eased * s.value * 10) / 10));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [triggered, stats]);

  return (
    <div
      ref={ref}
      className="grid grid-cols-2 overflow-hidden rounded-2xl border border-border bg-white shadow-sm dark:border-dark-border dark:bg-dark-surface sm:grid-cols-4"
    >
      {stats.map(({ label, suffix }, idx) => (
        <div
          key={label}
          className="flex flex-col items-center gap-0.5 px-6 py-8"
          style={{
            borderRight:
              idx < stats.length - 1
                ? "1px solid rgba(0,0,0,0.07)"
                : undefined,
          }}
        >
          <div className="flex items-baseline gap-0.5">
            <span className="font-serif text-4xl font-normal tabular-nums text-primary">
              {Number.isInteger(stats[idx].value)
                ? Math.round(counts[idx])
                : counts[idx].toFixed(1)}
            </span>
            <span className="font-serif text-2xl text-primary/70">{suffix}</span>
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
