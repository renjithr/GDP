import { useEffect, useMemo } from 'react';
import * as THREE from 'three';

/** Build a geometry once and dispose it when the village unmounts. */
export function useGeometry(factory: () => THREE.BufferGeometry, deps: unknown[] = []) {
  const geo = useMemo(factory, deps);
  useEffect(() => () => geo.dispose(), [geo]);
  return geo;
}

export function useMaterial<T extends THREE.Material>(factory: () => T, deps: unknown[] = []) {
  const mat = useMemo(factory, deps);
  useEffect(() => () => mat.dispose(), [mat]);
  return mat;
}

export const villageLambert = (extra?: THREE.MeshLambertMaterialParameters) =>
  new THREE.MeshLambertMaterial({ vertexColors: true, ...extra });

/** Fading material for things that appear and disappear with the economy. */
export const fadingLambert = () =>
  new THREE.MeshLambertMaterial({ vertexColors: true, transparent: true, opacity: 1 });

const _m = new THREE.Matrix4();
const _p = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _s = new THREE.Vector3();
const _e = new THREE.Euler();

/** Writes one instance matrix without allocating. */
export function setInstance(
  mesh: THREE.InstancedMesh,
  i: number,
  x: number,
  y: number,
  z: number,
  rotY: number,
  scale: number | [number, number, number],
) {
  const [sx, sy, sz] = typeof scale === 'number' ? [scale, scale, scale] : scale;
  _p.set(x, y, z);
  _q.setFromEuler(_e.set(0, rotY, 0));
  _s.set(sx, sy, sz);
  mesh.setMatrixAt(i, _m.compose(_p, _q, _s));
}

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 3);
