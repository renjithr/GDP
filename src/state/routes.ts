/**
 * Hash routing.
 *
 * GitHub Pages has no server-side rewrite, so every shareable location lives after the
 * "#". `#/village`, `#/base-year`, `#/nominal-vs-real` and `#/sources` all resolve from
 * the same index.html, on a project path or a custom domain, with no 404 risk.
 */

export type StageMode =
  /** No village on screen — pure editorial. */
  | 'hidden'
  /** Village visible but dimmed behind the narrative. */
  | 'ambient'
  /** Village is the subject; narrative sits beside/below it. */
  | 'stage';

export type CameraPoseId =
  | 'overview'
  | 'enter'
  | 'wide'
  | 'analytical'
  | 'carpenter'
  | 'factory'
  | 'future';

export type RouteId =
  | 'claim'
  | 'problem'
  | 'suspicion'
  | 'village'
  | 'value-added'
  | 'estimated'
  | 'timeline'
  | 'mistake'
  | 'base-year'
  | 'what-changed'
  | 'revisions'
  | 'aha'
  | 'nominal-vs-real'
  | 'forever'
  | 'history'
  | 'answer'
  | 'faq'
  | 'sources';

export type RouteDef = {
  id: RouteId;
  path: string;
  /** Progress-navigator step, 1–10. Utility pages have none. */
  step?: number;
  /** Short title used in the document title and the navigator tooltip. */
  title: string;
  mode: StageMode;
  /** Village year this section wants. Omitted means "leave the year where it is". */
  year?: number;
  pose?: CameraPoseId;
  /** On phones, replace the village split-view with a full-height story page. */
  mobileFullscreen?: boolean;
  /** Utility pages sit outside the linear walkthrough. */
  utility?: boolean;
};

export const steps: { step: number; label: string; routeId: RouteId }[] = [
  { step: 1, label: '7.8%?', routeId: 'claim' },
  { step: 2, label: 'The Problem', routeId: 'problem' },
  { step: 3, label: 'GDP Village', routeId: 'village' },
  { step: 4, label: 'GDP Is Estimated', routeId: 'estimated' },
  { step: 5, label: '2010 → 2026', routeId: 'timeline' },
  { step: 6, label: 'The Mistake', routeId: 'mistake' },
  { step: 7, label: 'New Base Year', routeId: 'base-year' },
  { step: 8, label: '2025 Revised', routeId: 'revisions' },
  { step: 9, label: 'Nominal vs Real', routeId: 'nominal-vs-real' },
  { step: 10, label: 'Final Answer', routeId: 'answer' },
];

/** Order matters: it defines Back/Next. */
export const routes: RouteDef[] = [
  { id: 'claim', path: '/', step: 1, title: 'India grew 7.8%', mode: 'hidden' },
  { id: 'problem', path: '/problem', step: 2, title: 'The Problem', mode: 'hidden' },
  { id: 'suspicion', path: '/suspicion', step: 2, title: 'Wait — ₹86.05 became ₹80.00?', mode: 'hidden' },
  { id: 'village', path: '/village', step: 3, title: 'Enter the Village', mode: 'stage', year: 2026, pose: 'enter' },
  { id: 'value-added', path: '/value-added', step: 3, title: 'What GDP Measures', mode: 'stage', year: 2026, pose: 'carpenter' },
  { id: 'estimated', path: '/estimated', step: 4, title: 'GDP Is Estimated', mode: 'stage', year: 2026, pose: 'wide' },
  { id: 'timeline', path: '/timeline', step: 5, title: '2010 → 2026', mode: 'stage', year: 2010, pose: 'overview' },
  { id: 'mistake', path: '/mistake', step: 6, title: 'There Was a Mistake', mode: 'stage', year: 2026, pose: 'carpenter' },
  { id: 'base-year', path: '/base-year', step: 7, title: 'The Base-Year Experience', mode: 'stage', year: 2026, pose: 'analytical' },
  { id: 'what-changed', path: '/what-changed', step: 7, title: 'What Changed in the New Series', mode: 'stage', year: 2026, pose: 'overview' },
  { id: 'revisions', path: '/revisions', step: 8, title: 'Same Quarter, Updated Estimate', mode: 'ambient', year: 2026, mobileFullscreen: true },
  { id: 'aha', path: '/aha', step: 8, title: 'Revisiting 2.6%', mode: 'ambient', mobileFullscreen: true },
  { id: 'nominal-vs-real', path: '/nominal-vs-real', step: 9, title: 'Nominal vs Real', mode: 'ambient', mobileFullscreen: true },
  { id: 'forever', path: '/forever', step: 10, title: 'Does Rebasing Solve GDP Forever?', mode: 'stage', year: 2026, pose: 'future', mobileFullscreen: true },
  { id: 'history', path: '/history', step: 10, title: 'India’s Base-Year History', mode: 'ambient', mobileFullscreen: true },
  { id: 'answer', path: '/answer', step: 10, title: 'The Final Answer', mode: 'ambient', mobileFullscreen: true },
  { id: 'faq', path: '/faq', title: 'FAQ', mode: 'hidden', utility: true },
  { id: 'sources', path: '/sources', title: 'Sources', mode: 'hidden', utility: true },
];

export const routeById = (id: RouteId) => routes.find((r) => r.id === id)!;

const storyRoutes = routes.filter((r) => !r.utility);

export function neighbours(id: RouteId): { prev?: RouteDef; next?: RouteDef } {
  const i = storyRoutes.findIndex((r) => r.id === id);
  if (i === -1) return {};
  return { prev: storyRoutes[i - 1], next: storyRoutes[i + 1] };
}

export function routeFromHash(hash: string): RouteDef {
  const path = hash.replace(/^#/, '') || '/';
  const normalised = path.length > 1 ? path.replace(/\/$/, '') : path;
  return routes.find((r) => r.path === normalised) ?? routes[0];
}

export const hashFor = (id: RouteId) => `#${routeById(id).path}`;
