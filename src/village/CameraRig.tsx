import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { damp } from '../lib/format';
import { useStore } from '../state/store';
import { sectorById } from '../data/sectors';
import { mobileAdjust, poses, type CameraPose } from './cameraPoses';
import { projectAnchors } from './anchors';

/**
 * Authored camera with a short leash.
 *
 * The story decides where you are looking. The visitor can nudge the orbit a little and
 * zoom a little, and those nudges are stored as OFFSETS from the authored pose — so
 * when the story moves the camera, the visitor's adjustment comes along instead of
 * fighting it, and nobody can get lost behind a hill.
 */

const YAW_LIMIT = 34;
const PITCH_MIN = 14;
const PITCH_MAX = 76;
const ZOOM_LIMIT = 0.34;

const DEG = Math.PI / 180;

export function CameraRig({ mobile }: { mobile: boolean }) {
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  const size = useThree((s) => s.size);

  // Authored goal, damped towards each frame. Seeded from the first act's pose so the
  // village never flies in from an arbitrary position — it just eases the last stretch.
  const current = useRef({ yaw: -28, pitch: 30, distance: 96, target: new THREE.Vector3(0, 1, 0) });
  const seeded = useRef(false);
  // Visitor's offsets from the authored pose.
  const offset = useRef({ yaw: 0, pitch: 0, zoom: 0 });
  const goalTarget = useRef(new THREE.Vector3(0, 1, 0));
  const _look = useMemo(() => new THREE.Vector3(), []);

  const poseId = useStore((s) => s.pose);
  const selected = useStore((s) => s.selectedSector);
  const reduced = useStore((s) => s.reducedMotion);
  // On desktop the narrative column covers the left of the canvas, so the village is
  // framed into the space that is actually visible rather than the geometric centre.
  const pan = useRef(0);

  // Reset the visitor's nudge whenever the story reframes, so each act starts clean.
  useEffect(() => {
    offset.current = { yaw: 0, pitch: 0, zoom: 0 };
  }, [poseId, selected]);

  // Pointer drag / wheel / pinch, bounded.
  useEffect(() => {
    const el = gl.domElement;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let pinchDistance = 0;

    const clampOffsets = () => {
      const o = offset.current;
      o.yaw = THREE.MathUtils.clamp(o.yaw, -YAW_LIMIT, YAW_LIMIT);
      o.pitch = THREE.MathUtils.clamp(o.pitch, -18, 22);
      o.zoom = THREE.MathUtils.clamp(o.zoom, -ZOOM_LIMIT, ZOOM_LIMIT);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (!e.isPrimary) return;
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      offset.current.yaw -= (e.clientX - lastX) * 0.16;
      offset.current.pitch += (e.clientY - lastY) * 0.1;
      lastX = e.clientX;
      lastY = e.clientY;
      clampOffsets();
    };
    const onPointerUp = () => {
      dragging = false;
    };
    const onWheel = (e: WheelEvent) => {
      // Only intercept deliberate zooms; let the page keep scrolling otherwise.
      if (!e.ctrlKey && Math.abs(e.deltaY) < 12) return;
      e.preventDefault();
      offset.current.zoom += e.deltaY * 0.0006;
      clampOffsets();
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 2) return;
      const d = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      if (pinchDistance) {
        offset.current.zoom -= (d - pinchDistance) * 0.004;
        clampOffsets();
      }
      pinchDistance = d;
    };
    const onTouchEnd = () => {
      pinchDistance = 0;
    };

    el.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onTouchEnd);
    return () => {
      el.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [gl]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const state = useStore.getState();

    // A selected sector overrides the act's pose, so tapping a farm frames the farm.
    let pose: CameraPose = poses[state.pose] ?? poses.overview;
    if (state.selectedSector) {
      const s = sectorById(state.selectedSector);
      pose = { target: s.anchor, distance: s.camera.distance, yaw: s.camera.yawDeg, pitch: s.camera.pitchDeg };
    }
    if (mobile) pose = mobileAdjust(pose);

    const goalYaw = pose.yaw + offset.current.yaw;
    const goalPitch = THREE.MathUtils.clamp(pose.pitch + offset.current.pitch, PITCH_MIN, PITCH_MAX);
    const goalDistance = pose.distance * (1 + offset.current.zoom);
    goalTarget.current.set(pose.target[0], pose.target[1], pose.target[2]);

    const c = current.current;
    if (!seeded.current) {
      seeded.current = true;
      c.yaw = goalYaw;
      c.pitch = goalPitch;
      // Start a little further out so entering the village reads as an approach.
      c.distance = goalDistance * 1.35;
      c.target.copy(goalTarget.current);
    }
    const lambda = reduced ? 1e6 : 2.6;
    c.yaw = damp(c.yaw, goalYaw, lambda, dt);
    c.pitch = damp(c.pitch, goalPitch, lambda, dt);
    c.distance = damp(c.distance, goalDistance, lambda, dt);
    c.target.lerp(goalTarget.current, reduced ? 1 : 1 - Math.exp(-lambda * dt));

    const yaw = c.yaw * DEG;
    const pitch = c.pitch * DEG;

    // Slide the look-at point sideways so the village sits clear of the story column.
    const wantPan = !mobile && state.mode === 'stage' ? 0.11 : 0;
    pan.current = damp(pan.current, wantPan, reduced ? 1e6 : 2.6, dt);
    const perspective = camera as THREE.PerspectiveCamera;
    const worldHeight = 2 * c.distance * Math.tan(((perspective.fov ?? 40) * DEG) / 2);
    const shift = pan.current * worldHeight * (perspective.aspect ?? 1.6);
    const lookAt = _look.copy(c.target);
    lookAt.x -= Math.cos(yaw) * shift;
    lookAt.z += Math.sin(yaw) * shift;

    const horizontal = Math.cos(pitch) * c.distance;
    camera.position.set(
      lookAt.x + Math.sin(yaw) * horizontal,
      lookAt.y + Math.sin(pitch) * c.distance,
      lookAt.z + Math.cos(yaw) * horizontal,
    );
    camera.lookAt(lookAt);

    // Labels are projected with the pose we just set, so refresh the view matrix here
    // rather than reading the one left over from the previous frame.
    camera.updateMatrixWorld();
    camera.matrixWorldInverse.copy(camera.matrixWorld).invert();
    projectAnchors(camera, size.width, size.height);
  });

  return null;
}
