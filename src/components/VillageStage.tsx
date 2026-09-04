import { Suspense, lazy, useEffect, useState } from 'react';
import { useStore } from '../state/store';

const VillageScene = lazy(() => import('../village/VillageScene'));

/** Warms the 3D chunk before the visitor reaches the village. */
export function preloadVillage() {
  void import('../village/VillageScene');
}

/**
 * The persistent canvas.
 *
 * Mounted the first time an act needs it and then kept alive for the rest of the visit —
 * WebGL contexts are never destroyed and recreated between sections. Act 1 ships and
 * paints before this chunk is even requested.
 */
export function VillageStage() {
  const mode = useStore((s) => s.mode);
  const webgl = useStore((s) => s.webgl);
  const simpleView = useStore((s) => s.simpleView);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (mode !== 'hidden') setMounted(true);
  }, [mode]);

  if (!webgl || simpleView) return null;

  return (
    <div className="stage" data-mode={mode} aria-hidden="true">
      {mounted && (
        <Suspense fallback={<div className="stage-loading">Building the village…</div>}>
          <VillageScene />
        </Suspense>
      )}
    </div>
  );
}
