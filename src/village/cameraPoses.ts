import type { Vec3 } from '../lib/types';
import type { CameraPoseId } from '../state/routes';
import { anchors } from './layout';

export type CameraPose = {
  target: Vec3;
  /** Orbit distance from the target. */
  distance: number;
  /** Degrees. Yaw 0 looks from +z; positive yaw swings east. */
  yaw: number;
  /** Degrees above the ground plane. */
  pitch: number;
};

/**
 * Authored camera. The visitor may nudge orbit and zoom within tight limits (see
 * CameraRig) but never drives freely — the story owns where you are looking.
 */
export const poses: Record<CameraPoseId, CameraPose> = {
  overview: { target: [0, 1, -1], distance: 228, yaw: -28, pitch: 36 },
  enter: { target: [-2, 1, -3], distance: 208, yaw: -22, pitch: 32 },
  wide: { target: [2, 2, -2], distance: 262, yaw: -16, pitch: 44 },
  analytical: { target: [2, 0, -2], distance: 258, yaw: -8, pitch: 64 },
  carpenter: { target: [15, 1, -22], distance: 104, yaw: 24, pitch: 50 },
  factory: { target: anchors.factory, distance: 108, yaw: 62, pitch: 30 },
  future: { target: [6, 2, 2], distance: 265, yaw: -34, pitch: 38 },
};

/** Pushed-back framing used on phones, where the viewport is short and wide-ish. */
export const mobileAdjust = (pose: CameraPose): CameraPose => ({
  ...pose,
  // The phone canvas is close to square, and the desktop layout gives a third of its
  // width to the story column — so the two end up needing a similar distance.
  distance: pose.distance * 0.94,
  pitch: Math.min(pose.pitch + 5, 74),
});
