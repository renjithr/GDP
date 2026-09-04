import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { sectors, type SectorId } from '../../data/sectors';
import { useStore } from '../../state/store';
import { world } from '../worldState';
import { C } from '../palette';
import { setInstance, useGeometry, useMaterial } from './common';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { ESTIMATE_HUB as HUB, PLATE } from '../layout';

/**
 * The analytical layers: how information reaches an estimate, and how a measurement
 * framework is recalibrated. These are metaphors drawn over the village, never over
 * the top of the factual copy — every number stays in HTML.
 */

// ---------------------------------------------------------------------------
// Act 5 — data signals flowing into the estimate
// ---------------------------------------------------------------------------

const DOTS_PER_SECTOR = 4;

export function DataSignals() {
  const curves = useMemo(
    () =>
      sectors.map((s) => {
        const start = new THREE.Vector3(s.anchor[0], 3, s.anchor[2]);
        const end = new THREE.Vector3(...HUB);
        const control = start
          .clone()
          .lerp(end, 0.5)
          .add(new THREE.Vector3(0, 12, 0));
        return { id: s.id, curve: new THREE.QuadraticBezierCurve3(start, control, end) };
      }),
    [],
  );

  // Drawn as thin tubes rather than lines: GL line width is not portable, and at this
  // camera distance a one-pixel line simply disappears.
  const lineGeo = useGeometry(() => {
    const tubes = curves.map(({ curve }) => new THREE.TubeGeometry(curve, 26, 0.42, 5, false));
    const merged = mergeGeometries(tubes, false)!;
    tubes.forEach((t) => t.dispose());
    return merged;
  }, [curves]);

  const lineMat = useMaterial(
    () => new THREE.MeshBasicMaterial({ color: '#12735f', transparent: true, opacity: 0, depthWrite: false }),
  );
  const dotGeo = useGeometry(() => new THREE.OctahedronGeometry(1.5, 0));
  const dotMat = useMaterial(
    () => new THREE.MeshBasicMaterial({ color: '#0e8f72', transparent: true, opacity: 0, depthWrite: false }),
  );
  const hubGeo = useGeometry(() => new THREE.OctahedronGeometry(3.2, 0));
  const hubMat = useMaterial(
    () => new THREE.MeshBasicMaterial({ color: '#0e8f72', transparent: true, opacity: 0, depthWrite: false }),
  );

  const dots = useRef<THREE.InstancedMesh>(null);
  const hub = useRef<THREE.Mesh>(null);
  const clock = useRef(0);
  const strength = useRef(0);
  const _v = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    clock.current += dt;
    const on = useStore.getState().signalsOn;
    strength.current += ((on ? 1 : 0) - strength.current) * dt * 3.5;

    lineMat.opacity = strength.current * 0.7;
    dotMat.opacity = strength.current * 0.95;
    hubMat.opacity = strength.current * 0.8;

    if (hub.current) {
      hub.current.visible = strength.current > 0.01;
      hub.current.rotation.y = clock.current * 0.5;
      hub.current.scale.setScalar(1 + Math.sin(clock.current * 2) * 0.08);
    }

    const mesh = dots.current;
    if (!mesh) return;
    mesh.visible = strength.current > 0.01;
    let n = 0;
    curves.forEach(({ id, curve }, si) => {
      const sector = sectors[si];
      // A sector with no activity yet sends no signals.
      const level = activityFor(id);
      if (level < 0.1) return;
      for (let d = 0; d < DOTS_PER_SECTOR; d++) {
        const t = (clock.current * 0.22 + d / DOTS_PER_SECTOR + si * 0.07) % 1;
        curve.getPoint(t, _v);
        const fade = Math.sin(t * Math.PI);
        setInstance(mesh, n++, _v.x, _v.y, _v.z, t * 4, 0.6 + fade * 0.75 * (sector.band === 'MORE DIRECTLY OBSERVED' ? 1.15 : 0.9));
      }
    });
    mesh.count = n;
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <mesh geometry={lineGeo} material={lineMat} />
      <instancedMesh ref={dots} args={[dotGeo, dotMat, sectors.length * DOTS_PER_SECTOR]} frustumCulled={false} />
      <mesh ref={hub} geometry={hubGeo} material={hubMat} position={HUB} />
    </group>
  );
}

const LEVEL_KEY: Record<SectorId, keyof typeof world> = {
  farm: 'farm',
  shop: 'shops',
  carpenter: 'carpenters',
  construction: 'construction',
  government: 'services',
  factory: 'factory',
  warehouse: 'warehouse',
  delivery: 'delivery',
};

const activityFor = (id: SectorId) => world[LEVEL_KEY[id]] as number;

// ---------------------------------------------------------------------------
// Act 7 — the measurement framework
// ---------------------------------------------------------------------------

/**
 * How much emphasis each activity carries in the measuring framework, before and after
 * recalibration. Structural, not numeric: the visitor sees relative emphasis change,
 * and the HTML copy carries the actual explanation.
 */
const EMPHASIS: Record<SectorId, { old: number; next: number }> = {
  farm: { old: 0.95, next: 0.78 },
  shop: { old: 0.8, next: 0.86 },
  carpenter: { old: 1.0, next: 0.55 },
  construction: { old: 0.62, next: 0.8 },
  government: { old: 0.72, next: 0.84 },
  factory: { old: 0.5, next: 1.0 },
  warehouse: { old: 0.18, next: 0.82 },
  delivery: { old: 0.05, next: 0.78 },
};

export function CalibrationGrid() {
  const gridGeo = useGeometry(() => {
    const positions: number[] = [];
    const step = 8;
    const halfW = PLATE.width / 2;
    const halfD = PLATE.depth / 2;
    for (let x = -halfW; x <= halfW; x += step) positions.push(x, 0, -halfD, x, 0, halfD);
    for (let z = -halfD; z <= halfD; z += step) positions.push(-halfW, 0, z, halfW, 0, z);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return g;
  });
  const gridMat = useMaterial(
    () => new THREE.LineBasicMaterial({ color: C.gridOld, transparent: true, opacity: 0, depthWrite: false }),
  );

  const nodeGeo = useGeometry(() => new THREE.OctahedronGeometry(1, 0));
  const nodeMat = useMaterial(
    () => new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, vertexColors: false }),
  );
  const nodes = useRef<THREE.InstancedMesh>(null);

  // Links from each activity into the framework. The new reference wires up activities
  // the old one barely reached.
  const linkGeo = useGeometry(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(sectors.length * 6), 3));
    return g;
  });
  const linkMat = useMaterial(
    () => new THREE.LineBasicMaterial({ color: C.gridNew, transparent: true, opacity: 0, depthWrite: false }),
  );

  const state = useRef({ shown: 0, calibrated: 0 });
  const colour = useMemo(() => new THREE.Color(), []);
  const oldColour = useMemo(() => new THREE.Color(C.gridOld), []);
  const newColour = useMemo(() => new THREE.Color(C.gridNew), []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const s = useStore.getState();
    state.current.shown += ((s.gridOn ? 1 : 0) - state.current.shown) * dt * 3.5;
    state.current.calibrated += ((s.calibrated ? 1 : 0) - state.current.calibrated) * dt * 2.2;
    const shown = state.current.shown;
    const cal = state.current.calibrated;

    gridMat.opacity = shown * 0.45;
    gridMat.color.copy(oldColour).lerp(newColour, cal);
    nodeMat.opacity = shown;
    linkMat.opacity = shown * cal * 0.6;

    const mesh = nodes.current;
    if (!mesh) return;
    mesh.visible = shown > 0.01;
    const linkPos = linkGeo.getAttribute('position') as THREE.BufferAttribute;

    sectors.forEach((sector, i) => {
      const e = EMPHASIS[sector.id];
      const weight = e.old + (e.next - e.old) * cal;
      // Nodes lift and grow as the framework starts describing them properly.
      const y = 5 + weight * 5;
      setInstance(mesh, i, sector.anchor[0], y, sector.anchor[2], cal * Math.PI, 1.1 + weight * 2.4);
      colour.copy(oldColour).lerp(newColour, cal * Math.min(1, weight * 1.3));
      mesh.setColorAt(i, colour);
      linkPos.setXYZ(i * 2, sector.anchor[0], y, sector.anchor[2]);
      linkPos.setXYZ(i * 2 + 1, HUB[0], HUB[1] - 12, HUB[2]);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    linkPos.needsUpdate = true;
  });

  return (
    <group>
      <lineSegments geometry={gridGeo} material={gridMat} position={[0, 0.35, 0]} />
      <instancedMesh ref={nodes} args={[nodeGeo, nodeMat, sectors.length]} frustumCulled={false} />
      <lineSegments geometry={linkGeo} material={linkMat} />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Act 11 — the economy keeps changing
// ---------------------------------------------------------------------------

const FUTURE_SPOTS: [number, number, number, number][] = [
  [-14, 0, -32, 6],
  [42, 0, 30, 8],
  [-44, 0, 24, 5],
  [24, 0, -34, 7],
  [-30, 0, 36, 5],
];

export function FutureSilhouettes() {
  const geo = useGeometry(() => new THREE.BoxGeometry(1, 1, 1));
  const mat = useMaterial(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#9fd8ff',
        transparent: true,
        opacity: 0,
        depthWrite: false,
        wireframe: true,
      }),
  );
  const group = useRef<THREE.Group>(null);
  const shown = useRef(0);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    shown.current += ((useStore.getState().futureOn ? 1 : 0) - shown.current) * dt * 2;
    mat.opacity = shown.current * 0.5;
    if (group.current) {
      group.current.visible = shown.current > 0.01;
      group.current.children.forEach((child, i) => {
        child.position.y = FUTURE_SPOTS[i][3] / 2 + Math.sin(performance.now() * 0.0009 + i) * 0.6;
      });
    }
  });

  return (
    <group ref={group}>
      {FUTURE_SPOTS.map(([x, , z, h], i) => (
        <mesh key={i} geometry={geo} material={mat} position={[x, h / 2, z]} scale={[7, h, 7]} />
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Optional deep dive — output and inputs move separately
// ---------------------------------------------------------------------------

export function FactoryFlows() {
  const inCurve = useMemo(
    () =>
      new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(16, 2, 26),
        new THREE.Vector3(22, 7, 24),
        new THREE.Vector3(28, 3, 19),
      ),
    [],
  );
  const outCurve = useMemo(
    () =>
      new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(30, 3, 13),
        new THREE.Vector3(30, 8, 4),
        new THREE.Vector3(26, 2, -2),
      ),
    [],
  );

  const geo = useGeometry(() => new THREE.BoxGeometry(1.1, 1.1, 1.1));
  const inMat = useMaterial(
    () => new THREE.MeshBasicMaterial({ color: C.timber, transparent: true, opacity: 0, depthWrite: false }),
  );
  const outMat = useMaterial(
    () => new THREE.MeshBasicMaterial({ color: '#e0a13a', transparent: true, opacity: 0, depthWrite: false }),
  );
  const inRef = useRef<THREE.InstancedMesh>(null);
  const outRef = useRef<THREE.InstancedMesh>(null);
  const clock = useRef(0);
  const shown = useRef(0);
  const _v = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    clock.current += dt;
    shown.current += ((useStore.getState().flowsOn ? 1 : 0) - shown.current) * dt * 3;
    inMat.opacity = shown.current;
    outMat.opacity = shown.current;

    const place = (mesh: THREE.InstancedMesh | null, curve: THREE.QuadraticBezierCurve3, speed: number) => {
      if (!mesh) return;
      mesh.visible = shown.current > 0.02;
      for (let i = 0; i < 4; i++) {
        const t = (clock.current * speed + i / 4) % 1;
        curve.getPoint(t, _v);
        setInstance(mesh, i, _v.x, _v.y, _v.z, t * 6, 0.8 + Math.sin(t * Math.PI) * 0.5);
      }
      mesh.instanceMatrix.needsUpdate = true;
    };
    place(inRef.current, inCurve, 0.24);
    place(outRef.current, outCurve, 0.3);
  });

  return (
    <group>
      <instancedMesh ref={inRef} args={[geo, inMat, 4]} frustumCulled={false} />
      <instancedMesh ref={outRef} args={[geo, outMat, 4]} frustumCulled={false} />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Selection
// ---------------------------------------------------------------------------

/** Invisible click targets over each activity, plus the ring that marks the choice. */
export function Hotspots() {
  const selectSector = useStore((s) => s.selectSector);
  const ringGeo = useGeometry(() => {
    const g = new THREE.RingGeometry(0.86, 1, 40);
    g.rotateX(-Math.PI / 2);
    return g;
  });
  const ringMat = useMaterial(
    () => new THREE.MeshBasicMaterial({ color: C.highlight, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }),
  );
  const ring = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const selected = useStore.getState().selectedSector;
    ringMat.opacity += ((selected ? 0.9 : 0) - ringMat.opacity) * dt * 5;
    if (!ring.current) return;
    ring.current.visible = ringMat.opacity > 0.02;
    if (selected) {
      const a = sectors.find((s) => s.id === selected)!.anchor;
      ring.current.position.set(a[0], 0.4, a[2]);
      const pulse = 9 + Math.sin(performance.now() * 0.003) * 0.7;
      ring.current.scale.setScalar(pulse);
    }
  });

  return (
    <group>
      {sectors.map((s) => (
        <mesh
          key={s.id}
          position={[s.anchor[0], 4, s.anchor[2]]}
          onPointerDown={(e) => {
            e.stopPropagation();
            if (activityFor(s.id) < 0.05) return;
            selectSector(useStore.getState().selectedSector === s.id ? null : s.id);
          }}
        >
          <boxGeometry args={[14, 10, 12]} />
          {/* Drawn as nothing, but still raycastable — an invisible object gets no
              pointer events, so colorWrite is turned off instead. */}
          <meshBasicMaterial colorWrite={false} depthWrite={false} />
        </mesh>
      ))}
      <mesh ref={ring} geometry={ringGeo} material={ringMat} renderOrder={2} />
    </group>
  );
}
