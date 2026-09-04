import { useMemo, useState } from 'react';
import { StoryNav } from '../components/Chrome';
import { SectorExplorer } from '../components/SectorExplorer';
import { WorldCallouts, type CalloutItem } from '../components/Callouts';
import { Illustrative, Note } from '../components/bits';
import { VillageFallback } from '../fallback/VillageFallback';
import { ESTIMATE_HUB, anchors } from '../village/layout';
import { valueChain, valueChainTotals, villageGdp } from '../data/illustrativeVillageData';
import { rupees } from '../lib/format';
import { useStore } from '../state/store';
import { useSceneFlags } from './hooks';

/** Shown in place of the canvas whenever the 3D village is not being used. */
function FallbackIfNeeded() {
  const webgl = useStore((s) => s.webgl);
  const simple = useStore((s) => s.simpleView);
  if (webgl && !simple) return null;
  return <VillageFallback />;
}

/* --- ACT 4 — ENTER GDP VILLAGE -------------------------------------------- */

const VILLAGE_CALLOUTS: CalloutItem[] = [
  { id: 'c-farm', position: anchors.farm, label: 'Farms', emoji: '🌾' },
  { id: 'c-shop', position: anchors.shop, label: 'Shops', emoji: '🏪' },
  { id: 'c-carpenter', position: anchors.carpenter, label: 'Carpenters', emoji: '🪚' },
  { id: 'c-construction', position: anchors.construction, label: 'Construction', emoji: '🏗️' },
  { id: 'c-government', position: anchors.government, label: 'Government', emoji: '🏫' },
  { id: 'c-bus', position: anchors.busStop, label: 'Transport', emoji: '🚌' },
  { id: 'c-bank', position: anchors.bank, label: 'Banking', emoji: '🏦' },
];

export function ActVillage() {
  return (
    <article>
      <p className="eyebrow">Act 4 · GDP Village</p>
      <h1>GDP is not a giant cash counter.</h1>
      <p>
        This is GDP Village. It is not India — it is a model small enough that you can hold
        the whole thing in your head, which is exactly what nobody can do with a real
        economy.
      </p>
      <p>
        People here grow things, make things, sell things, build things, move things and run
        a school and a clinic. All of that together is the village economy. The question a
        statistician has to answer is deceptively hard: <strong>how much of it happened?</strong>
      </p>

      <FallbackIfNeeded />

      <p className="eyebrow" style={{ marginTop: '1.5rem' }}>
        Tap an activity — in the list or in the village itself
      </p>
      <SectorExplorer only={['farm', 'shop', 'carpenter', 'construction', 'government']} />

      <Note>
        There is more here than those five — a bank, a bus route, a factory on the eastern
        edge, a warehouse, delivery riders. Some of it has not always been here. That turns
        out to matter enormously, and we will come back to it.
      </Note>

      <WorldCallouts items={VILLAGE_CALLOUTS} />
      <StoryNav />
    </article>
  );
}

/* --- WHAT GDP MEASURES ---------------------------------------------------- */

export function ActValueAdded() {
  const [mode, setMode] = useState<'sales' | 'added'>('sales');

  const rows = useMemo(
    () =>
      valueChain.steps.map((s) => ({
        ...s,
        shown: mode === 'sales' ? s.salePrice : s.salePrice - s.boughtIn,
      })),
    [mode],
  );
  const total = mode === 'sales' ? valueChainTotals.sumOfSales : valueChainTotals.sumOfValueAdded;

  return (
    <article>
      <p className="eyebrow">Act 4 · What GDP measures</p>
      <h1>“How much new economic value did this village produce?”</h1>
      <p>
        Follow one table. A timber seller sells wood to a carpenter. The carpenter makes a
        table and sells it to the furniture shop. The shop sells it to a family.
      </p>

      <div className="toggle-row">
        <button
          type="button"
          className={`btn btn-sm ${mode === 'sales' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setMode('sales')}
          aria-pressed={mode === 'sales'}
        >
          Add up every sale
        </button>
        <button
          type="button"
          className={`btn btn-sm ${mode === 'added' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setMode('added')}
          aria-pressed={mode === 'added'}
        >
          Count value added
        </button>
      </div>

      <div className="chain">
        {rows.map((s) => (
          <div className="chain-step" key={s.id} data-mode={mode}>
            <span className="emoji" aria-hidden="true">
              {s.emoji}
            </span>
            <span>
              <span className="who">{s.actor}</span>
              <br />
              <span className="what">
                {mode === 'sales' ? s.sells : `${rupees(s.salePrice)} sale − ${rupees(s.boughtIn)} bought in`}
              </span>
            </span>
            <span className="amount">{rupees(s.shown)}</span>
          </div>
        ))}
        <div className="chain-step" data-mode={mode} style={{ borderColor: 'var(--line-strong)' }}>
          <span aria-hidden="true">Σ</span>
          <span className="who">{mode === 'sales' ? 'Total of all sales' : 'Total value added'}</span>
          <span className="amount" style={{ fontSize: '1.25rem' }}>
            {rupees(total)}
          </span>
        </div>
      </div>

      <p style={{ marginTop: '0.5rem' }}>
        <Illustrative />
      </p>

      {mode === 'sales' ? (
        <Note tone="warn">
          {rupees(valueChainTotals.sumOfSales)} for one table. The wood got counted three
          times — once when it was sold as wood, again inside the price of the table, and
          again inside the shop's price. Adding up sales counts the same work over and over.
        </Note>
      ) : (
        <Note>
          {rupees(valueChainTotals.sumOfValueAdded)} — exactly what the family paid. Each
          participant is credited only with what they <em>added</em>: the carpenter's{' '}
          {rupees(60000)} of shaping and joining, the shop's {rupees(30000)} of storing,
          displaying and selling.
        </Note>
      )}

      <h2>Value added</h2>
      <p>
        That is the whole idea. GDP adds up <strong>value added</strong> — what each producer
        contributes — not the money that changes hands. Inputs that get used up along the way
        are subtracted, so nothing is counted twice.
      </p>
      <p>
        Add the value added of every farm, workshop, shop, building site, school and factory
        in the village and you have the village's GDP. In 2010 that came to about{' '}
        <span className="mono">₹{villageGdp[2010]} lakh</span>. <Illustrative />
      </p>

      <StoryNav />
    </article>
  );
}

/* --- ACT 5 — GDP IS ESTIMATED --------------------------------------------- */

const SIGNAL_CALLOUTS: CalloutItem[] = [
  { id: 's-hub', position: ESTIMATE_HUB, label: 'GDP estimate', emoji: '📊', tone: 'teal', offsetY: 3, keepOnMobile: true },
  { id: 's-farm', position: anchors.farm, label: 'Yields & prices', emoji: '🌾' },
  { id: 's-factory', position: anchors.factory, label: 'Company accounts', emoji: '🏭' },
  { id: 's-government', position: anchors.government, label: 'Government accounts', emoji: '🏫' },
  { id: 's-shop', position: anchors.shop, label: 'Sample surveys', emoji: '🏪' },
  { id: 's-construction', position: anchors.construction, label: 'Material indicators', emoji: '🏗️' },
  { id: 's-delivery', position: anchors.delivery, label: 'Administrative data', emoji: '🧾' },
];

export function ActEstimated() {
  useSceneFlags({ signalsOn: true });

  return (
    <article>
      <p className="eyebrow">Act 5 · How the number gets made</p>
      <h1>“Can someone visit every farm, shop and worker every quarter?”</h1>
      <h2 style={{ color: 'var(--clay)', marginBottom: '1rem' }}>No.</h2>
      <p>
        Not in this village, and certainly not in a country with hundreds of millions of
        workers and tens of millions of businesses — with the quarterly figure due about two
        months after the quarter ends.
      </p>
      <p>So the estimate is assembled from whatever genuinely informative signals exist.</p>

      <FallbackIfNeeded />

      <div className="card" style={{ margin: '1.5rem 0' }}>
        <p className="eyebrow" style={{ marginBottom: '0.75rem' }}>
          What goes in
        </p>
        <ul className="cycle" style={{ margin: 0 }}>
          <li>
            <span className="n" aria-hidden="true">
              1
            </span>
            Observed information — crop measurement, published accounts
          </li>
          <li>
            <span className="n" aria-hidden="true">
              2
            </span>
            Surveys — samples of businesses and of the workforce
          </li>
          <li>
            <span className="n" aria-hidden="true">
              3
            </span>
            Administrative data — tax and regulatory records
          </li>
          <li>
            <span className="n" aria-hidden="true">
              4
            </span>
            Indicators — production, materials, freight, activity
          </li>
          <li>
            <span className="n" aria-hidden="true">
              5
            </span>
            Statistical methods — a framework that combines them consistently
          </li>
        </ul>
        <p style={{ textAlign: 'center', fontSize: '1.4rem', margin: '0.75rem 0 0.25rem' }} aria-hidden="true">
          ↓
        </p>
        <p style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.15rem', margin: 0, color: 'var(--teal)' }}>
          GDP ESTIMATE
        </p>
      </div>

      <h2 className="big-statement">Estimated ≠ invented.</h2>
      <p>
        Every input above is real information about a real economy. What the statistician
        does is combine it — weighting, scaling, filling gaps by documented rules — to
        produce a figure for something too large to observe all at once. That is a different
        thing from making a number up, and also a different thing from counting.
      </p>

      <p className="eyebrow" style={{ marginTop: '1.5rem' }}>
        Every activity is learned about differently — have a look
      </p>
      <SectorExplorer />
      <p style={{ fontSize: '0.85rem', color: 'var(--text-faint)' }}>
        These are broad descriptions of where the information mostly comes from, not
        confidence scores. There is no meaningful single number for "how well measured" an
        activity is.
      </p>

      <Note tone="warn">
        <strong>But there is another problem.</strong> Everything above assumes we know what
        the village is made of. What if the economy changes?
      </Note>

      <WorldCallouts items={SIGNAL_CALLOUTS} />
      <StoryNav nextLabel="Go back to 2010 →" />
    </article>
  );
}
