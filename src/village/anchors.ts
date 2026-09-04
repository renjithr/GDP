import type { Camera } from 'three';
import type { Vec3 } from '../lib/types';

/**
 * HTML callouts pinned to 3D objects.
 *
 * The spec's rule is that 3D communicates structure and HTML communicates facts, so no
 * label is ever drawn into the WebGL scene. Instead, real DOM elements are projected
 * onto screen positions each frame — they stay selectable, translatable, styleable and
 * readable by a screen reader.
 *
 * Positioning is written straight to element.style to avoid a React render per frame.
 */

type Entry = { el: HTMLElement; position: Vec3; offsetY: number };

const entries = new Map<string, Entry>();

/**
 * On desktop the narrative column covers the left of the canvas. Labels whose object
 * sits behind it are hidden rather than floating over the prose.
 */
let clipLeft = 0;
export function setAnchorClip(px: number) {
  clipLeft = px;
}

export function registerAnchor(id: string, el: HTMLElement, position: Vec3, offsetY = 0) {
  entries.set(id, { el, position, offsetY });
}

export function unregisterAnchor(id: string) {
  entries.delete(id);
}

/**
 * World point -> normalised device coordinates, written out by hand.
 *
 * This module is pulled into the main bundle by the HTML label components, so it must
 * not import three at runtime — that would drag the whole engine into the first load.
 * The maths is exactly what Vector3.project does.
 */
const ndc = { x: 0, y: 0, z: 0 };
function project(camera: Camera, x: number, y: number, z: number) {
  const v = camera.matrixWorldInverse.elements;
  const p = camera.projectionMatrix.elements;

  const vx = v[0] * x + v[4] * y + v[8] * z + v[12];
  const vy = v[1] * x + v[5] * y + v[9] * z + v[13];
  const vz = v[2] * x + v[6] * y + v[10] * z + v[14];
  const vw = v[3] * x + v[7] * y + v[11] * z + v[15];

  const cx = p[0] * vx + p[4] * vy + p[8] * vz + p[12] * vw;
  const cy = p[1] * vx + p[5] * vy + p[9] * vz + p[13] * vw;
  const cz = p[2] * vx + p[6] * vy + p[10] * vz + p[14] * vw;
  const cw = p[3] * vx + p[7] * vy + p[11] * vz + p[15] * vw || 1e-6;

  ndc.x = cx / cw;
  ndc.y = cy / cw;
  ndc.z = cz / cw;
}

export function projectAnchors(camera: Camera, width: number, height: number) {
  if (entries.size === 0) return;
  for (const { el, position, offsetY } of entries.values()) {
    project(camera, position[0], position[1] + offsetY, position[2]);
    const x = (ndc.x * 0.5 + 0.5) * width;
    const y = (-ndc.y * 0.5 + 0.5) * height;
    const hidden = ndc.z > 1 || x < clipLeft + 12 || x > width - 12 || y < 4 || y > height - 4;
    el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    el.style.opacity = hidden ? '0' : '1';
    el.style.pointerEvents = hidden ? 'none' : 'auto';
  }
}
