import { create } from 'zustand';
import { detectQuality, isWebglAvailable, type QualityProfile } from '../lib/quality';
import { clamp } from '../lib/format';
import type { SectorId } from '../data/sectors';
import { routeById, routeFromHash, type CameraPoseId, type RouteId, type StageMode } from './routes';

export const YEAR_MIN = 2010;
export const YEAR_MAX = 2026;

type Store = {
  // ---- navigation -------------------------------------------------------
  routeId: RouteId;
  mode: StageMode;
  pose: CameraPoseId;
  /** Highest step the visitor has reached; earlier steps stay revisitable. */
  furthestStep: number;

  // ---- village ----------------------------------------------------------
  /** The year the world is easing towards. The renderer damps its own display year. */
  year: number;
  selectedSector: SectorId | null;
  /** Act 5: data signals flowing from activities into the estimate panel. */
  signalsOn: boolean;
  /** Act 6: translucent buildings showing what a stale picture still assumes. */
  ghostsOn: boolean;
  /** Act 7: measurement framework overlay, and whether it has been recalibrated. */
  gridOn: boolean;
  calibrated: boolean;
  /** Act 7: Furniture Ltd shown as one block, or split into three activities. */
  furnitureSplit: boolean;
  /** Act 11: faint silhouettes of activities that do not exist yet. */
  futureOn: boolean;
  /** Optional deep dive: highlight factory output vs inputs. */
  flowsOn: boolean;

  // ---- environment ------------------------------------------------------
  quality: QualityProfile;
  webgl: boolean;
  /** Visitor (or the environment) asked for the non-3D version. */
  simpleView: boolean;
  reducedMotion: boolean;
  villageReady: boolean;

  // ---- actions ----------------------------------------------------------
  applyRoute: (id: RouteId) => void;
  syncFromHash: () => void;
  setYear: (year: number) => void;
  selectSector: (id: SectorId | null) => void;
  set3dFlags: (flags: Partial<Pick<Store, 'signalsOn' | 'ghostsOn' | 'gridOn' | 'futureOn' | 'flowsOn'>>) => void;
  setCalibrated: (v: boolean) => void;
  setFurnitureSplit: (v: boolean) => void;
  setSimpleView: (v: boolean) => void;
  setReducedMotion: (v: boolean) => void;
  setVillageReady: (v: boolean) => void;
  setPose: (pose: CameraPoseId) => void;
  setMode: (mode: StageMode) => void;
};

/** Flags that belong to one act only, so leaving an act cleans up after itself. */
const CLEAN_SLATE = {
  signalsOn: false,
  ghostsOn: false,
  gridOn: false,
  futureOn: false,
  flowsOn: false,
  furnitureSplit: false,
  selectedSector: null,
} as const;

const initialRoute = typeof window === 'undefined' ? routeById('claim') : routeFromHash(window.location.hash);

export const useStore = create<Store>((set, get) => ({
  routeId: initialRoute.id,
  mode: initialRoute.mode,
  pose: initialRoute.pose ?? 'overview',
  furthestStep: initialRoute.step ?? 1,

  year: initialRoute.year ?? YEAR_MAX,
  selectedSector: null,
  signalsOn: false,
  ghostsOn: false,
  gridOn: false,
  calibrated: false,
  furnitureSplit: false,
  futureOn: false,
  flowsOn: false,

  quality: detectQuality(),
  webgl: isWebglAvailable(),
  simpleView: false,
  reducedMotion: false,
  villageReady: false,

  applyRoute: (id) => {
    const route = routeById(id);
    set((s) => ({
      ...CLEAN_SLATE,
      routeId: route.id,
      mode: route.mode,
      pose: route.pose ?? 'overview',
      year: route.year ?? s.year,
      furthestStep: Math.max(s.furthestStep, route.step ?? 0),
    }));
    if (typeof document !== 'undefined') {
      document.title =
        route.id === 'claim'
          ? "GDP Village — Why India's GDP grew 7.8%, not 2.6%"
          : `${route.title} — GDP Village`;
    }
  },

  syncFromHash: () => {
    const route = routeFromHash(window.location.hash);
    if (route.id !== get().routeId) get().applyRoute(route.id);
  },

  setYear: (year) => set({ year: clamp(year, YEAR_MIN, YEAR_MAX) }),
  selectSector: (id) => set({ selectedSector: id }),
  set3dFlags: (flags) => set(flags),
  setCalibrated: (v) => set({ calibrated: v }),
  setFurnitureSplit: (v) => set({ furnitureSplit: v }),
  setSimpleView: (v) => set({ simpleView: v }),
  setReducedMotion: (v) => set({ reducedMotion: v }),
  setVillageReady: (v) => set({ villageReady: v }),
  setPose: (pose) => set({ pose }),
  setMode: (mode) => set({ mode }),
}));

/** True when the WebGL village should be mounted at all. */
export const shouldRender3d = (s: Store) => s.webgl && !s.simpleView;

export function navigate(id: RouteId) {
  const path = routeById(id).path;
  if (window.location.hash !== `#${path}`) window.location.hash = path;
  else useStore.getState().applyRoute(id);
}
