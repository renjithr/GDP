import { useEffect } from 'react';
import { useStore } from '../state/store';

type Flags = Partial<Pick<ReturnType<typeof useStore.getState>, 'signalsOn' | 'ghostsOn' | 'gridOn' | 'futureOn' | 'flowsOn'>>;

/**
 * Acts declare which 3D layers they need; leaving the act clears them.
 * Keeping this in one place stops layers from leaking between sections.
 */
export function useSceneFlags(flags: Flags) {
  const set3dFlags = useStore((s) => s.set3dFlags);
  const key = JSON.stringify(flags);
  useEffect(() => {
    set3dFlags(flags);
    return () => set3dFlags({ signalsOn: false, ghostsOn: false, gridOn: false, futureOn: false, flowsOn: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, set3dFlags]);
}
