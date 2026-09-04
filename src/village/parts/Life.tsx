import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { buildAuto, buildBus, buildCrop, buildPerson, buildScooter, buildTree, buildTruck } from '../builders';
import { autoRoute, busRoute, crowdSpots, factoryTruckRoute, fields, scooterRoutes, treeScatter, truckRoute } from '../layout';
import { getBlobTexture, sampleRoute } from '../mesh';
import { C } from '../palette';
import { world } from '../worldState';
import { setInstance, useGeometry, useMaterial, villageLambert } from './common';
import { useStore } from '../../state/store';

/**
 * Ambient life. Deliberately cheap: no physics, no crowd simulation, no skeletal
 * animation. Instanced crops sway in a vertex shader, a handful of vehicles follow
 * fixed polylines, and people orbit their workplaces.
 */

// ---------------------------------------------------------------------------

export function Crops({ perField }: { perField: number }) {
  const geo = useGeometry(() => buildCrop());
  const timeRef = useRef({ value: 0 });

  const mat = useMaterial(() => {
    const m = villageLambert();
    m.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = timeRef.current;
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nuniform float uTime;')
        .replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
           float phase = uTime * 1.7 + instanceMatrix[3][0] * 0.55 + instanceMatrix[3][2] * 0.35;
           float bend = sin(phase) * 0.16 * transformed.y;
           transformed.x += bend;
           transformed.z += bend * 0.45;`,
        );
    };
    return m;
  });

  const positions = useMemo(() => {
    const out: [number, number, number, number][] = [];
    let seed = 7;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (const f of fields) {
      const [fx, , fz] = f.position;
      const [w, d] = f.size;
      const cols = Math.ceil(Math.sqrt(perField * (w / d)));
      const rows = Math.ceil(perField / cols);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = fx - w / 2 + 1.2 + ((w - 2.4) * (c + 0.5)) / cols + (rand() - 0.5) * 0.5;
          const z = fz - d / 2 + 1.2 + ((d - 2.4) * (r + 0.5)) / rows + (rand() - 0.5) * 0.5;
          out.push([x, z, rand() * Math.PI, 0.85 + rand() * 0.5]);
        }
      }
    }
    return out;
  }, [perField]);

  const ref = useRef<THREE.InstancedMesh>(null);

  useFrame((_, delta) => {
    timeRef.current.value += Math.min(delta, 0.05);
    const mesh = ref.current;
    if (!mesh) return;
    // Cropped area breathes a little with farm activity; the fields never empty out.
    const height = 0.7 + world.farm * 0.6;
    mesh.count = Math.round(positions.length * THREE.MathUtils.clamp(world.farm, 0.4, 1));
    for (let i = 0; i < mesh.count; i++) {
      const [x, z, rot, s] = positions[i];
      setInstance(mesh, i, x, 0.14, z, rot, [s, s * height, s]);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={ref} args={[geo, mat, positions.length]} frustumCulled={false} />;
}

// ---------------------------------------------------------------------------

export function Trees({ count }: { count: number }) {
  const geos = [useGeometry(() => buildTree(0)), useGeometry(() => buildTree(1)), useGeometry(() => buildTree(2))];
  const mat = useMaterial(() => villageLambert());
  const refs = [useRef<THREE.InstancedMesh>(null), useRef<THREE.InstancedMesh>(null), useRef<THREE.InstancedMesh>(null)];

  const buckets = useMemo(() => {
    const trimmed = treeScatter.slice(0, count);
    return [0, 1, 2].map((v) => trimmed.filter((t) => t.variant === v));
  }, [count]);

  const shadowGeo = useMemo(() => {
    const g = new THREE.PlaneGeometry(1, 1);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  const shadowMat = useMaterial(
    () => new THREE.MeshBasicMaterial({ map: getBlobTexture(), transparent: true, depthWrite: false, opacity: 0.55 }),
  );
  const shadowRef = useRef<THREE.InstancedMesh>(null);

  useFrame(() => {
    // Tree cover thins slightly as the industrial edge is built out.
    const keep = THREE.MathUtils.clamp(world.trees, 0.5, 1);
    let shadowIndex = 0;
    buckets.forEach((bucket, v) => {
      const mesh = refs[v].current;
      if (!mesh) return;
      mesh.count = Math.round(bucket.length * keep);
      for (let i = 0; i < mesh.count; i++) {
        const t = bucket[i];
        setInstance(mesh, i, t.position[0], 0, t.position[2], t.rotation, t.scale);
        const shadows = shadowRef.current;
        if (shadows && shadowIndex < shadows.instanceMatrix.count) {
          setInstance(shadows, shadowIndex++, t.position[0] - 1, 0.09, t.position[2] - 0.6, 0, [
            t.scale * 5,
            1,
            t.scale * 4,
          ]);
        }
      }
      mesh.instanceMatrix.needsUpdate = true;
    });
    const shadows = shadowRef.current;
    if (shadows) {
      shadows.count = shadowIndex;
      shadows.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {buckets.map((bucket, v) => (
        <instancedMesh key={v} ref={refs[v]} args={[geos[v], mat, Math.max(bucket.length, 1)]} frustumCulled={false} />
      ))}
      <instancedMesh
        ref={shadowRef}
        args={[shadowGeo, shadowMat, Math.max(count, 1)]}
        renderOrder={-1}
        frustumCulled={false}
      />
    </group>
  );
}

// ---------------------------------------------------------------------------

const SECTOR_LEVEL: Record<string, keyof typeof world> = {
  farm: 'farm',
  shop: 'shops',
  carpenter: 'carpenters',
  government: 'services',
  construction: 'construction',
  factory: 'factory',
  warehouse: 'warehouse',
  delivery: 'delivery',
};

export function People({ count }: { count: number }) {
  const geo = useGeometry(() => buildPerson());
  const mat = useMaterial(() => villageLambert());
  const ref = useRef<THREE.InstancedMesh>(null);

  const agents = useMemo(() => {
    let seed = 99;
    const rand = () => {
      seed = (seed * 48271) % 2147483647;
      return seed / 2147483647;
    };
    return Array.from({ length: count }, (_, i) => {
      const spot = crowdSpots[i % crowdSpots.length];
      return {
        spot,
        radius: spot.radius * (0.35 + rand() * 0.6),
        phase: rand() * Math.PI * 2,
        speed: 0.12 + rand() * 0.22,
        colour: C.people[Math.floor(rand() * C.people.length)],
        scale: 1.35 + rand() * 0.3,
      };
    });
  }, [count]);

  const clock = useRef(0);

  useFrame((_, delta) => {
    const mesh = ref.current;
    if (!mesh) return;
    clock.current += Math.min(delta, 0.05);
    let n = 0;
    for (const a of agents) {
      const level = world[SECTOR_LEVEL[a.spot.sector]] as number;
      if (level < 0.12) continue;
      const t = clock.current * a.speed + a.phase;
      const x = a.spot.position[0] + Math.cos(t) * a.radius;
      const z = a.spot.position[2] + Math.sin(t * 1.3) * a.radius * 0.7;
      setInstance(mesh, n, x, 0, z, -t, a.scale);
      mesh.setColorAt(n, new THREE.Color(a.colour));
      n++;
    }
    mesh.count = n;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return <instancedMesh ref={ref} args={[geo, mat, Math.max(count, 1)]} frustumCulled={false} />;
}

// ---------------------------------------------------------------------------

type VehicleSpec = {
  geometry: THREE.BufferGeometry;
  route: [number, number, number][];
  speed: number;
  offset: number;
  /** World key that gates whether this vehicle exists at all. */
  gate: keyof typeof world;
  gateMin: number;
  scale?: number;
};

export function Vehicles() {
  const bus = useGeometry(() => buildBus());
  const auto = useGeometry(() => buildAuto());
  const truck = useGeometry(() => buildTruck());
  const factoryTruck = useGeometry(() => buildTruck(C.truckAlt));
  const scooter = useGeometry(() => buildScooter());
  const mat = useMaterial(() => villageLambert());

  const specs = useMemo<VehicleSpec[]>(
    () => [
      { geometry: bus, route: busRoute as [number, number, number][], speed: 0.016, offset: 0, gate: 'traffic', gateMin: 0.1 },
      { geometry: auto, route: autoRoute as [number, number, number][], speed: 0.026, offset: 0.35, gate: 'traffic', gateMin: 0.2 },
      { geometry: truck, route: truckRoute as [number, number, number][], speed: 0.02, offset: 0.1, gate: 'warehouse', gateMin: 0.05 },
      { geometry: factoryTruck, route: factoryTruckRoute as [number, number, number][], speed: 0.022, offset: 0.6, gate: 'factory', gateMin: 0.2 },
      ...scooterRoutes.map((route, i) => ({
        geometry: scooter,
        route: route as [number, number, number][],
        speed: 0.045 + i * 0.008,
        offset: i * 0.31,
        gate: 'delivery' as const,
        gateMin: 0.05 + i * 0.2,
      })),
    ],
    [bus, auto, truck, factoryTruck, scooter],
  );

  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const clock = useRef(0);

  useFrame((_, delta) => {
    clock.current += Math.min(delta, 0.05);
    specs.forEach((spec, i) => {
      const mesh = refs.current[i];
      if (!mesh) return;
      const level = world[spec.gate] as number;
      const alive = THREE.MathUtils.clamp((level - spec.gateMin) / 0.2, 0, 1);
      mesh.visible = alive > 0.02;
      if (!mesh.visible) return;
      mesh.scale.setScalar((spec.scale ?? 1) * alive);
      const { x, z, heading } = sampleRoute(spec.route, clock.current * spec.speed + spec.offset);
      mesh.position.set(x, 0, z);
      mesh.rotation.y = heading;
    });
  });

  return (
    <group>
      {specs.map((spec, i) => (
        <mesh
          key={i}
          ref={(node) => {
            refs.current[i] = node;
          }}
          geometry={spec.geometry}
          material={mat}
        />
      ))}
    </group>
  );
}

/** Parked scooters at the delivery hub, so the yard is not empty when nothing is moving. */
export function ParkedScooters() {
  const geo = useGeometry(() => buildScooter());
  const mat = useMaterial(() => villageLambert());
  const ref = useRef<THREE.Group>(null);

  useFrame(() => {
    if (ref.current) {
      const s = THREE.MathUtils.clamp(world.delivery * 1.4, 0, 1);
      ref.current.scale.setScalar(s);
      ref.current.visible = s > 0.02;
    }
  });

  return (
    <group ref={ref}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} geometry={geo} material={mat} position={[1.4 + i * 1.3, 0, 5.6]} rotation={[0, 0.4 + i * 0.12, 0]} />
      ))}
    </group>
  );
}

/** Keeps ambient motion out of the frame entirely for reduced-motion visitors. */
export function AmbientLife({ people, crops, vehicles }: { people: number; crops: number; vehicles: boolean }) {
  const reduced = useStore((s) => s.reducedMotion);
  return (
    <group>
      <Crops perField={crops} />
      {!reduced && <People count={people} />}
      {vehicles && !reduced && <Vehicles />}
      <ParkedScooters />
    </group>
  );
}
