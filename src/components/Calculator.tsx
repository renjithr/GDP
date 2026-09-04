import { useEffect, useMemo, useState } from 'react';
import { pctChange } from '../data/actualIndiaData';
import { usePrefersReducedMotion } from '../lib/hooks';

/**
 * The visitor does the arithmetic themselves.
 *
 * The whole argument turns on one division, so it is worth letting people watch it
 * happen a step at a time — and letting them retype the inputs to prove nothing is
 * hidden in the code.
 */
export function GrowthCalculator({
  from,
  to,
  fromLabel,
  toLabel,
  editable = true,
  autoStart = false,
  accent = 'var(--amber)',
  onComplete,
}: {
  from: number;
  to: number;
  fromLabel: string;
  toLabel: string;
  editable?: boolean;
  autoStart?: boolean;
  accent?: string;
  onComplete?: (pct: number) => void;
}) {
  const reduced = usePrefersReducedMotion();
  const [a, setA] = useState(String(from));
  const [b, setB] = useState(String(to));
  const [revealed, setRevealed] = useState(autoStart ? 3 : 0);

  useEffect(() => {
    setA(String(from));
    setB(String(to));
    setRevealed(autoStart ? 3 : 0);
  }, [from, to, autoStart]);

  const nums = useMemo(() => {
    const x = Number(a);
    const y = Number(b);
    const valid = Number.isFinite(x) && Number.isFinite(y) && x !== 0;
    return { x, y, valid, diff: y - x, ratio: valid ? (y - x) / x : 0, pct: valid ? pctChange(x, y) : 0 };
  }, [a, b]);

  useEffect(() => {
    if (revealed >= 3 && nums.valid) onComplete?.(nums.pct);
    // Report only when the calculation is complete.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed, nums.pct, nums.valid]);

  const run = () => {
    if (reduced) {
      setRevealed(3);
      return;
    }
    setRevealed(1);
    window.setTimeout(() => setRevealed(2), 620);
    window.setTimeout(() => setRevealed(3), 1240);
  };

  const steps = [
    {
      math: `${fmt(nums.y)} − ${fmt(nums.x)} = ${fmt(nums.diff)}`,
      why: 'How much the level went up, in ₹ lakh crore.',
    },
    {
      math: `${fmt(nums.diff)} ÷ ${fmt(nums.x)} = ${nums.ratio.toFixed(4)}`,
      why: 'Expressed as a share of where we started.',
    },
    {
      math: `${nums.ratio.toFixed(4)} × 100 = ${nums.pct.toFixed(2)}%`,
      why: 'Turned into a percentage.',
    },
  ];

  return (
    <div className="calc">
      <div className="calc-row" style={{ gap: '1.1rem' }}>
        <div className="field">
          <label htmlFor={`calc-from-${fromLabel}`}>{fromLabel}</label>
          <input
            id={`calc-from-${fromLabel}`}
            inputMode="decimal"
            value={a}
            readOnly={!editable}
            onChange={(e) => {
              setA(e.target.value);
              setRevealed(0);
            }}
          />
        </div>
        <span aria-hidden="true" style={{ alignSelf: 'end', paddingBottom: '0.6rem', color: 'var(--text-faint)' }}>
          →
        </span>
        <div className="field">
          <label htmlFor={`calc-to-${toLabel}`}>{toLabel}</label>
          <input
            id={`calc-to-${toLabel}`}
            inputMode="decimal"
            value={b}
            readOnly={!editable}
            onChange={(e) => {
              setB(e.target.value);
              setRevealed(0);
            }}
          />
        </div>
      </div>

      {revealed === 0 ? (
        <button type="button" className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={run} disabled={!nums.valid}>
          Work it out
        </button>
      ) : (
        <div style={{ marginTop: '0.75rem' }}>
          {steps.slice(0, revealed).map((s, i) => (
            <div className="calc-step" key={i} style={{ animationDelay: `${i * 0.04}s` }}>
              <span className="step-n">{i + 1}</span>
              <span className="step-math">{s.math}</span>
              <p className="step-why">{s.why}</p>
            </div>
          ))}
          {revealed >= 3 && (
            <p className="calc-result" style={{ color: accent }} aria-live="polite">
              {nums.pct.toFixed(2)}%
              <span style={{ fontSize: '1rem', color: 'var(--text-faint)', marginLeft: '0.75rem' }}>
                ≈ {nums.pct.toFixed(1)}%
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

const fmt = (v: number) => (Number.isFinite(v) ? v.toFixed(2) : '—');
