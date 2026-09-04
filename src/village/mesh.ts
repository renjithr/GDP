import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/**
 * Everything in GDP Village is built from primitives at runtime — no model files, no
 * textures, nothing to download.
 *
 * Parts are accumulated into a Builder, baked into ONE merged geometry with vertex
 * colours, and drawn with a single material. The whole static village (houses, bazaar,
 * civic buildings, fields, poles, fences) ends up as a couple of draw calls, which is
 * what makes it viable on a mid-range phone.
 */

const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();
const _v = new THREE.Vector3();
const _s = new THREE.Vector3();
const _c = new THREE.Color();

/** Unit primitives, all non-indexed so merges never mismatch and shading stays faceted. */
export const G = {
  box: new THREE.BoxGeometry(1, 1, 1).toNonIndexed(),
  /** Four-sided pyramid: the village roof. Base width 1 across the flats. */
  pyramid: new THREE.ConeGeometry(Math.SQRT1_2, 1, 4).toNonIndexed(),
  /** Ridged/gable roof: a prism. */
  prism: new THREE.CylinderGeometry(Math.SQRT1_2, Math.SQRT1_2, 1, 3).toNonIndexed(),
  cyl: new THREE.CylinderGeometry(0.5, 0.5, 1, 8).toNonIndexed(),
  cyl6: new THREE.CylinderGeometry(0.5, 0.5, 1, 6).toNonIndexed(),
  cone: new THREE.ConeGeometry(0.5, 1, 7).toNonIndexed(),
  sphere: new THREE.IcosahedronGeometry(0.5, 0).toNonIndexed(),
  plane: new THREE.PlaneGeometry(1, 1).toNonIndexed(),
};

export type PartOpts = {
  position?: [number, number, number];
  /** Rotation in radians, XYZ. */
  rotation?: [number, number, number];
  scale?: [number, number, number] | number;
  color: string | number;
};

export class Builder {
  private parts: THREE.BufferGeometry[] = [];

  add(geometry: THREE.BufferGeometry, opts: PartOpts): this {
    const g = geometry.clone();
    const [px, py, pz] = opts.position ?? [0, 0, 0];
    const [rx, ry, rz] = opts.rotation ?? [0, 0, 0];
    const sc = opts.scale ?? 1;
    const [sx, sy, sz] = typeof sc === 'number' ? [sc, sc, sc] : sc;

    _v.set(px, py, pz);
    _q.setFromEuler(_e.set(rx, ry, rz));
    _s.set(sx, sy, sz);
    g.applyMatrix4(_m.compose(_v, _q, _s));

    _c.set(opts.color as THREE.ColorRepresentation);
    const count = g.attributes.position.count;
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      colors[i * 3] = _c.r;
      colors[i * 3 + 1] = _c.g;
      colors[i * 3 + 2] = _c.b;
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    // Drop UVs: nothing here is textured, and dropping them keeps merges uniform.
    g.deleteAttribute('uv');
    this.parts.push(g);
    return this;
  }

  /** Convenience wrappers so building code reads like a description of the object. */
  box(opts: PartOpts) {
    return this.add(G.box, opts);
  }
  roof(opts: PartOpts) {
    return this.add(G.pyramid, opts);
  }
  gable(opts: PartOpts) {
    return this.add(G.prism, { ...opts, rotation: [0, Math.PI / 6, Math.PI / 2], ...(opts.rotation ? { rotation: opts.rotation } : {}) });
  }
  cyl(opts: PartOpts) {
    return this.add(G.cyl, opts);
  }

  get isEmpty() {
    return this.parts.length === 0;
  }

  build(): THREE.BufferGeometry {
    if (this.parts.length === 0) return new THREE.BufferGeometry();
    const merged = mergeGeometries(this.parts, false)!;
    // Faceted shading, computed once, so no material flatShading cost at draw time.
    merged.computeVertexNormals();
    merged.computeBoundingSphere();
    this.parts.forEach((p) => p.dispose());
    this.parts = [];
    return merged;
  }
}

/** Standard material for everything built by a Builder. */
export function villageMaterial(extra?: THREE.MeshLambertMaterialParameters) {
  return new THREE.MeshLambertMaterial({ vertexColors: true, ...extra });
}

/**
 * A soft round shadow blob. One 64px canvas gradient, shared by every instance —
 * far cheaper than a shadow map and it suits the flat-shaded look.
 */
let blobTexture: THREE.Texture | null = null;
export function getBlobTexture(): THREE.Texture {
  if (blobTexture) return blobTexture;
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(0,0,0,0.42)');
  grad.addColorStop(0.55, 'rgba(0,0,0,0.18)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  blobTexture = new THREE.CanvasTexture(canvas);
  blobTexture.colorSpace = THREE.SRGBColorSpace;
  return blobTexture;
}

/** Rounded ground plate so the village reads as a tabletop diorama. */
export function plateGeometry(width: number, depth: number, thickness = 2.4) {
  const shape = new THREE.Shape();
  const r = 6;
  const w = width / 2;
  const d = depth / 2;
  shape.moveTo(-w + r, -d);
  shape.lineTo(w - r, -d);
  shape.quadraticCurveTo(w, -d, w, -d + r);
  shape.lineTo(w, d - r);
  shape.quadraticCurveTo(w, d, w - r, d);
  shape.lineTo(-w + r, d);
  shape.quadraticCurveTo(-w, d, -w, d - r);
  shape.lineTo(-w, -d + r);
  shape.quadraticCurveTo(-w, -d, -w + r, -d);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false, curveSegments: 4 });
  // Extrusion runs along +Z; after laying it flat the slab occupies y ∈ [0, thickness],
  // so drop it to put its TOP surface exactly on y = 0 — the plane everything else
  // in the village is positioned against.
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, -thickness, 0);
  return geo;
}

/** Flat ribbon on the ground (roads, plots, water) with slightly rounded corners. */
export function slabGeometry(x0: number, z0: number, x1: number, z1: number, y = 0.02) {
  const geo = new THREE.PlaneGeometry(Math.abs(x1 - x0), Math.abs(z1 - z0));
  geo.rotateX(-Math.PI / 2);
  geo.translate((x0 + x1) / 2, y, (z0 + z1) / 2);
  return geo.toNonIndexed();
}

/** Samples a closed polyline at t∈[0,1), returning position and heading. */
export function sampleRoute(route: [number, number, number][], t: number) {
  const segs = route.length - 1;
  const scaled = ((t % 1) + 1) % 1;
  const f = scaled * segs;
  const i = Math.min(Math.floor(f), segs - 1);
  const local = f - i;
  const a = route[i];
  const b = route[i + 1];
  const x = a[0] + (b[0] - a[0]) * local;
  const z = a[2] + (b[2] - a[2]) * local;
  const heading = Math.atan2(b[0] - a[0], b[2] - a[2]);
  return { x, z, heading };
}
