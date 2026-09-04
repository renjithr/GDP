import type { Vec3 } from '../lib/types';

/**
 * The village plan.
 *
 * One fixed world, laid out once and reused by every act — the visitor must always be
 * looking at the same place. Positions are deterministic (seeded RNG), so the village
 * is identical on every load and every device, and so camera framing can be authored
 * against known coordinates.
 *
 * Axes: +x east, +z south, y up. One unit ≈ one metre-ish; the plate is 96 × 80.
 */

export const PLATE = { width: 96, depth: 80 };

/** Rectangles kept clear of scatter (roads, plots, buildings). */
export type Rect = { x0: number; x1: number; z0: number; z1: number };

const rect = (x0: number, z0: number, x1: number, z1: number): Rect => ({ x0, x1, z0, z1 });

export const roads = {
  main: rect(-48, -2.8, 48, 2.8),
  north: rect(12.4, -34, 17.6, 0),
  south: rect(12.4, 0, 17.6, 30),
  west: rect(-20.6, 0, -15.4, 30),
  factorySpur: rect(17.6, 15.5, 25, 20.5),
  warehouseSpur: rect(6, 11, 10, 16),
};

export const roadList = Object.values(roads);

/** The bus route, as a closed loop of waypoints along the main road and branches. */
export const busRoute: Vec3[] = [
  [-44, 0, 1.4],
  [10, 0, 1.4],
  [15, 0, 6],
  [15, 0, 24],
  [15, 0, 6],
  [10, 0, -1.4],
  [-44, 0, -1.4],
];

export const autoRoute: Vec3[] = [
  [-18, 0, 26],
  [-18, 0, 2],
  [6, 0, 2],
  [6, 0, -1.6],
  [-18, 0, -1.6],
  [-18, 0, 26],
];

export const truckRoute: Vec3[] = [
  [44, 0, -1.4],
  [16, 0, -1.4],
  [16, 0, 13],
  [8, 0, 14],
  [8, 0, 19],
  [8, 0, 14],
  [16, 0, 13],
  [16, 0, 1.4],
  [44, 0, 1.4],
];

export const factoryTruckRoute: Vec3[] = [
  [15, 0, 4],
  [15, 0, 18],
  [26, 0, 18],
  [30, 0, 14],
  [26, 0, 18],
  [15, 0, 18],
  [15, 0, 4],
];

export const scooterRoutes: Vec3[][] = [
  [
    [5, 0, 8],
    [14, 0, 2],
    [34, 0, 1],
    [14, 0, 2],
    [5, 0, 8],
  ],
  [
    [5, 0, 8],
    [2, 0, 1.6],
    [-18, 0, 1.6],
    [-18, 0, 20],
    [-30, 0, 22],
    [-18, 0, 20],
    [-18, 0, 1.6],
    [2, 0, 1.6],
    [5, 0, 8],
  ],
  [
    [5, 0, 8],
    [15, 0, 6],
    [15, 0, -20],
    [24, 0, -24],
    [15, 0, -20],
    [15, 0, 6],
    [5, 0, 8],
  ],
];

// ---------------------------------------------------------------------------
// Seeded RNG so the village never reshuffles between loads.
// ---------------------------------------------------------------------------
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Fixed structures
// ---------------------------------------------------------------------------

export type Plot = { position: Vec3; rotation: number; scale?: number; variant?: number };

/** Paddy plots west of the village. */
export const fields: { position: Vec3; size: [number, number]; wet: boolean }[] = [
  { position: [-38, 0, -28], size: [16, 11], wet: true },
  { position: [-20, 0, -28], size: [15, 11], wet: false },
  { position: [-38, 0, -15], size: [16, 12], wet: false },
  { position: [-20, 0, -15], size: [15, 12], wet: true },
  { position: [-38, 0, -5], size: [16, 6], wet: false },
  { position: [-21, 0, -6], size: [14, 7], wet: true },
];

/** The bazaar row, north side of the main road, all facing the road. */
export const shops: Plot[] = [
  { position: [-15, 0, -6.4], rotation: 0, variant: 0 },
  { position: [-10, 0, -6.6], rotation: 0, variant: 1 },
  { position: [-5, 0, -6.4], rotation: 0, variant: 2 },
  { position: [0, 0, -6.7], rotation: 0, variant: 3 },
  { position: [5, 0, -6.4], rotation: 0, variant: 4 },
];

/** Independent carpenter workshops, lining the north branch road. */
export const carpenters: Plot[] = [
  { position: [0, 0, -25], rotation: 0.08 },
  { position: [5.5, 0, -26.5], rotation: -0.05 },
  { position: [10, 0, -24.5], rotation: 0.02 },
  { position: [20, 0, -25], rotation: -0.03 },
  { position: [25.5, 0, -26.5], rotation: 0.06 },
  { position: [31, 0, -24.5], rotation: -0.08 },
];

/** Village housing, south-west. */
export const houses: Plot[] = [
  { position: [-40, 0, 10], rotation: 0.1, variant: 0 },
  { position: [-33, 0, 9], rotation: -0.2, variant: 1 },
  { position: [-26, 0, 11], rotation: 0.05, variant: 2 },
  { position: [-41, 0, 18], rotation: -0.08, variant: 3 },
  { position: [-34, 0, 17], rotation: 0.15, variant: 4 },
  { position: [-27, 0, 19], rotation: -0.12, variant: 5 },
  { position: [-40, 0, 26], rotation: 0.2, variant: 1 },
  { position: [-33, 0, 25], rotation: -0.05, variant: 0 },
  { position: [-25, 0, 27], rotation: 0.09, variant: 3 },
  { position: [-38, 0, 33], rotation: -0.15, variant: 2 },
  { position: [-30, 0, 32], rotation: 0.04, variant: 4 },
  { position: [-23, 0, 34], rotation: -0.1, variant: 5 },
  { position: [-12, 0, 6], rotation: 0.5, variant: 2 },
  { position: [8, 0, -12], rotation: -0.3, variant: 4 },
  { position: [23, 0, -12], rotation: 0.25, variant: 0 },
  { position: [-8, 0, -13], rotation: 0.12, variant: 5 },
];

/**
 * Where the estimate is assembled, above the village. Lives here rather than with the
 * 3D components so story modules can pin an HTML label to it without importing three.
 */
export const ESTIMATE_HUB: Vec3 = [2, 27, -4];

export const anchors = {
  farm: [-26, 0, -18] as Vec3,
  shop: [-3, 0, -6] as Vec3,
  carpenter: [15, 0, -25] as Vec3,
  construction: [36, 0, -10] as Vec3,
  government: [-7, 0, 20] as Vec3,
  factory: [32, 0, 18] as Vec3,
  warehouse: [6, 0, 21] as Vec3,
  delivery: [4, 0, 8] as Vec3,
  bank: [22, 0, 6.5] as Vec3,
  busStop: [-13, 0, 4.6] as Vec3,
  centre: [0, 0, 0] as Vec3,
};

export const civic = {
  school: { position: [-8, 0, 16] as Vec3, rotation: 0 },
  clinic: { position: [-4.5, 0, 26] as Vec3, rotation: -0.3 },
  panchayat: { position: [-12, 0, 27.5] as Vec3, rotation: 0.25 },
  bank: { position: anchors.bank, rotation: Math.PI },
  waterTower: { position: [19.5, 0, -7] as Vec3 },
  pond: { position: [-34, 0, 4] as Vec3, radius: 5.5 },
};

export const industry = {
  factory: { position: anchors.factory, rotation: 0 },
  warehouse: { position: anchors.warehouse, rotation: 0 },
  delivery: { position: anchors.delivery, rotation: -0.2 },
  construction: { position: anchors.construction, rotation: 0.15 },
};

// ---------------------------------------------------------------------------
// Scatter (trees, poles, props) — rejection-sampled against everything above.
// ---------------------------------------------------------------------------

const blocked: Rect[] = [
  ...roadList,
  ...fields.map((f) => rect(f.position[0] - f.size[0] / 2 - 1, f.position[2] - f.size[1] / 2 - 1, f.position[0] + f.size[0] / 2 + 1, f.position[2] + f.size[1] / 2 + 1)),
  ...shops.map((s) => rect(s.position[0] - 3, s.position[2] - 3.5, s.position[0] + 3, s.position[2] + 3.5)),
  ...carpenters.map((c) => rect(c.position[0] - 4, c.position[2] - 4, c.position[0] + 4, c.position[2] + 4)),
  ...houses.map((h) => rect(h.position[0] - 4, h.position[2] - 4, h.position[0] + 4, h.position[2] + 4)),
  rect(-15, 11, -1, 21), // school grounds
  rect(-8, 22, -1, 30), // clinic
  rect(-16, 23, -8, 32), // panchayat
  rect(17, 2, 28, 11), // bank
  rect(20, 8, 44, 30), // factory site
  rect(-2, 13, 12, 30), // warehouse site
  rect(0, 4, 9, 12), // delivery yard
  rect(29, -18, 45, -3), // construction site
  rect(-40, -2, -28, 11), // pond
];

const inRect = (x: number, z: number, r: Rect) => x > r.x0 && x < r.x1 && z > r.z0 && z < r.z1;
const isBlocked = (x: number, z: number) => blocked.some((r) => inRect(x, z, r));

export type Scatter = { position: Vec3; scale: number; rotation: number; variant: number };

function scatter(count: number, seed: number, opts: { minScale: number; maxScale: number; variants: number }): Scatter[] {
  const rand = mulberry32(seed);
  const out: Scatter[] = [];
  let guard = 0;
  while (out.length < count && guard++ < count * 60) {
    const x = (rand() - 0.5) * (PLATE.width - 6);
    const z = (rand() - 0.5) * (PLATE.depth - 6);
    if (isBlocked(x, z)) continue;
    // Keep a little breathing room between trees.
    if (out.some((o) => (o.position[0] - x) ** 2 + (o.position[2] - z) ** 2 < 34)) continue;
    out.push({
      position: [x, 0, z],
      scale: opts.minScale + rand() * (opts.maxScale - opts.minScale),
      rotation: rand() * Math.PI * 2,
      variant: Math.floor(rand() * opts.variants),
    });
  }
  return out;
}

/** Generated once at module load; components slice this to fit the quality profile. */
export const treeScatter = scatter(96, 20260904, { minScale: 0.62, maxScale: 1.05, variants: 3 });

/** Utility poles march along the main road and the two branches. */
export const poles: Vec3[] = [
  ...Array.from({ length: 11 }, (_, i) => [-44 + i * 8, 0, 3.6] as Vec3),
  ...Array.from({ length: 4 }, (_, i) => [18.4, 0, -8 - i * 8] as Vec3),
  ...Array.from({ length: 3 }, (_, i) => [-21.8, 0, 8 + i * 8] as Vec3),
];

/** Where tiny people mill about, per activity. Reused by the ambient-life system. */
export const crowdSpots: { position: Vec3; radius: number; sector: string }[] = [
  { position: [-5, 0, -2.6], radius: 7, sector: 'shop' },
  { position: [-26, 0, -18], radius: 8, sector: 'farm' },
  { position: [15, 0, -25], radius: 9, sector: 'carpenter' },
  { position: [-8, 0, 20], radius: 6, sector: 'government' },
  { position: [36, 0, -10], radius: 5, sector: 'construction' },
  { position: [32, 0, 18], radius: 6, sector: 'factory' },
  { position: [6, 0, 21], radius: 5, sector: 'warehouse' },
  { position: [4, 0, 8], radius: 3.5, sector: 'delivery' },
];
