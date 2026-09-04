import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { C, SUN_DIRECTION } from '../palette';
import { buildCivic, buildHouses, buildPoles, buildShopLife, buildShops, buildTerrain } from '../builders';
import { PLATE, carpenters, civic, houses, shops } from '../layout';
import { getBlobTexture, plateGeometry } from '../mesh';
import { world } from '../worldState';
import { fadingLambert, setInstance, useGeometry, useMaterial, villageLambert } from './common';
import { useStore } from '../../state/store';
import { sectorById } from '../../data/sectors';

export function Lights() {
  const dir = useRef<THREE.DirectionalLight>(null);
  const amb = useRef<THREE.HemisphereLight>(null);
  const spot = useRef<THREE.PointLight>(null);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const selected = useStore.getState().selectedSector;
    // Selecting an activity dims the village slightly and lifts a warm light over the
    // chosen district — "focus here" without dimming meshes individually.
    const dim = selected ? 0.74 : 1;
    if (dir.current) dir.current.intensity += (1.55 * dim - dir.current.intensity) * dt * 4;
    if (amb.current) amb.current.intensity += (1.15 * dim - amb.current.intensity) * dt * 4;
    if (spot.current) {
      spot.current.intensity += ((selected ? 90 : 0) - spot.current.intensity) * dt * 4;
      if (selected) {
        const a = sectorById(selected).anchor;
        spot.current.position.set(a[0], 14, a[2]);
      }
    }
  });

  return (
    <>
      <hemisphereLight ref={amb} args={['#eaf3f7', '#6b7f52', 1.15]} />
      <directionalLight ref={dir} position={SUN_DIRECTION} intensity={1.55} color="#fff3dd" />
      <pointLight ref={spot} intensity={0} distance={46} decay={1.6} color="#ffd79a" />
    </>
  );
}

/** Ground plate, roads, field beds and the pond. */
export function Terrain() {
  const turf = useGeometry(() => plateGeometry(PLATE.width, PLATE.depth, 1.4));
  const subsoil = useGeometry(() => plateGeometry(PLATE.width - 1.2, PLATE.depth - 1.2, 4.5));
  const detail = useGeometry(() => buildTerrain());
  const mat = useMaterial(() => villageLambert());
  const grass = useMaterial(() => new THREE.MeshLambertMaterial({ color: C.grass }));
  const side = useMaterial(() => new THREE.MeshLambertMaterial({ color: '#9d7f52' }));

  return (
    <group>
      <mesh geometry={subsoil} position={[0, -1.4, 0]} material={side} />
      <mesh geometry={turf} material={grass} />
      <mesh geometry={detail} material={mat} />
    </group>
  );
}

/** Everything that never changes: housing, civic buildings, the bazaar shells, poles. */
export function StaticVillage() {
  const homes = useGeometry(() => buildHouses());
  const civicGeo = useGeometry(() => buildCivic());
  const shopGeo = useGeometry(() => buildShops());
  const { poles: poleGeo, wires } = useMemo(() => buildPoles(), []);
  const mat = useMaterial(() => villageLambert());
  const wireMat = useMaterial(() => new THREE.LineBasicMaterial({ color: '#5c6b6f', transparent: true, opacity: 0.55 }));

  return (
    <group>
      <mesh geometry={homes} material={mat} />
      <mesh geometry={civicGeo} material={mat} />
      <mesh geometry={shopGeo} material={mat} />
      <mesh geometry={poleGeo} material={mat} />
      <lineSegments geometry={wires} material={wireMat} />
    </group>
  );
}

/** Awnings and stock: the bazaar looks busier or quieter with its vitality level. */
export function BazaarLife() {
  const geo = useGeometry(() => buildShopLife());
  const mat = useMaterial(() => fadingLambert());
  const ref = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const v = THREE.MathUtils.mapLinear(world.shops, 0.75, 0.92, 0.55, 1);
    mat.opacity = THREE.MathUtils.clamp(v, 0.5, 1);
    if (ref.current) ref.current.scale.setScalar(THREE.MathUtils.clamp(0.9 + v * 0.1, 0.9, 1));
  });

  return <mesh ref={ref} geometry={geo} material={mat} />;
}

/**
 * Soft contact shadows as instanced sprites. A real shadow map for a scene this wide
 * costs more than it adds at this art style.
 */
export function BuildingShadows() {
  const spots = useMemo(() => {
    const list: { x: number; z: number; r: number }[] = [];
    for (const h of houses) list.push({ x: h.position[0], z: h.position[2], r: 4.6 });
    for (const s of shops) list.push({ x: s.position[0], z: s.position[2], r: 4.2 });
    for (const c of carpenters) list.push({ x: c.position[0], z: c.position[2], r: 5 });
    list.push({ x: civic.school.position[0], z: civic.school.position[2], r: 11 });
    list.push({ x: civic.clinic.position[0], z: civic.clinic.position[2], r: 5.5 });
    list.push({ x: civic.panchayat.position[0], z: civic.panchayat.position[2], r: 5.2 });
    list.push({ x: civic.bank.position[0], z: civic.bank.position[2], r: 7 });
    list.push({ x: civic.waterTower.position[0], z: civic.waterTower.position[2], r: 4 });
    return list;
  }, []);

  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(1, 1);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  const mat = useMaterial(
    () =>
      new THREE.MeshBasicMaterial({
        map: getBlobTexture(),
        transparent: true,
        depthWrite: false,
        opacity: 0.7,
      }),
  );
  const ref = useRef<THREE.InstancedMesh>(null);

  useMemo(() => {
    // Filled once the mesh exists; see the effect below.
  }, []);

  return (
    <instancedMesh
      ref={(node) => {
        if (!node) return;
        (ref as { current: THREE.InstancedMesh | null }).current = node;
        spots.forEach((s, i) => setInstance(node, i, s.x - 1.4, 0.08, s.z - 0.9, 0, [s.r, 1, s.r * 0.8]));
        node.instanceMatrix.needsUpdate = true;
      }}
      args={[geo, mat, spots.length]}
      renderOrder={-1}
    />
  );
}
