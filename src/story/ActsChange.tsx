import { useEffect, useState } from 'react';
import { StoryNav } from '../components/Chrome';
import { TimeSlider } from '../components/TimeSlider';
import { WorldCallouts, type CalloutItem } from '../components/Callouts';
import { Illustrative, Note } from '../components/bits';
import { VillageFallback } from '../fallback/VillageFallback';
import { anchors } from '../village/layout';
import { staleEstimates, villageGdp } from '../data/illustrativeVillageData';
import { villageLakh } from '../lib/format';
import { useStore } from '../state/store';
import { useSceneFlags } from './hooks';

function FallbackIfNeeded() {
  const webgl = useStore((s) => s.webgl);
  const simple = useStore((s) => s.simpleView);
  if (webgl && !simple) return null;
  return <VillageFallback />;
}

/* --- ACT 6 — TIME TRAVEL + THE TIME SLIDER -------------------------------- */

const TIMELINE_CALLOUTS: CalloutItem[] = [
  { id: 't-carpenter', position: anchors.carpenter, label: 'Carpenters', emoji: '🪚' },
  { id: 't-factory', position: anchors.factory, label: 'Factory', emoji: '🏭', appearsIn: 2015 },
  { id: 't-warehouse', position: anchors.warehouse, label: 'Warehouse', emoji: '📦', appearsIn: 2018 },
  { id: 't-delivery', position: anchors.delivery, label: 'Delivery', emoji: '🛵', appearsIn: 2022 },
  { id: 't-farm', position: anchors.farm, label: 'Farms', emoji: '🌾' },
];

export function ActTimeline() {
  const year = useStore((s) => s.year);
  const rounded = Math.round(year);

  return (
    <article>
      <p className="eyebrow">Act 6 · 2010 → 2026</p>
      <h1>2010.</h1>
      <p>
        Same village, sixteen years earlier. Six independent carpenter workshops, all busy.
        Fields. A row of shops. A bus. A school and a clinic. Something being built.
      </p>
      <p>
        No furniture factory. No warehouse. No delivery riders. No logistics operation. The
        whole village produced value added of about{' '}
        <span className="mono">₹{villageGdp[2010]} lakh</span> that year. <Illustrative />
      </p>

      <h2>The reference picture</h2>
      <p>
        To measure an economy well, statisticians need a detailed reference picture of it —
        a benchmark year studied in far more depth than any single quarter can be. That
        picture answers:
      </p>
      <ul className="cycle">
        <li>
          <span className="n" aria-hidden="true">
            ?
          </span>
          What activities exist here?
        </li>
        <li>
          <span className="n" aria-hidden="true">
            ?
          </span>
          How large is each of them relative to the others?
        </li>
        <li>
          <span className="n" aria-hidden="true">
            ?
          </span>
          How is each one best measured?
        </li>
        <li>
          <span className="n" aria-hidden="true">
            ?
          </span>
          What data are actually available about it?
        </li>
        <li>
          <span className="n" aria-hidden="true">
            ?
          </span>
          What prices and relationships describe it?
        </li>
      </ul>
      <Note>
        This does <strong>not</strong> mean every person and business gets individually
        surveyed, then or ever. It means the framework used to turn partial information into
        a total is calibrated against a year that was studied unusually thoroughly.
      </Note>

      <FallbackIfNeeded />

      <h2 style={{ marginTop: '2rem' }}>Now drag time forward.</h2>
      <p>Watch the same village. Nothing here is a different scene — it is one place, changing.</p>

      <TimeSlider />

      <p aria-live="polite">
        {rounded < 2015 && 'Many traditional carpenters. Everything the village produces comes from farms, workshops, shops and public services.'}
        {rounded >= 2015 && rounded < 2018 && 'A furniture factory has opened on the eastern edge. It makes what the carpenters make — but at a different scale, with machines and a payroll.'}
        {rounded >= 2018 && rounded < 2022 && 'A warehouse has appeared. Trucks now come and go. Goods pause in the village on their way to somewhere else — an activity that did not previously exist here.'}
        {rounded >= 2022 && rounded < 2024 && 'Delivery riders are moving through the village. Orders are being placed on phones. Some carpenter workshops have gone quiet.'}
        {rounded >= 2024 && rounded < 2026 && 'More service and digital activity. The factory and the warehouse have both grown.'}
        {rounded >= 2026 && 'The factory is large. The warehouse is large. Delivery is everywhere. Two or three carpenter workshops still trade; the rest have shuttered. The farms are still farming.'}
      </p>

      <h2 className="big-statement">The structure changed.</h2>
      <p>
        Notice what did <em>not</em> happen. Agriculture did not disappear. The shops are
        still there. Traditional businesses still exist. The point is not that the old
        economy died — it is that the <strong>proportions</strong> of this economy, and the
        kinds of activity in it, are not what they were.
      </p>

      <WorldCallouts items={TIMELINE_CALLOUTS} />
      <StoryNav />
    </article>
  );
}

/* --- ACT 7 — THERE WAS A MISTAKE ------------------------------------------ */

export function ActMistake() {
  useSceneFlags({ ghostsOn: true });
  const setYear = useStore((s) => s.setYear);
  useEffect(() => setYear(2026), [setYear]);

  const [shown, setShown] = useState(false);

  return (
    <article>
      <p className="eyebrow">Act 7 · The mistake</p>
      <h1>“What if our statistical picture still thinks this sector is as large as before?”</h1>
      <p>
        Look at the carpenter district in 2026. The pale blue shapes are workshops that are
        no longer working — but which a measuring framework built around the old village
        still behaves as though it has.
      </p>

      <FallbackIfNeeded />

      {!shown ? (
        <button type="button" className="btn btn-primary" onClick={() => setShown(true)}>
          Compare with fresher information
        </button>
      ) : (
        <>
          <div className="cards">
            {staleEstimates.map((s) => (
              <div className="card stat-card" key={s.id} style={{ ['--accent' as string]: s.direction === 'down' ? 'var(--clay)' : 'var(--teal)' } as React.CSSProperties}>
                <p className="stat-label">
                  <span aria-hidden="true">{s.emoji} </span>
                  {s.label}
                </p>
                <p className="stat-value" style={{ fontSize: '1.5rem' }}>
                  <span style={{ color: 'var(--text-faint)', textDecoration: 'line-through' }}>
                    {villageLakh(s.oldEstimate)}
                  </span>
                  <span aria-hidden="true" style={{ color: 'var(--text-faint)' }}>
                    {' → '}
                  </span>
                  {villageLakh(s.updatedEstimate)}
                </p>
                <p className="stat-sub">{s.why}</p>
              </div>
            ))}
          </div>
          <p>
            <Illustrative />
          </p>

          <h2 className="big-statement">The village did not lose ₹5 lakh today.</h2>
          <h2 className="big-statement" style={{ color: 'var(--teal)' }}>
            Our previous estimate of that past activity was too high.
          </h2>
          <p>
            Nothing was destroyed. No workshop closed this morning. What changed is the
            picture: an estimate of activity in the past has been replaced with a better one.
          </p>

          <Note>
            And notice the second card. Delivery went the other way — an activity that barely
            registered in the old framework turned out to be <strong>larger</strong> than
            assumed. Some activities get revised down. Others get revised up.{' '}
            <strong>The total revision is the net effect of all of them</strong>, which is why
            "rebasing lowers GDP" is not a rule and never has been.
          </Note>

          <Note tone="warn">
            So how do you fix a measuring system built around an older economy?
          </Note>
        </>
      )}

      <StoryNav nextLabel="Recalibrate →" />
    </article>
  );
}
