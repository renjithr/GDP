import { sectors } from '../data/sectors';
import { useStore } from '../state/store';
import { worldAt } from '../village/worldState';

const LEVEL_KEY = {
  farm: 'farm',
  shop: 'shops',
  carpenter: 'carpenters',
  construction: 'construction',
  government: 'services',
  factory: 'factory',
  warehouse: 'warehouse',
  delivery: 'delivery',
} as const;

/**
 * The village without WebGL.
 *
 * Same data, same year states, same story — rendered as plain DOM. It is used when
 * WebGL is unavailable and whenever a visitor chooses the simple view, so no part of
 * the explanation depends on the 3D scene being able to run.
 */
export function VillageFallback() {
  const year = useStore((s) => s.year);
  const state = worldAt(year);
  const rounded = Math.round(year);

  return (
    <div className="fallback-village">
      <p className="eyebrow" style={{ marginBottom: '0.75rem' }}>
        GDP Village · {rounded} · simple view
      </p>
      <div className="fallback-grid">
        {sectors.map((s) => {
          const level = state[LEVEL_KEY[s.id]];
          const absent = level < 0.03;
          return (
            <div className="fallback-tile" key={s.id} data-absent={absent}>
              <p className="head">
                <span aria-hidden="true">{s.emoji}</span>
                {s.label}
              </p>
              <div className="bar" aria-hidden="true">
                <i style={{ width: `${Math.round(level * 100)}%` }} />
              </div>
              <p className="count">
                {absent ? 'not in the village yet' : `activity ${Math.round(level * 100)} / 100`}
              </p>
            </div>
          );
        })}
      </div>
      <p style={{ fontSize: '0.82rem', color: 'var(--text-faint)', margin: '0.9rem 0 0' }}>
        Bars show how much of each activity the village contains in {rounded}, on the same
        scale the 3D village uses. They are part of the teaching model, not measurements
        of anything in India.
      </p>
    </div>
  );
}
