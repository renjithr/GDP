import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  buildCarton,
  buildConstruction,
  buildDeliveryHub,
  buildFactoryCore,
  buildFactoryExpansion,
  buildWarehouse,
  buildWarehouseExpansion,
  buildWorkshopShell,
  buildWorkshopShutter,
  buildWorkshopWork,
} from '../builders';
import { carpenters } from '../layout';
import { world, presence } from '../worldState';
import { easeOutCubic, fadingLambert, setInstance, useGeometry, useMaterial, villageLambert } from './common';
import { useStore } from '../../state/store';

/**
 * The parts of the village that respond to economic state.
 *
 * Nothing here is rebuilt when the year changes — objects grow, fade, open and close.
 * The canvas is never torn down, which is what makes 2010 → 2026 feel like one place
 * changing rather than a slideshow.
 */

/** Which workshop shuts first, second, … so closures scatter across the row. */
const CLOSE_RANK = [4, 1, 5, 2, 0, 3];

export function CarpenterRow() {
  const shell = useGeometry(() => buildWorkshopShell());
  const work = useGeometry(() => buildWorkshopWork());
  const shutter = useGeometry(() => buildWorkshopShutter());
  const shellMat = useMaterial(() => villageLambert());
  const closedShellMat = useMaterial(() => new THREE.MeshLambertMaterial({ vertexColors: true, color: '#a7a49a' }));

  const workRefs = useRef<(THREE.Mesh | null)[]>([]);
  const shutterRefs = useRef<(THREE.Mesh | null)[]>([]);
  const shellRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(() => {
    const activeCount = world.carpenters * carpenters.length;
    for (let i = 0; i < carpenters.length; i++) {
      const rank = CLOSE_RANK[i];
      const t = THREE.MathUtils.clamp(activeCount - (carpenters.length - 1 - rank), 0, 1);
      const w = workRefs.current[i];
      const s = shutterRefs.current[i];
      const shellMesh = shellRefs.current[i];
      if (w) {
        w.scale.setScalar(easeOutCubic(t));
        w.visible = t > 0.02;
      }
      if (s) {
        // The shutter rolls down as the workshop goes quiet.
        s.scale.set(1, easeOutCubic(1 - t), 1);
        s.position.y = 0;
        s.visible = t < 0.98;
      }
      if (shellMesh) shellMesh.material = t < 0.4 ? closedShellMat : shellMat;
    }
  });

  return (
    <group>
      {carpenters.map((c, i) => (
        <group key={i} position={c.position} rotation={[0, c.rotation, 0]}>
          <mesh
            ref={(n) => {
              shellRefs.current[i] = n;
            }}
            geometry={shell}
            material={shellMat}
          />
          <mesh
            ref={(n) => {
              workRefs.current[i] = n;
            }}
            geometry={work}
            material={shellMat}
          />
          <mesh
            ref={(n) => {
              shutterRefs.current[i] = n;
            }}
            geometry={shutter}
            material={shellMat}
          />
        </group>
      ))}
    </group>
  );
}

/**
 * Act 6: what a stale reference picture still assumes.
 *
 * Translucent workshops appear exactly where real ones have closed — the estimate that
 * has not caught up with the village.
 */
export function GhostWorkshops() {
  const shell = useGeometry(() => buildWorkshopShell());
  const work = useGeometry(() => buildWorkshopWork());
  const mat = useMaterial(
    () =>
      new THREE.MeshLambertMaterial({
        color: '#63b8ef',
        transparent: true,
        opacity: 0,
        depthWrite: false,
        // The ghost sits exactly where the real workshop stands, so it has to draw
        // over it rather than fight it for depth.
        depthTest: false,
        emissive: '#1f5c8c',
        emissiveIntensity: 0.6,
      }),
  );
  const groupRef = useRef<THREE.Group>(null);
  const refs = useRef<(THREE.Group | null)[]>([]);

  useFrame((_, delta) => {
    const on = useStore.getState().ghostsOn;
    mat.opacity += ((on ? 0.42 : 0) - mat.opacity) * Math.min(delta, 0.05) * 4;
    if (groupRef.current) groupRef.current.visible = mat.opacity > 0.01;
    if (mat.opacity <= 0.01) return;

    const activeCount = world.carpenters * carpenters.length;
    const pulse = 1.09 + Math.sin(performance.now() * 0.0016) * 0.035;
    for (let i = 0; i < carpenters.length; i++) {
      const rank = CLOSE_RANK[i];
      const t = THREE.MathUtils.clamp(activeCount - (carpenters.length - 1 - rank), 0, 1);
      const g = refs.current[i];
      if (!g) continue;
      // Only haunt the workshops that are no longer working.
      g.visible = t < 0.5;
      g.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={groupRef}>
      {carpenters.map((c, i) => (
        <group
          key={i}
          ref={(n) => {
            refs.current[i] = n;
          }}
          position={c.position}
          rotation={[0, c.rotation, 0]}
        >
          <mesh geometry={shell} material={mat} renderOrder={20} />
          <mesh geometry={work} material={mat} renderOrder={20} />
        </group>
      ))}
    </group>
  );
}

/** A structure that rises out of the ground as its level crosses zero, then expands. */
function useGrowth(ref: React.RefObject<THREE.Group | null>, key: 'factory' | 'warehouse' | 'delivery', sizeFloor = 0.78) {
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const level = world[key];
    const p = easeOutCubic(presence(level));
    const size = sizeFloor + (1 - sizeFloor) * level;
    g.visible = p > 0.005;
    g.scale.set(size * p, size * easeOutCubic(Math.min(p * 1.15, 1)), size * p);
  });
}

export function Factory() {
  const core = useGeometry(() => buildFactoryCore());
  const expansion = useGeometry(() => buildFactoryExpansion());
  const mat = useMaterial(() => villageLambert());
  const expansionMat = useMaterial(() => fadingLambert());
  const group = useRef<THREE.Group>(null);
  const expansionRef = useRef<THREE.Group>(null);
  useGrowth(group, 'factory');

  useFrame(() => {
    const t = THREE.MathUtils.clamp((world.factory - 0.62) / 0.3, 0, 1);
    expansionMat.opacity = t;
    if (expansionRef.current) {
      expansionRef.current.visible = t > 0.02;
      expansionRef.current.scale.setScalar(easeOutCubic(t));
    }
  });

  return (
    <group ref={group}>
      <mesh geometry={core} material={mat} />
      <group ref={expansionRef}>
        <mesh geometry={expansion} material={expansionMat} />
      </group>
    </group>
  );
}

export function Warehouse() {
  const core = useGeometry(() => buildWarehouse());
  const expansion = useGeometry(() => buildWarehouseExpansion());
  const carton = useGeometry(() => buildCarton());
  const mat = useMaterial(() => villageLambert());
  const expansionMat = useMaterial(() => fadingLambert());
  const group = useRef<THREE.Group>(null);
  const expansionRef = useRef<THREE.Group>(null);
  const cartonRef = useRef<THREE.InstancedMesh>(null);
  useGrowth(group, 'warehouse');

  const cartonSpots = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => {
        const row = Math.floor(i / 6);
        const col = i % 6;
        return {
          x: 0.4 + col * 1.15 - 3,
          z: 15.4 + row * 1.2,
          y: 1.4 + (i % 3) * 0.85,
          rot: (i % 4) * 0.2,
        };
      }),
    [],
  );

  useFrame(() => {
    const t = THREE.MathUtils.clamp((world.warehouse - 0.68) / 0.28, 0, 1);
    expansionMat.opacity = t;
    if (expansionRef.current) {
      expansionRef.current.visible = t > 0.02;
      expansionRef.current.scale.setScalar(easeOutCubic(t));
    }
    const mesh = cartonRef.current;
    if (mesh) {
      mesh.count = Math.round(cartonSpots.length * THREE.MathUtils.clamp(world.warehouse, 0, 1));
      for (let i = 0; i < mesh.count; i++) {
        const s = cartonSpots[i];
        setInstance(mesh, i, s.x, s.y, s.z, s.rot, 1);
      }
      mesh.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group ref={group}>
      <mesh geometry={core} material={mat} />
      <group ref={expansionRef}>
        <mesh geometry={expansion} material={expansionMat} />
      </group>
      <instancedMesh ref={cartonRef} args={[carton, mat, cartonSpots.length]} frustumCulled={false} />
    </group>
  );
}

export function DeliveryHub() {
  const geo = useGeometry(() => buildDeliveryHub());
  const mat = useMaterial(() => villageLambert());
  const group = useRef<THREE.Group>(null);
  useGrowth(group, 'delivery', 0.9);
  return (
    <group ref={group}>
      <mesh geometry={geo} material={mat} />
    </group>
  );
}

export function ConstructionSite() {
  const geo = useGeometry(() => buildConstruction());
  const mat = useMaterial(() => villageLambert());
  const ref = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!ref.current) return;
    // Construction is always going on; only its intensity changes.
    const s = 0.86 + world.construction * 0.2;
    ref.current.scale.set(s, s, s);
  });

  return (
    <group ref={ref}>
      <mesh geometry={geo} material={mat} />
    </group>
  );
}
