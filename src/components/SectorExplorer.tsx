import { bandColor, sectors, type SectorId } from '../data/sectors';
import { useStore } from '../state/store';

/**
 * Selecting an activity highlights it in the village, moves the camera and opens this
 * card. The chips are the primary, keyboard-operable path — clicking the 3D object is
 * a shortcut, never the only way in.
 */
export function SectorExplorer({ only }: { only?: SectorId[] }) {
  const selected = useStore((s) => s.selectedSector);
  const select = useStore((s) => s.selectSector);
  const year = useStore((s) => s.year);

  const list = only ? sectors.filter((s) => only.includes(s.id)) : sectors;
  const current = selected ? sectors.find((s) => s.id === selected) : null;

  return (
    <div>
      <div className="sector-grid" role="group" aria-label="Economic activities in the village">
        {list.map((s) => {
          const exists = year >= s.appearsIn - 0.5;
          return (
            <button
              key={s.id}
              type="button"
              className="sector-chip"
              aria-pressed={selected === s.id}
              disabled={!exists}
              title={exists ? s.what : `Does not exist in the village until ${s.appearsIn}`}
              onClick={() => select(selected === s.id ? null : s.id)}
            >
              <span className="emoji" aria-hidden="true">
                {s.emoji}
              </span>
              {s.label}
            </button>
          );
        })}
      </div>

      {current && (
        <div className="sector-card" role="region" aria-live="polite">
          <h3>
            <span aria-hidden="true">{current.emoji}</span>
            {current.label}
          </h3>
          <span className="band" style={{ color: bandColor[current.band] }}>
            {current.band}
          </span>
          <p>{current.what}</p>
          <p style={{ marginBottom: '0.35rem' }}>{current.bandWhy}</p>
          <p className="stat-label" style={{ marginBottom: 0 }}>
            Information used
          </p>
          <ul className="signal-list">
            {current.signals.map((sig) => (
              <li key={sig}>{sig}</li>
            ))}
          </ul>
          <p className="visually-hidden">In the village you can see: {current.sceneDescription}</p>
          <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: '0.9rem' }} onClick={() => select(null)}>
            Close
          </button>
        </div>
      )}
    </div>
  );
}
