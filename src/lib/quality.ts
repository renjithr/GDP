export type QualityTier = 'low' | 'medium' | 'high';

export type QualityProfile = {
  tier: QualityTier;
  dprCap: number;
  trees: number;
  cropsPerField: number;
  people: number;
  vehicles: boolean;
  blobShadows: boolean;
  /** Extra decorative props: fences, poles, crates, cattle. */
  props: boolean;
};

const profiles: Record<QualityTier, QualityProfile> = {
  low: { tier: 'low', dprCap: 1.25, trees: 26, cropsPerField: 26, people: 8, vehicles: false, blobShadows: false, props: false },
  medium: { tier: 'medium', dprCap: 1.5, trees: 54, cropsPerField: 54, people: 16, vehicles: true, blobShadows: true, props: true },
  high: { tier: 'high', dprCap: 2, trees: 90, cropsPerField: 96, people: 26, vehicles: true, blobShadows: true, props: true },
};

/**
 * Cheap, static device profiling. We deliberately do not benchmark at runtime: a wrong
 * guess costs some decoration, a stutter costs the explanation.
 */
export function detectQuality(): QualityProfile {
  if (typeof window === 'undefined') return profiles.medium;

  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false;
  const small = Math.min(window.screen.width, window.screen.height) < 500;

  if (cores <= 4 || memory <= 3 || (coarse && small && cores <= 6)) return profiles.low;
  if (coarse || cores <= 8 || memory <= 6) return profiles.medium;
  return profiles.high;
}

export function isWebglAvailable(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ??
      canvas.getContext('webgl') ??
      canvas.getContext('experimental-webgl');
    if (!gl) return false;
    // Free the context immediately; browsers cap how many can exist at once.
    (gl as WebGLRenderingContext).getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}
