import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ILLUSTRATIVE } from '../data/illustrativeVillageData';
import { usePrefersReducedMotion } from '../lib/hooks';

/** Marks any number invented for the teaching village. Never appears near India data. */
export function Illustrative({ children }: { children?: ReactNode }) {
  return (
    <span className="pill pill-illustrative">
      <span aria-hidden="true">✎</span>
      {children ?? ILLUSTRATIVE}
    </span>
  );
}

export function SeriesPill({ series }: { series: 'old' | 'new' }) {
  return (
    <span className={`pill ${series === 'old' ? 'pill-old' : 'pill-new'}`}>
      {series === 'old' ? 'Old 2011–12 series' : 'New 2022–23 series'}
    </span>
  );
}

export function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  accent?: string;
}) {
  return (
    <div className="card stat-card" style={accent ? ({ ['--accent' as string]: accent } as React.CSSProperties) : undefined}>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
      {sub && <p className="stat-sub">{sub}</p>}
    </div>
  );
}

export function Thought({ emoji, children }: { emoji: string; children: ReactNode }) {
  return (
    <p className="thought">
      <span className="emoji" aria-hidden="true">
        {emoji}
      </span>
      <span>{children}</span>
    </p>
  );
}

/**
 * Counts a number up when it changes. Honest about rounding: the caller supplies the
 * formatter, so what animates is exactly what would have been printed.
 */
export function NumberFlow({
  value,
  format,
  duration = 900,
}: {
  value: number;
  format: (v: number) => string;
  duration?: number;
}) {
  const reduced = usePrefersReducedMotion();
  const [shown, setShown] = useState(value);
  const from = useRef(value);

  useEffect(() => {
    if (reduced) {
      setShown(value);
      from.current = value;
      return;
    }
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(a + (value - a) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else from.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, reduced]);

  return <span className="mono">{format(shown)}</span>;
}

export function DeepDive({ summary, children }: { summary: string; children: ReactNode }) {
  return (
    <details className="deep-dive">
      <summary>{summary}</summary>
      <div>{children}</div>
    </details>
  );
}

export function Note({ tone = 'plain', children }: { tone?: 'plain' | 'warn' | 'clay'; children: ReactNode }) {
  return <div className={`note ${tone === 'warn' ? 'note-warn' : tone === 'clay' ? 'note-clay' : ''}`}>{children}</div>;
}
