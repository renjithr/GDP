import * as THREE from 'three';
import { Builder, G, slabGeometry } from './mesh';
import { C } from './palette';
import { civic, fields, houses, poles, roads, shops } from './layout';

/**
 * Constructors for every object in the village. Each returns a merged, vertex-coloured
 * BufferGeometry, built once and reused. Nothing here touches React.
 */

/** Two tilted slabs forming a ridged roof running along X. */
function gableRoof(
  b: Builder,
  o: { x: number; y: number; z: number; width: number; depth: number; rise: number; color: string; thickness?: number },
) {
  const half = o.depth / 2;
  const angle = Math.atan2(o.rise, half);
  const slope = Math.hypot(half, o.rise);
  const t = o.thickness ?? 0.18;
  for (const sign of [1, -1]) {
    b.box({
      position: [o.x, o.y + o.rise / 2, o.z + (sign * o.depth) / 4],
      rotation: [sign * angle, 0, 0],
      scale: [o.width, t, slope],
      color: o.color,
    });
  }
  // Ridge cap.
  b.box({ position: [o.x, o.y + o.rise, o.z], scale: [o.width + 0.1, 0.16, 0.3], color: o.color });
}

/** A saw-tooth industrial roof: north-light glazing, the classic factory silhouette. */
function sawtoothRoof(b: Builder, o: { x: number; y: number; z: number; width: number; depth: number; teeth: number }) {
  const step = o.depth / o.teeth;
  for (let i = 0; i < o.teeth; i++) {
    const z = o.z - o.depth / 2 + step * (i + 0.5);
    b.box({ position: [o.x, o.y + 0.55, z + step * 0.1], rotation: [0.5, 0, 0], scale: [o.width, 0.16, step * 1.25], color: C.metal });
    b.box({ position: [o.x, o.y + 0.6, z - step * 0.42], scale: [o.width * 0.98, 1.1, 0.14], color: '#a9c6d2' });
  }
}

// ---------------------------------------------------------------------------
// Terrain
// ---------------------------------------------------------------------------

export function buildTerrain(): THREE.BufferGeometry {
  const b = new Builder();

  // Roads and lanes, laid as thin slabs just above the plate.
  const roadRects = [roads.main, roads.north, roads.south, roads.west, roads.factorySpur, roads.warehouseSpur];
  for (const r of roadRects) {
    b.box({
      position: [(r.x0 + r.x1) / 2, 0.06, (r.z0 + r.z1) / 2],
      scale: [r.x1 - r.x0, 0.12, r.z1 - r.z0],
      color: C.road,
    });
    // Worn edges.
    b.box({ position: [(r.x0 + r.x1) / 2, 0.05, r.z0], scale: [r.x1 - r.x0, 0.1, 0.5], color: C.roadEdge });
    b.box({ position: [(r.x0 + r.x1) / 2, 0.05, r.z1], scale: [r.x1 - r.x0, 0.1, 0.5], color: C.roadEdge });
  }

  // Field plots: soil bed plus raised bunds.
  for (const f of fields) {
    const [x, , z] = f.position;
    const [w, d] = f.size;
    b.box({ position: [x, 0.07, z], scale: [w, 0.14, d], color: f.wet ? C.paddy : C.paddyYoung });
    for (const [ox, oz, sw, sd] of [
      [0, -d / 2, w, 0.5],
      [0, d / 2, w, 0.5],
      [-w / 2, 0, 0.5, d],
      [w / 2, 0, 0.5, d],
    ]) {
      b.box({ position: [x + ox, 0.12, z + oz], scale: [sw, 0.24, sd], color: C.soil });
    }
  }

  // Pond with a soil rim.
  b.add(G.cyl6, { position: [civic.pond.position[0], 0.05, civic.pond.position[2]], scale: [civic.pond.radius * 2.2, 0.2, civic.pond.radius * 2.2], color: C.soil });
  b.add(G.cyl6, { position: [civic.pond.position[0], 0.11, civic.pond.position[2]], scale: [civic.pond.radius * 2, 0.16, civic.pond.radius * 2], color: C.water });

  return b.build();
}

export function buildPlateTop(width: number, depth: number): THREE.BufferGeometry {
  const geo = slabGeometry(-width / 2, -depth / 2, width / 2, depth / 2, 0);
  return geo;
}

// ---------------------------------------------------------------------------
// Housing and the bazaar
// ---------------------------------------------------------------------------

function addHouse(b: Builder, x: number, z: number, rot: number, variant: number) {
  const wall = C.wall[variant % C.wall.length];
  const w = 4.4;
  const d = 3.6;
  const h = 2.5;
  const cos = Math.cos(rot);
  const sin = Math.sin(rot);
  const at = (lx: number, ly: number, lz: number): [number, number, number] => [
    x + lx * cos + lz * sin,
    ly,
    z - lx * sin + lz * cos,
  ];

  b.box({ position: at(0, 0.18, 0), rotation: [0, rot, 0], scale: [w + 0.5, 0.36, d + 0.5], color: C.wallShade });
  b.box({ position: at(0, 0.36 + h / 2, 0), rotation: [0, rot, 0], scale: [w, h, d], color: wall });
  b.add(G.pyramid, {
    position: at(0, 0.36 + h + 1.0, 0),
    rotation: [0, rot + Math.PI / 4, 0],
    scale: [w + 1.1, 2.1, d + 1.1],
    color: variant % 3 === 2 ? C.roofTileDark : C.roofTile,
  });
  // Door and a window, on the +z face.
  b.box({ position: at(0, 1.1, d / 2 + 0.03), rotation: [0, rot, 0], scale: [1, 1.5, 0.12], color: C.timberDark });
  b.box({ position: at(1.4, 1.7, d / 2 + 0.03), rotation: [0, rot, 0], scale: [0.8, 0.7, 0.12], color: '#6f8b96' });
}

export function buildHouses(): THREE.BufferGeometry {
  const b = new Builder();
  for (const h of houses) addHouse(b, h.position[0], h.position[2], h.rotation, h.variant ?? 0);
  return b.build();
}

/** The bazaar structures themselves — always present. */
export function buildShops(): THREE.BufferGeometry {
  const b = new Builder();
  shops.forEach((s, i) => {
    const [x, , z] = s.position;
    const wall = C.wall[(i + 1) % C.wall.length];
    b.box({ position: [x, 0.15, z], scale: [4.6, 0.3, 3.6], color: C.wallShade });
    b.box({ position: [x, 1.6, z], scale: [4.2, 2.9, 3.2], color: wall });
    gableRoof(b, { x, y: 3.05, z, width: 4.9, depth: 4.1, rise: 0.85, color: i % 2 ? C.roofTile : C.roofTileDark });
    // Counter opening facing the road (-z).
    b.box({ position: [x, 1.0, z - 1.63], scale: [3.2, 1.0, 0.16], color: C.timber });
    b.box({ position: [x, 2.5, z - 1.63], scale: [3.4, 0.55, 0.12], color: i % 2 ? '#2f6ea8' : '#b6472e' });
  });
  return b.build();
}

/** Awnings, stock and signage — faded in and out with bazaar vitality. */
export function buildShopLife(): THREE.BufferGeometry {
  const b = new Builder();
  shops.forEach((s, i) => {
    const [x, , z] = s.position;
    b.box({ position: [x, 2.35, z - 2.7], rotation: [0.42, 0, 0], scale: [4.4, 0.1, 2.3], color: i % 2 ? '#3f7fbf' : '#d9534f' });
    b.cyl({ position: [x - 1.9, 1.15, z - 3.6], scale: [0.12, 2.3, 0.12], color: C.timberDark });
    b.cyl({ position: [x + 1.9, 1.15, z - 3.6], scale: [0.12, 2.3, 0.12], color: C.timberDark });
    for (let k = 0; k < 3; k++) {
      b.box({ position: [x - 1.3 + k * 1.3, 0.55, z - 2.4], scale: [0.9, 0.7, 0.7], color: k % 2 ? '#e0a13a' : '#5fa877' });
    }
  });
  return b.build();
}

// ---------------------------------------------------------------------------
// Carpenters — the trade the story turns on
// ---------------------------------------------------------------------------

function workshopShell(b: Builder, rot: number) {
  const w = 5.4;
  const d = 4.4;
  // Four posts and an open front.
  for (const [px, pz] of [
    [-w / 2 + 0.3, -d / 2 + 0.3],
    [w / 2 - 0.3, -d / 2 + 0.3],
    [-w / 2 + 0.3, d / 2 - 0.3],
    [w / 2 - 0.3, d / 2 - 0.3],
  ]) {
    b.cyl({ position: [px, 1.2, pz], rotation: [0, rot, 0], scale: [0.26, 2.4, 0.26], color: C.timberDark });
  }
  b.box({ position: [0, 1.3, d / 2 - 0.1], scale: [w, 2.6, 0.3], color: C.timber });
  b.box({ position: [-w / 2 + 0.15, 1.3, 0], scale: [0.3, 2.6, d], color: C.timber });
  gableRoof(b, { x: 0, y: 2.4, z: 0, width: w + 0.9, depth: d + 1, rise: 0.8, color: C.roofTile });
}

export function buildWorkshopShell(): THREE.BufferGeometry {
  const b = new Builder();
  workshopShell(b, 0);
  return b.build();
}

/** Timber, bench and finished furniture — present only while the workshop is working. */
export function buildWorkshopWork(): THREE.BufferGeometry {
  const b = new Builder();
  b.box({ position: [0, 0.85, -0.4], scale: [3, 0.2, 1.2], color: C.timber });
  b.box({ position: [-1.3, 0.42, -0.4], scale: [0.2, 0.85, 1], color: C.timberDark });
  b.box({ position: [1.3, 0.42, -0.4], scale: [0.2, 0.85, 1], color: C.timberDark });
  for (let i = 0; i < 4; i++) {
    b.box({
      position: [-2.1, 0.2 + i * 0.28, 1.2 - i * 0.05],
      rotation: [0, 0.05 * i, 0],
      scale: [1.1, 0.25, 3],
      color: i % 2 ? C.timber : '#cf9d5c',
    });
  }
  // A finished chair standing outside the shed.
  b.box({ position: [2.6, 0.5, -2.6], scale: [0.9, 0.12, 0.9], color: C.timber });
  b.box({ position: [2.6, 0.95, -3], scale: [0.9, 0.9, 0.12], color: C.timber });
  for (const [lx, lz] of [
    [-0.35, -0.35],
    [0.35, -0.35],
    [-0.35, 0.35],
    [0.35, 0.35],
  ]) {
    b.box({ position: [2.6 + lx, 0.25, -2.6 + lz], scale: [0.1, 0.5, 0.1], color: C.timberDark });
  }
  return b.build();
}

/** The shutter that comes down when a workshop stops trading. */
export function buildWorkshopShutter(): THREE.BufferGeometry {
  const b = new Builder();
  b.box({ position: [0, 1.25, -2.05], scale: [5.2, 2.5, 0.16], color: '#9aa3a2' });
  for (let i = 0; i < 5; i++) {
    b.box({ position: [0, 0.35 + i * 0.5, -1.96], scale: [5.1, 0.08, 0.06], color: '#7d8685' });
  }
  return b.build();
}

// ---------------------------------------------------------------------------
// Civic
// ---------------------------------------------------------------------------

export function buildCivic(): THREE.BufferGeometry {
  const b = new Builder();

  // Government high school: long two-bay block with a veranda.
  const s = civic.school.position;
  b.box({ position: [s[0], 0.2, s[2]], scale: [15, 0.4, 8], color: C.wallShade });
  b.box({ position: [s[0], 2, s[2]], scale: [14, 3.2, 7], color: '#ecd6a4' });
  gableRoof(b, { x: s[0], y: 3.6, z: s[2], width: 15.2, depth: 8.4, rise: 1.1, color: C.roofTile });
  for (let i = 0; i < 6; i++) {
    b.cyl({ position: [s[0] - 6 + i * 2.4, 1.7, s[2] - 3.9], scale: [0.34, 3.4, 0.34], color: '#f4ece0' });
    b.box({ position: [s[0] - 6 + i * 2.4, 2.3, s[2] + 3.55], scale: [1.3, 1.2, 0.1], color: '#5f7f8c' });
  }
  b.box({ position: [s[0], 1.2, s[2] - 4.2], scale: [14, 0.3, 1.4], color: '#e4dcc9' });
  // Flagpole.
  b.cyl({ position: [s[0] + 8.4, 2.6, s[2] - 2], scale: [0.14, 5.2, 0.14], color: '#dcdcd2' });
  b.box({ position: [s[0] + 9.1, 4.7, s[2] - 2], scale: [1.3, 0.8, 0.06], color: '#e8a13a' });

  // Clinic.
  const c = civic.clinic.position;
  b.box({ position: [c[0], 1.4, c[2]], rotation: [0, civic.clinic.rotation, 0], scale: [6.5, 2.8, 5], color: '#f2f0e6' });
  gableRoof(b, { x: c[0], y: 2.8, z: c[2], width: 7.2, depth: 5.6, rise: 0.8, color: C.roofTileDark });
  b.box({ position: [c[0], 3.4, c[2] - 2.6], scale: [1.1, 0.28, 0.1], color: '#c0392b' });
  b.box({ position: [c[0], 3.4, c[2] - 2.6], scale: [0.28, 1.1, 0.1], color: '#c0392b' });

  // Panchayat office.
  const p = civic.panchayat.position;
  b.box({ position: [p[0], 1.3, p[2]], rotation: [0, civic.panchayat.rotation, 0], scale: [6, 2.6, 4.6], color: '#d3dfc0' });
  gableRoof(b, { x: p[0], y: 2.6, z: p[2], width: 6.6, depth: 5.2, rise: 0.7, color: C.roofTile });

  // Grama bank: a small colonnaded block, the one "formal" building in the village.
  const k = civic.bank.position;
  b.box({ position: [k[0], 0.35, k[2]], scale: [9, 0.7, 7], color: '#e6e0d2' });
  b.box({ position: [k[0], 2.2, k[2] + 0.6], scale: [7.6, 3.2, 5], color: '#f4f1e6' });
  for (let i = 0; i < 4; i++) {
    b.cyl({ position: [k[0] - 2.7 + i * 1.8, 2.2, k[2] - 2.4], scale: [0.5, 3.4, 0.5], color: '#ffffff' });
  }
  b.box({ position: [k[0], 4.05, k[2] - 0.9], scale: [8.4, 0.45, 4.6], color: '#2f6ea8' });
  gableRoof(b, { x: k[0], y: 4.35, z: k[2] + 0.6, width: 8, depth: 5.6, rise: 0.9, color: C.roofTile });

  // Water tower on stilts.
  const w = civic.waterTower.position;
  for (const [dx, dz] of [[-1.1, -1.1], [1.1, -1.1], [-1.1, 1.1], [1.1, 1.1]]) {
    b.cyl({ position: [w[0] + dx, 3, w[2] + dz], rotation: [0, 0, dx > 0 ? -0.05 : 0.05], scale: [0.24, 6, 0.24], color: '#b9bdb4' });
  }
  b.cyl({ position: [w[0], 3.2, w[2]], scale: [2.6, 0.16, 2.6], color: '#a5a99f' });
  b.add(G.cyl6, { position: [w[0], 7, w[2]], scale: [3.4, 2.6, 3.4], color: '#cfd3ca' });
  b.add(G.cone, { position: [w[0], 8.8, w[2]], scale: [3.6, 1.2, 3.6], color: C.metalDark });

  // Bus stop.
  b.box({ position: [-13, 0.1, 4.6], scale: [5, 0.2, 2.6], color: C.concrete });
  b.cyl({ position: [-15.2, 1.3, 4.6], scale: [0.18, 2.6, 0.18], color: C.metalDark });
  b.cyl({ position: [-10.8, 1.3, 4.6], scale: [0.18, 2.6, 0.18], color: C.metalDark });
  b.box({ position: [-13, 2.7, 4.7], rotation: [0.12, 0, 0], scale: [4.6, 0.16, 2.2], color: '#4a6f86' });
  b.box({ position: [-13, 0.75, 5.4], scale: [4, 0.16, 0.8], color: C.timber });

  return b.build();
}

/** Utility poles plus the wires between them, as a separate line geometry. */
export function buildPoles(): { poles: THREE.BufferGeometry; wires: THREE.BufferGeometry } {
  const b = new Builder();
  for (const [x, , z] of poles) {
    b.cyl({ position: [x, 3, z], scale: [0.22, 6, 0.22], color: '#9c8a6f' });
    b.box({ position: [x, 5.6, z], scale: [1.8, 0.14, 0.14], color: '#8b7a62' });
  }
  const pts: number[] = [];
  for (let i = 0; i < poles.length - 1; i++) {
    const a = poles[i];
    const c = poles[i + 1];
    // Only string a wire between neighbours on the same run.
    if (Math.hypot(a[0] - c[0], a[2] - c[2]) > 12) continue;
    pts.push(a[0], 5.6, a[2], c[0], 5.6, c[2]);
    pts.push(a[0], 5.2, a[2], c[0], 5.2, c[2]);
  }
  const wires = new THREE.BufferGeometry();
  wires.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  return { poles: b.build(), wires };
}

// ---------------------------------------------------------------------------
// The new economy
// ---------------------------------------------------------------------------

export function buildFactoryCore(): THREE.BufferGeometry {
  const b = new Builder();
  const [x, , z] = civicFactory;
  b.box({ position: [x, 0.12, z], scale: [26, 0.24, 20], color: C.concrete });
  b.box({ position: [x - 3, 2.6, z], scale: [16, 5.2, 11], color: C.metalWall });
  sawtoothRoof(b, { x: x - 3, y: 5.2, z, width: 16, depth: 11, teeth: 4 });
  b.box({ position: [x - 3, 1.6, z - 5.6], scale: [16.2, 3.2, 0.2], color: '#9fb0b8' });
  for (let i = 0; i < 5; i++) {
    b.box({ position: [x - 9.5 + i * 3.2, 3.4, z - 5.7], scale: [2, 1.4, 0.14], color: '#a9c6d2' });
  }
  b.box({ position: [x - 3, 1.4, z - 5.8], scale: [3.6, 2.8, 0.3], color: C.metalDark });
  b.cyl({ position: [x + 6.4, 4.6, z - 3], scale: [1.3, 9.2, 1.3], color: '#c9cec7' });
  b.cyl({ position: [x + 6.4, 9.4, z - 3], scale: [1.5, 0.5, 1.5], color: C.metalDark });
  return b.build();
}

/** Second phase of the plant, faded in as the factory reaches full size. */
export function buildFactoryExpansion(): THREE.BufferGeometry {
  const b = new Builder();
  const [x, , z] = civicFactory;
  b.box({ position: [x + 7, 2.2, z + 6], scale: [10, 4.4, 8], color: '#c2ccd1' });
  gableRoof(b, { x: x + 7, y: 4.4, z: z + 6, width: 10.6, depth: 8.6, rise: 1.2, color: C.metal });
  b.cyl({ position: [x + 2.2, 4, z + 8.6], scale: [1, 8, 1], color: '#c9cec7' });
  for (let i = 0; i < 6; i++) {
    b.box({ position: [x - 10 + (i % 3) * 2.2, 0.6, z + 8 + Math.floor(i / 3) * 2], scale: [1.9, 1.1, 1.7], color: i % 2 ? '#cf9d5c' : '#b98a4e' });
  }
  return b.build();
}

export function buildWarehouse(): THREE.BufferGeometry {
  const b = new Builder();
  const [x, , z] = civicWarehouse;
  b.box({ position: [x, 0.12, z], scale: [18, 0.24, 16], color: C.concrete });
  b.box({ position: [x, 2.5, z], scale: [13, 5, 9], color: '#b8c2c6' });
  gableRoof(b, { x, y: 5, z, width: 13.8, depth: 9.8, rise: 1.4, color: C.metal });
  // Raised loading bay with roller doors facing the lane.
  b.box({ position: [x, 0.7, z - 5.4], scale: [13, 1.4, 2.4], color: C.concrete });
  for (let i = 0; i < 3; i++) {
    b.box({ position: [x - 4 + i * 4, 2.6, z - 4.55], scale: [2.8, 2.6, 0.18], color: '#8d9aa0' });
  }
  b.box({ position: [x, 5.5, z - 4.5], scale: [6, 0.9, 0.16], color: '#4d6f7d' });
  return b.build();
}

export function buildWarehouseExpansion(): THREE.BufferGeometry {
  const b = new Builder();
  const [x, , z] = civicWarehouse;
  b.box({ position: [x + 0.5, 2.1, z + 7], scale: [11, 4.2, 5], color: '#c3ccd0' });
  gableRoof(b, { x: x + 0.5, y: 4.2, z: z + 7, width: 11.6, depth: 5.6, rise: 1, color: C.metal });
  return b.build();
}

export function buildDeliveryHub(): THREE.BufferGeometry {
  const b = new Builder();
  const [x, , z] = civicDelivery;
  b.box({ position: [x, 0.1, z], scale: [8, 0.2, 6], color: C.concrete });
  b.box({ position: [x, 1.5, z + 1], scale: [4, 2.8, 3], color: '#e8e2d4' });
  gableRoof(b, { x, y: 2.9, z: z + 1, width: 4.6, depth: 3.6, rise: 0.6, color: '#df7139' });
  b.box({ position: [x, 2.4, z - 0.6], scale: [3.4, 0.5, 0.12], color: '#df7139' });
  // Canopy over the loading spot.
  b.cyl({ position: [x - 2.6, 1.2, z - 2.2], scale: [0.14, 2.4, 0.14], color: C.metalDark });
  b.cyl({ position: [x + 2.6, 1.2, z - 2.2], scale: [0.14, 2.4, 0.14], color: C.metalDark });
  b.box({ position: [x, 2.5, z - 2.2], rotation: [0.1, 0, 0], scale: [6, 0.12, 3], color: '#5fa877' });
  for (let i = 0; i < 4; i++) {
    b.box({ position: [x - 2.4 + i * 1.5, 0.55, z + 2.6], scale: [1.1, 0.9, 1.1], color: i % 2 ? '#d9a441' : '#cf8a3c' });
  }
  return b.build();
}

export function buildConstruction(): THREE.BufferGeometry {
  const b = new Builder();
  const [x, , z] = civicConstruction;
  b.box({ position: [x, 0.15, z], scale: [14, 0.3, 12], color: C.soil });
  b.box({ position: [x, 0.45, z], scale: [10, 0.6, 8], color: C.concrete });
  // Rebar columns.
  for (const [dx, dz] of [[-4.5, -3.5], [0, -3.5], [4.5, -3.5], [-4.5, 3.5], [0, 3.5], [4.5, 3.5]]) {
    b.box({ position: [x + dx, 2.2, z + dz], scale: [0.7, 3.4, 0.7], color: C.concrete });
    for (let i = 0; i < 4; i++) {
      b.cyl({ position: [x + dx + (i % 2 ? 0.22 : -0.22), 4.4, z + dz + (i < 2 ? 0.22 : -0.22)], scale: [0.07, 1.6, 0.07], color: C.rebar });
    }
  }
  // Part-built brick walls at differing heights.
  const walls: [number, number, number, number, number][] = [
    [-2.2, -3.5, 4.4, 2.6, 0.6],
    [-4.8, 0, 0.6, 2.0, 6.8],
    [2.4, 0, 0.6, 1.4, 6.8],
    [1.2, 3.5, 6.6, 2.2, 0.6],
  ];
  for (const [dx, dz, w, h, d] of walls) {
    b.box({ position: [x + dx, 0.75 + h / 2, z + dz], scale: [w, h, d], color: C.brick });
  }
  // Scaffolding, sand heap and brick stacks.
  for (let i = 0; i < 4; i++) {
    b.cyl({ position: [x - 5.6, 2, z - 3 + i * 2], scale: [0.12, 4, 0.12], color: '#a9b0a2' });
  }
  b.box({ position: [x - 5.6, 3.9, z], scale: [0.14, 0.14, 7], color: '#a9b0a2' });
  b.box({ position: [x - 5.6, 2.2, z], scale: [1.2, 0.12, 7], color: C.timber });
  b.add(G.cone, { position: [x + 5.6, 0.9, z - 4.6], scale: [4.4, 1.8, 4.4], color: '#c9b892' });
  for (let i = 0; i < 3; i++) {
    b.box({ position: [x + 5.4, 0.4 + i * 0.5, z + 3], scale: [2.4, 0.5, 1.8], color: C.brick });
  }
  return b.build();
}

const civicFactory: [number, number, number] = [32, 0, 18];
const civicWarehouse: [number, number, number] = [6, 0, 21];
const civicDelivery: [number, number, number] = [4, 0, 8];
const civicConstruction: [number, number, number] = [36, 0, -10];

// ---------------------------------------------------------------------------
// Instanced scatter pieces
// ---------------------------------------------------------------------------

export function buildTree(variant: number): THREE.BufferGeometry {
  const b = new Builder();
  if (variant === 2) {
    // Palm: leaning trunk with a crown of fronds.
    for (let i = 0; i < 4; i++) {
      b.cyl({ position: [i * 0.1, 0.55 + i * 0.95, 0], rotation: [0, 0, -0.05 * i], scale: [0.28 - i * 0.03, 1, 0.28 - i * 0.03], color: '#a58a5e' });
    }
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.box({
        position: [0.4 + Math.cos(a) * 1, 4.1, Math.sin(a) * 1],
        rotation: [0, -a, -0.44],
        scale: [2.2, 0.09, 0.6],
        color: i % 2 ? C.palm : C.crownDeep,
      });
    }
    return b.build();
  }
  b.cyl({ position: [0, 0.85, 0], scale: [0.34, 1.7, 0.34], color: C.trunk });
  if (variant === 1) {
    b.add(G.cone, { position: [0, 2.5, 0], scale: [2.2, 3, 2.2], color: C.crownDeep });
    b.add(G.cone, { position: [0, 3.4, 0], scale: [1.6, 2.1, 1.6], color: C.crown });
  } else {
    b.add(G.sphere, { position: [0, 2.5, 0], scale: [2.9, 2.4, 2.9], color: C.crown });
    b.add(G.sphere, { position: [0.8, 3.1, 0.35], scale: [1.8, 1.5, 1.8], color: C.crownAlt });
    b.add(G.sphere, { position: [-0.85, 2.8, -0.45], scale: [1.7, 1.4, 1.7], color: C.crownDeep });
  }
  return b.build();
}

/** A single tuft of crop, instanced many times per field. */
export function buildCrop(): THREE.BufferGeometry {
  const b = new Builder();
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    b.box({
      position: [Math.cos(a) * 0.09, 0.32, Math.sin(a) * 0.09],
      rotation: [Math.sin(a) * 0.15, a, Math.cos(a) * 0.15],
      scale: [0.1, 0.95, 0.1],
      color: i === 1 ? C.paddyYoung : C.paddy,
    });
  }
  return b.build();
}

/** Tiny stylised person: no rig, no animation clips, just a shape that reads as human. */
export function buildPerson(): THREE.BufferGeometry {
  const b = new Builder();
  b.add(G.cyl6, { position: [0, 0.32, 0], scale: [0.42, 0.64, 0.34], color: '#ffffff' });
  b.box({ position: [0, 0.78, 0], scale: [0.44, 0.42, 0.3], color: '#ffffff' });
  b.add(G.sphere, { position: [0, 1.08, 0], scale: [0.32, 0.34, 0.32], color: '#6b503c' });
  return b.build();
}

export function buildCarton(): THREE.BufferGeometry {
  const b = new Builder();
  b.box({ position: [0, 0.4, 0], scale: [0.9, 0.8, 0.9], color: '#c89a5e' });
  b.box({ position: [0, 0.81, 0], scale: [0.92, 0.04, 0.3], color: '#a97f47' });
  return b.build();
}

// ---------------------------------------------------------------------------
// Vehicles
// ---------------------------------------------------------------------------

function wheels(b: Builder, positions: [number, number, number][], r = 0.42) {
  for (const [x, y, z] of positions) {
    b.add(G.cyl, { position: [x, y, z], rotation: [0, 0, Math.PI / 2], scale: [r * 2, 0.28, r * 2], color: '#2f3335' });
  }
}

export function buildBus(): THREE.BufferGeometry {
  const b = new Builder();
  b.box({ position: [0, 1.5, 0], scale: [2.6, 1.9, 8.4], color: C.busBody });
  b.box({ position: [0, 2.5, 0], scale: [2.62, 0.34, 8.2], color: C.busStripe });
  b.box({ position: [0, 1.05, 0], scale: [2.64, 0.28, 8.2], color: C.busStripe });
  b.box({ position: [0, 2.5, -4.2], scale: [2.3, 1.1, 0.12], color: '#4f6a7a' });
  for (let i = 0; i < 5; i++) {
    b.box({ position: [1.32, 1.95, -2.8 + i * 1.4], scale: [0.08, 0.9, 1.1], color: '#6f8b96' });
    b.box({ position: [-1.32, 1.95, -2.8 + i * 1.4], scale: [0.08, 0.9, 1.1], color: '#6f8b96' });
  }
  b.box({ position: [0, 2.62, 0], scale: [2.2, 0.16, 6.4], color: '#d8cfba' });
  wheels(b, [
    [1.25, 0.5, -2.6],
    [-1.25, 0.5, -2.6],
    [1.25, 0.5, 2.8],
    [-1.25, 0.5, 2.8],
  ], 0.5);
  return b.build();
}

export function buildAuto(): THREE.BufferGeometry {
  const b = new Builder();
  b.box({ position: [0, 0.8, 0], scale: [1.5, 1.1, 2.4], color: C.autoGreen });
  b.add(G.cyl6, { position: [0, 1.5, 0.1], rotation: [Math.PI / 2, 0, 0], scale: [1.6, 2.2, 1.6], color: C.autoYellow });
  b.box({ position: [0, 1.15, -1.25], scale: [1.1, 0.8, 0.1], color: '#7f9aa6' });
  wheels(b, [[0, 0.34, -1.1]], 0.34);
  wheels(b, [
    [0.68, 0.36, 0.9],
    [-0.68, 0.36, 0.9],
  ], 0.36);
  return b.build();
}

export function buildTruck(color: string = C.truck): THREE.BufferGeometry {
  const b = new Builder();
  b.box({ position: [0, 1.15, -2.2], scale: [2.3, 1.7, 2.2], color });
  b.box({ position: [0, 1.55, -3.32], scale: [2, 0.9, 0.12], color: '#88a6b2' });
  b.box({ position: [0, 1.5, 1], scale: [2.4, 2.2, 5], color: '#d8d2c2' });
  b.box({ position: [0, 2.65, 1], scale: [2.5, 0.2, 5.1], color: color });
  b.box({ position: [0, 0.55, 0.4], scale: [2.5, 0.4, 7.4], color: '#4a4a46' });
  wheels(b, [
    [1.15, 0.46, -2],
    [-1.15, 0.46, -2],
    [1.15, 0.46, 1.6],
    [-1.15, 0.46, 1.6],
  ], 0.46);
  return b.build();
}

export function buildScooter(): THREE.BufferGeometry {
  const b = new Builder();
  b.box({ position: [0, 0.62, 0], scale: [0.5, 0.42, 1.5], color: C.scooter });
  b.box({ position: [0, 0.92, -0.5], scale: [0.42, 0.5, 0.42], color: C.scooter });
  b.box({ position: [0, 1.25, -0.6], scale: [0.7, 0.08, 0.1], color: '#37404a' });
  b.box({ position: [0, 1.15, 0.55], scale: [0.72, 0.78, 0.72], color: C.deliveryBox });
  b.box({ position: [0, 1.54, 0.55], scale: [0.74, 0.06, 0.74], color: '#b85a2c' });
  wheels(b, [
    [0, 0.3, -0.68],
    [0, 0.3, 0.68],
  ], 0.3);
  // Rider.
  b.add(G.cyl6, { position: [0, 1.1, -0.05], scale: [0.42, 0.7, 0.36], color: '#3f7fbf' });
  b.add(G.sphere, { position: [0, 1.6, -0.1], scale: [0.36, 0.38, 0.36], color: '#2f3a44' });
  return b.build();
}
