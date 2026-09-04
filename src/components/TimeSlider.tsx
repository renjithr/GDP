import { useEffect, useRef, useState } from 'react';
import { useStore, YEAR_MAX, YEAR_MIN } from '../state/store';
import { MILESTONES } from '../village/worldState';
import { usePrefersReducedMotion } from '../lib/hooks';

/**
 * The signature interaction. Dragging it does not swap scenes — it drives the same
 * village's economic state, so buildings grow, close and appear continuously.
 */
export function TimeSlider() {
  const year = useStore((s) => s.year);
  const setYear = useStore((s) => s.setYear);
  const reduced = usePrefersReducedMotion();
  const [playing, setPlaying] = useState(false);
  const raf = useRef(0);

  const rounded = Math.round(year);
  const milestone = [...MILESTONES].reverse().find((m) => rounded >= m.year) ?? MILESTONES[0];

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const next = useStore.getState().year + dt * 2.6;
      if (next >= YEAR_MAX) {
        setYear(YEAR_MAX);
        setPlaying(false);
        return;
      }
      setYear(next);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [playing, setYear]);

  return (
    <div className="timeline">
      <div className="timeline-head">
        <span className="timeline-year" aria-hidden="true">
          {rounded}
        </span>
        <span className="timeline-label">
          <span aria-hidden="true">{milestone.emoji} </span>
          {milestone.label}
        </span>
      </div>

      <label className="visually-hidden" htmlFor="year-slider">
        Village year, {YEAR_MIN} to {YEAR_MAX}
      </label>
      <input
        id="year-slider"
        className="year-slider"
        type="range"
        min={YEAR_MIN}
        max={YEAR_MAX}
        step={0.05}
        value={year}
        onChange={(e) => {
          setPlaying(false);
          setYear(Number(e.target.value));
        }}
        aria-valuetext={`${rounded}. ${milestone.label}`}
      />

      <div className="milestones">
        {MILESTONES.map((m) => (
          <button
            key={m.year}
            type="button"
            className="milestone"
            data-active={rounded === m.year}
            onClick={() => {
              setPlaying(false);
              setYear(m.year);
            }}
            title={m.label}
          >
            {m.year}
          </button>
        ))}
      </div>

      {!reduced && (
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          style={{ marginTop: '0.85rem' }}
          onClick={() => {
            if (!playing && useStore.getState().year >= YEAR_MAX) setYear(YEAR_MIN);
            setPlaying((p) => !p);
          }}
        >
          {playing ? '❙❙ Pause' : '▶ Play 2010 → 2026'}
        </button>
      )}
    </div>
  );
}
