import { useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../state/store';
import { useDocumentVisible, useIsMobile } from '../lib/hooks';
import { C } from './palette';
import { jumpWorldTo, tickWorld } from './worldState';
import { CameraRig } from './CameraRig';
import { BazaarLife, BuildingShadows, Lights, StaticVillage, Terrain } from './parts/Static';
import { AmbientLife, Trees } from './parts/Life';
import { CarpenterRow, ConstructionSite, DeliveryHub, Factory, GhostWorkshops, Warehouse } from './parts/Economy';
import { CalibrationGrid, DataSignals, FactoryFlows, FutureSilhouettes, Hotspots } from './parts/Analysis';

/**
 * The village canvas.
 *
 * Mounted once, for the whole visit. Acts change what is emphasised, never which
 * renderer is alive — no WebGL context is created or destroyed between sections.
 *
 * This module is code-split: Act 1 renders and is interactive before three.js is even
 * fetched (see <VillageStage/>).
 */

function WorldTicker() {
  const reduced = useStore((s) => s.reducedMotion);
  useFrame((_, delta) => {
    tickWorld(useStore.getState().year, Math.min(delta, 0.05), reduced);
  });
  return null;
}

/** In reduced-motion mode the loop is on demand, so state changes must ask for a frame. */
function DemandInvalidator() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    invalidate();
    return useStore.subscribe(() => invalidate());
  }, [invalidate]);
  return null;
}

function SceneEnvironment() {
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    scene.background = new THREE.Color(C.sky);
    scene.fog = new THREE.Fog(C.haze, 620, 1300);
    return () => {
      scene.fog = null;
    };
  }, [scene]);
  return null;
}

export default function VillageScene() {
  const quality = useStore((s) => s.quality);
  const reduced = useStore((s) => s.reducedMotion);
  const setVillageReady = useStore((s) => s.setVillageReady);
  const mode = useStore((s) => s.mode);
  const visible = useDocumentVisible();
  const mobile = useIsMobile();

  useEffect(() => {
    jumpWorldTo(useStore.getState().year);
    setVillageReady(true);
    return () => setVillageReady(false);
  }, [setVillageReady]);

  // Stop rendering entirely when the tab is hidden or the village is off-screen.
  const frameloop: 'always' | 'never' | 'demand' =
    !visible || mode === 'hidden' ? 'never' : reduced ? 'demand' : 'always';

  return (
    <Canvas
      frameloop={frameloop}
      dpr={[1, quality.dprCap]}
      gl={{ antialias: quality.tier !== 'low', powerPreference: 'high-performance', alpha: false }}
      camera={{ fov: 30, near: 5, far: 1600, position: [240, 210, 240] }}
      // The scene is decorative to assistive tech; every object has a text equivalent
      // in the narrative panel and the sector list.
      aria-hidden="true"
      style={{ touchAction: 'pan-y' }}
    >
      <SceneEnvironment />
      <WorldTicker />
      {reduced && <DemandInvalidator />}
      <Lights />

      <Terrain />
      <StaticVillage />
      <BazaarLife />
      {quality.blobShadows && <BuildingShadows />}
      <Trees count={quality.trees} />

      <CarpenterRow />
      <ConstructionSite />
      <Factory />
      <Warehouse />
      <DeliveryHub />

      <AmbientLife people={quality.people} crops={quality.cropsPerField} vehicles={quality.vehicles} />

      <GhostWorkshops />
      <DataSignals />
      <CalibrationGrid />
      <FutureSilhouettes />
      <FactoryFlows />
      <Hotspots />

      <CameraRig mobile={mobile} />
    </Canvas>
  );
}
