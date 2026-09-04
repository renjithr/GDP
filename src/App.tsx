import { useEffect, type ComponentType } from 'react';
import { Footer, Header } from './components/Chrome';
import { VillageStage } from './components/VillageStage';
import { useStore } from './state/store';
import { routeById, type RouteId } from './state/routes';
import { usePrefersReducedMotion } from './lib/hooks';
import { ActClaim, ActProblem, ActSuspicion } from './story/Acts1to3';
import { ActEstimated, ActValueAdded, ActVillage } from './story/ActsVillage';
import { ActMistake, ActTimeline } from './story/ActsChange';
import { ActBaseYear, ActWhatChanged } from './story/ActsBaseYear';
import { ActAha, ActAnswer, ActForever, ActHistory, ActNominalVsReal, ActRevisions } from './story/ActsFinal';
import { FaqPage, SourcesPage } from './story/Pages';
import { jumpWorldTo } from './village/worldState';

const SCREENS: Record<RouteId, ComponentType> = {
  claim: ActClaim,
  problem: ActProblem,
  suspicion: ActSuspicion,
  village: ActVillage,
  'value-added': ActValueAdded,
  estimated: ActEstimated,
  timeline: ActTimeline,
  mistake: ActMistake,
  'base-year': ActBaseYear,
  'what-changed': ActWhatChanged,
  revisions: ActRevisions,
  aha: ActAha,
  'nominal-vs-real': ActNominalVsReal,
  forever: ActForever,
  history: ActHistory,
  answer: ActAnswer,
  faq: FaqPage,
  sources: SourcesPage,
};

export default function App() {
  const routeId = useStore((s) => s.routeId);
  const mode = useStore((s) => s.mode);
  const syncFromHash = useStore((s) => s.syncFromHash);
  const setReducedMotion = useStore((s) => s.setReducedMotion);
  const reduced = usePrefersReducedMotion();

  useEffect(() => setReducedMotion(reduced), [reduced, setReducedMotion]);

  // Hash routing: shareable, refreshable, and safe on GitHub Pages with no rewrites.
  //
  // The store is already seeded from location.hash, so this deliberately does NOT call
  // applyRoute on mount: parent effects run after child effects, and applying the route
  // here would wipe the scene flags the current act had just declared.
  useEffect(() => {
    const onHash = () => {
      syncFromHash();
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [syncFromHash]);

  useEffect(() => {
    const route = routeById(routeId);
    document.title =
      route.id === 'claim'
        ? "GDP Village — Why India's GDP grew 7.8%, not 2.6%"
        : `${route.title} — GDP Village`;
  }, [routeId]);

  // Reduced-motion visitors get the year snapped rather than eased.
  const year = useStore((s) => s.year);
  useEffect(() => {
    if (reduced) jumpWorldTo(year);
  }, [reduced, year]);

  const Screen = SCREENS[routeId];

  return (
    <div className="app">
      <a className="skip-link" href="#story">
        Skip to the story
      </a>
      <Header />
      <VillageStage />
      <main className="main" id="story">
        <div className="narrative" data-mode={mode} key={routeId}>
          <Screen />
        </div>
      </main>
      <Footer />
    </div>
  );
}
