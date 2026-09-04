import { clamp, damp, inverseLerp, lerp } from '../lib/format';

/**
 * The village is driven by economic state, not by a set of unrelated scenes.
 *
 * Every keyframe below describes the SAME village at a point in time. Dragging the
 * timeline interpolates between them, so buildings grow, fade and fall quiet
 * continuously — the canvas is never rebuilt.
 *
 * All values are 0–1 intensities. What they mean visually is each component's business.
 */
export type World = {
  year: number;
  /** Extent and liveliness of cultivation. Agriculture never disappears. */
  farm: number;
  /** Bazaar vitality: awnings out, stock on display, customers. */
  shops: number;
  /** Share of the six carpenter workshops still operating. */
  carpenters: number;
  construction: number;
  /** Size of the furniture factory, 0 = does not exist. */
  factory: number;
  warehouse: number;
  /** Delivery / platform activity. */
  delivery: number;
  /** Public and other services. */
  services: number;
  /** Road traffic density. */
  traffic: number;
  /** Tree cover — thins slightly as the industrial edge is built out. */
  trees: number;
};

type Keyframe = Omit<World, 'year'> & { year: number };

export const KEYFRAMES: Keyframe[] = [
  { year: 2010, farm: 1.0, shops: 0.85, carpenters: 1.0, construction: 0.45, factory: 0, warehouse: 0, delivery: 0, services: 0.45, traffic: 0.3, trees: 1.0 },
  { year: 2015, farm: 0.98, shops: 0.9, carpenters: 0.92, construction: 0.58, factory: 0.35, warehouse: 0, delivery: 0, services: 0.55, traffic: 0.48, trees: 0.96 },
  { year: 2018, farm: 0.96, shops: 0.9, carpenters: 0.78, construction: 0.68, factory: 0.6, warehouse: 0.42, delivery: 0.06, services: 0.66, traffic: 0.6, trees: 0.92 },
  { year: 2022, farm: 0.94, shops: 0.86, carpenters: 0.62, construction: 0.8, factory: 0.76, warehouse: 0.66, delivery: 0.5, services: 0.8, traffic: 0.76, trees: 0.87 },
  { year: 2024, farm: 0.92, shops: 0.83, carpenters: 0.5, construction: 0.86, factory: 0.87, warehouse: 0.82, delivery: 0.76, services: 0.9, traffic: 0.87, trees: 0.84 },
  { year: 2026, farm: 0.9, shops: 0.8, carpenters: 0.4, construction: 0.9, factory: 1.0, warehouse: 1.0, delivery: 1.0, services: 1.0, traffic: 1.0, trees: 0.82 },
];

export const YEAR_MIN = KEYFRAMES[0].year;
export const YEAR_MAX = KEYFRAMES[KEYFRAMES.length - 1].year;

/** Milestones the timeline snaps its labels to. */
export const MILESTONES = [
  { year: 2010, label: 'Many traditional carpenters', emoji: '🪚' },
  { year: 2015, label: 'A furniture factory opens', emoji: '🏭' },
  { year: 2018, label: 'A warehouse appears', emoji: '📦' },
  { year: 2022, label: 'Delivery & platform work arrives', emoji: '🛵' },
  { year: 2024, label: 'More service and digital activity', emoji: '📱' },
  { year: 2026, label: 'The structure has changed', emoji: '🏗️' },
];

const KEYS: (keyof Omit<World, 'year'>)[] = [
  'farm',
  'shops',
  'carpenters',
  'construction',
  'factory',
  'warehouse',
  'delivery',
  'services',
  'traffic',
  'trees',
];

/** The village state at any (fractional) year. */
export function worldAt(year: number, out?: World): World {
  const y = clamp(year, YEAR_MIN, YEAR_MAX);
  const target = out ?? ({ year: y } as World);
  target.year = y;

  let i = 0;
  while (i < KEYFRAMES.length - 2 && KEYFRAMES[i + 1].year < y) i++;
  const a = KEYFRAMES[i];
  const b = KEYFRAMES[i + 1];
  const t = inverseLerp(a.year, b.year, y);

  for (const k of KEYS) target[k] = lerp(a[k], b[k], t);
  return target;
}

/**
 * Live world state. One mutable object read by every 3D component inside useFrame,
 * so changing the year never re-renders the React tree.
 */
export const world: World = worldAt(YEAR_MAX);

let displayYear = YEAR_MAX;

/** Snap the world to a year with no easing (route jumps, reduced motion). */
export function jumpWorldTo(year: number) {
  displayYear = clamp(year, YEAR_MIN, YEAR_MAX);
  worldAt(displayYear, world);
}

/** Ease the world towards `targetYear`. Called once per frame by <WorldTicker/>. */
export function tickWorld(targetYear: number, dt: number, instant = false) {
  displayYear = instant ? targetYear : damp(displayYear, targetYear, 4.5, dt);
  if (Math.abs(displayYear - targetYear) < 0.004) displayYear = targetYear;
  worldAt(displayYear, world);
  return world;
}

export const getDisplayYear = () => displayYear;

/**
 * Smooth 0–1 presence for a thing that only exists from a given level upwards.
 * Keeps buildings from popping in at exactly the keyframe year.
 */
export const presence = (level: number, threshold = 0.02) =>
  clamp(inverseLerp(threshold, threshold + 0.18, level), 0, 1);
