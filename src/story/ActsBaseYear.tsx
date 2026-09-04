import { useMemo } from 'react';
import { StoryNav } from '../components/Chrome';
import { WorldCallouts, type CalloutItem } from '../components/Callouts';
import { DeepDive, Illustrative, Note } from '../components/bits';
import { VillageFallback } from '../fallback/VillageFallback';
import { anchors } from '../village/layout';
import { doubleDeflation, doubleDeflationWorked as W, furnitureLtd } from '../data/illustrativeVillageData';
import { useStore } from '../state/store';
import { useSceneFlags } from './hooks';

function FallbackIfNeeded() {
  const webgl = useStore((s) => s.webgl);
  const simple = useStore((s) => s.simpleView);
  if (webgl && !simple) return null;
  return <VillageFallback />;
}

/* --- ACT 8 — THE BASE-YEAR EXPERIENCE ------------------------------------- */

export function ActBaseYear() {
  useSceneFlags({ gridOn: true });
  const calibrated = useStore((s) => s.calibrated);
  const setCalibrated = useStore((s) => s.setCalibrated);

  const callouts = useMemo<CalloutItem[]>(
    () => [
      { id: 'g-carpenter', position: anchors.carpenter, label: calibrated ? 'Re-weighted' : 'Heavily weighted', emoji: '🪚', tone: calibrated ? 'teal' : 'clay', offsetY: 12 },
      { id: 'g-factory', position: anchors.factory, label: calibrated ? 'Fully described' : 'Under-weighted', emoji: '🏭', tone: calibrated ? 'teal' : 'clay', offsetY: 12 },
      { id: 'g-delivery', position: anchors.delivery, label: calibrated ? 'Now in the framework' : 'Barely reached', emoji: '🛵', tone: calibrated ? 'teal' : 'clay', offsetY: 12 },
      { id: 'g-warehouse', position: anchors.warehouse, label: calibrated ? 'Now in the framework' : 'Barely reached', emoji: '📦', tone: calibrated ? 'teal' : 'clay', offsetY: 12 },
    ],
    [calibrated],
  );

  return (
    <article>
      <p className="eyebrow">Act 8 · The base year</p>
      <h1>Recalibrating the framework</h1>
      <p>
        Over the village is the measuring framework: nodes on each activity, sized by how
        much emphasis the framework gives it, wired into the estimate.
      </p>

      <div className="cards" style={{ gridTemplateColumns: '1fr' }}>
        <div className="card stat-card" style={{ ['--accent' as string]: calibrated ? 'var(--teal)' : 'var(--clay)' } as React.CSSProperties}>
          <p className="stat-label">{calibrated ? 'New reference' : 'Old reference'}</p>
          <p className="stat-value" style={{ fontSize: '2.2rem' }}>
            {calibrated ? '2022–23' : '2011–12'}
          </p>
          <p className="stat-sub">
            {calibrated
              ? 'Benchmarked against a recent year, with the data and structure of the economy as it is now.'
              : 'Benchmarked against a village that no longer looks like this. The carpenter trade is weighted as though it were still the biggest thing here; the factory, warehouse and delivery work are barely described.'}
          </p>
        </div>
      </div>

      <FallbackIfNeeded />

      {!calibrated ? (
        <button type="button" className="btn btn-primary" onClick={() => setCalibrated(true)}>
          Update the framework →
        </button>
      ) : (
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setCalibrated(false)}>
          ↺ Show the old reference again
        </button>
      )}

      <h2 style={{ marginTop: '2rem' }}>
        “A base-year revision is not simply changing the year printed on a ruler.”
      </h2>
      <p>Recalibrating the framework can involve updating all of this at once:</p>
      <ul className="cycle">
        {[
          'Benchmark data for the reference year',
          'Surveys — their coverage, design and vintage',
          'Administrative information newly available',
          'The structure of industries and how firms are organised',
          'Classifications used to sort activity',
          'Coverage — activities previously represented only indirectly',
          'How prices and volumes are measured',
          'Estimation methodology itself',
        ].map((item, i) => (
          <li key={item}>
            <span className="n" aria-hidden="true">
              {i + 1}
            </span>
            {item}
          </li>
        ))}
      </ul>
      <p>
        The animation over the village is a metaphor for that. The substance is the list
        above: several changes applied together, each documented, whose combined effect on
        any given past quarter can be up or down.
      </p>

      <WorldCallouts items={callouts} />
      <StoryNav />
    </article>
  );
}

/* --- WHAT CHANGED IN INDIA'S NEW SERIES ----------------------------------- */

export function ActWhatChanged() {
  useSceneFlags({ gridOn: false });
  const split = useStore((s) => s.furnitureSplit);
  const setSplit = useStore((s) => s.setFurnitureSplit);
  const setPose = useStore((s) => s.setPose);

  const callouts = useMemo<CalloutItem[]>(
    () =>
      split
        ? [
            { id: 'f-factory', position: anchors.factory, label: 'Manufacturing', emoji: '🏭', tone: 'teal', offsetY: 10 },
            { id: 'f-warehouse', position: anchors.warehouse, label: 'Warehousing & logistics', emoji: '📦', tone: 'teal', offsetY: 8 },
            { id: 'f-shop', position: anchors.shop, label: 'Trade', emoji: '🏪', tone: 'teal', offsetY: 6 },
          ]
        : [{ id: 'f-group', position: [14, 0, 12], label: 'Furniture Ltd → all counted as MANUFACTURING', emoji: '🏭', tone: 'clay', offsetY: 14, keepOnMobile: true }],
    [split],
  );

  return (
    <article>
      <p className="eyebrow">Act 8 · What changed in India’s new series</p>
      <h1>Four things worth understanding</h1>
      <p>
        The village makes the shapes clear. These are the kinds of improvement the 2022–23
        series describes — the official documents are on the <a href="#/sources">Sources</a>{' '}
        page.
      </p>

      <h2>1. Small businesses</h2>
      <p>
        <span aria-hidden="true">🏪 🪚 </span>
        The hardest part of any economy to measure is the part with no accounts department.
        Fresher recurring information about unincorporated businesses and about workers means
        those activities are estimated from more current evidence rather than from an older
        benchmark carried forward.
      </p>
      <DeepDive summary="The technical version">
        <p>
          In India these come primarily from the Annual Survey of Unincorporated Sector
          Enterprises (ASUSE) and the Periodic Labour Force Survey (PLFS), which provide
          recurring information about unincorporated enterprises and the workforce. Using
          more recent rounds changes estimates for activities dominated by small units.
        </p>
      </DeepDive>

      <h2>2. Administrative data</h2>
      <p>
        <span aria-hidden="true">🧾 </span>
        More of what businesses already file with the government can be used directly, which
        adds connections between the real activity and the estimate that previously had to be
        bridged with assumptions.
      </p>

      <h2>3. One business, several activities</h2>
      <p>
        Meet {furnitureLtd.name}. It owns the factory, the warehouse and a retail outlet.
        Under a framework with less activity-level detail, a firm like this can end up
        classified largely by its main business — everything counted as manufacturing.
      </p>
      <button type="button" className="btn btn-sm btn-primary" onClick={() => { setSplit(!split); setPose(split ? 'overview' : 'factory'); }}>
        {split ? '↺ Group it back together' : 'Separate its activities →'}
      </button>
      <div className="cards" style={{ marginTop: '1rem' }}>
        {furnitureLtd.parts.map((p) => (
          <div className="card" key={p.id} style={{ opacity: split ? 1 : 0.55, transition: 'opacity .4s ease' }}>
            <p style={{ fontWeight: 600, color: 'var(--text)', margin: 0 }}>
              <span aria-hidden="true">{p.emoji} </span>
              {split ? p.label : 'Manufacturing'}
            </p>
            <p style={{ fontSize: '0.85rem', margin: '0.35rem 0 0' }}>{p.detail}</p>
          </div>
        ))}
      </div>
      <p style={{ marginTop: '0.75rem' }}>
        Better activity-level information lets the same business be represented as what it
        actually does — some manufacturing, some logistics, some trade. That moves value
        added <em>between</em> industries, which is one reason individual sectors can move in
        opposite directions in a revision.
      </p>

      <h2>4. Prices and quantities</h2>
      <p>
        Wood goes into the factory. Furniture comes out. Their prices do not have to move
        together — timber can get more expensive in a year when furniture prices barely
        change, or the reverse. How you handle that changes the estimate of how much was
        really <em>produced</em>.
      </p>

      <DeepDive summary="For the curious: double deflation">
        <p>
          Value added is output minus intermediate inputs. To get it in constant prices you
          can deflate value added with a single price index — or deflate output and inputs
          separately with their own indices, which is called <strong>double deflation</strong>.
        </p>
        <p>Take a workshop, with everything in fictional units: <Illustrative /></p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>&nbsp;</th>
                <th>Year 1</th>
                <th>Year 2</th>
                <th>Price index</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Output</td>
                <td className="num">{doubleDeflation.year1.output}</td>
                <td className="num">{doubleDeflation.year2.output}</td>
                <td className="num">{doubleDeflation.priceIndex.output}</td>
              </tr>
              <tr>
                <td>Intermediate inputs</td>
                <td className="num">{doubleDeflation.year1.inputs}</td>
                <td className="num">{doubleDeflation.year2.inputs}</td>
                <td className="num">{doubleDeflation.priceIndex.inputs}</td>
              </tr>
              <tr>
                <td>Value added</td>
                <td className="num">{W.va1}</td>
                <td className="num">{W.va2}</td>
                <td>—</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Input prices rose 8%, output prices only 2%. Deflating value added by the output
          index alone gives {W.singleDeflated.toFixed(1)} — real growth of{' '}
          {W.singleDeflatedGrowth.toFixed(1)}%. Deflating output and inputs separately gives{' '}
          {W.realOutput2.toFixed(1)} − {W.realInputs2.toFixed(1)} ={' '}
          {W.doubleDeflated.toFixed(1)} — real growth of {W.doubleDeflatedGrowth.toFixed(1)}%.
        </p>
        <p>
          Same business, same money, two different answers about how much real production
          happened. Which method is used, and for which industries, is a genuine
          methodological choice with real consequences — and one worth asking about.
        </p>
      </DeepDive>

      <Note tone="warn">
        <strong>What none of this means.</strong> Be careful of these, because they get said
        a lot and they are not right:
        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.1rem' }}>
          <li>Not "online businesses were not counted before".</li>
          <li>Not "the informal economy was not counted".</li>
          <li>Not "changing the base year automatically lowers GDP".</li>
          <li>
            And no single one of these four changes explains the whole revision — the effect
            is the combination of all of them, plus updated data.
          </li>
        </ul>
      </Note>

      <WorldCallouts items={callouts} />
      <StoryNav />
    </article>
  );
}
