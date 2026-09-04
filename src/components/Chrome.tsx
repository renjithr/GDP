import { useStore } from '../state/store';
import { hashFor, neighbours, routeById, steps } from '../state/routes';
import { preloadVillage } from './VillageStage';

export function Header() {
  const routeId = useStore((s) => s.routeId);
  const furthest = useStore((s) => s.furthestStep);
  const currentStep = routeById(routeId).step;

  return (
    <header className="header">
      <a className="brand" href="#/">
        <span aria-hidden="true">🏘️</span>
        GDP Village
      </a>

      <nav className="progress" aria-label="Story progress">
        {steps.map((s) => {
          const state =
            s.step === currentStep ? 'current' : s.step <= furthest ? 'done' : 'locked';
          const locked = state === 'locked';
          return (
            <a
              key={s.step}
              className="progress-step"
              data-state={state}
              href={locked ? undefined : hashFor(s.routeId)}
              aria-current={state === 'current' ? 'step' : undefined}
              aria-disabled={locked}
              title={`${s.step}. ${s.label}`}
              onMouseEnter={s.step >= 3 ? preloadVillage : undefined}
              onClick={(e) => {
                if (locked) e.preventDefault();
              }}
            >
              <span>{s.label}</span>
            </a>
          );
        })}
      </nav>

      <div className="header-links">
        <a className="header-link" href="#/faq" aria-current={routeId === 'faq' ? 'page' : undefined}>
          FAQ
        </a>
        <a className="header-link" href="#/sources" aria-current={routeId === 'sources' ? 'page' : undefined}>
          Sources
        </a>
      </div>
    </header>
  );
}

/** Back / Next for the linear walkthrough. */
export function StoryNav({ nextLabel, onNext }: { nextLabel?: string; onNext?: () => void }) {
  const routeId = useStore((s) => s.routeId);
  const { prev, next } = neighbours(routeId);

  return (
    <div className="story-nav">
      {prev && (
        <a className="btn btn-ghost" href={hashFor(prev.id)}>
          ← Back
        </a>
      )}
      {next && (
        <a
          className="btn btn-primary"
          href={hashFor(next.id)}
          onMouseEnter={next.mode === 'stage' ? preloadVillage : undefined}
          onClick={onNext}
        >
          {nextLabel ?? `${next.title} →`}
        </a>
      )}
    </div>
  );
}

export function Footer() {
  const webgl = useStore((s) => s.webgl);
  const simpleView = useStore((s) => s.simpleView);
  const setSimpleView = useStore((s) => s.setSimpleView);

  return (
    <footer className="footer">
      <span>
        Village numbers are illustrative. India figures are official and cited on the{' '}
        <a href="#/sources">Sources</a> page.
      </span>
      <a href="#/faq">FAQ</a>
      {webgl && (
        <label className="quality-toggle">
          <input type="checkbox" checked={simpleView} onChange={(e) => setSimpleView(e.target.checked)} />
          Simple view (no 3D)
        </label>
      )}
    </footer>
  );
}
