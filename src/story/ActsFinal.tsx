import { useEffect, useState } from 'react';
import { actualIndiaData as D, computed, inr } from '../data/actualIndiaData';
import { baseYearHistory } from '../data/baseYearHistory';
import { GrowthCalculator } from '../components/Calculator';
import { StoryNav } from '../components/Chrome';
import { WorldCallouts, type CalloutItem } from '../components/Callouts';
import { NumberFlow, Note, SeriesPill, StatCard } from '../components/bits';
import { anchors } from '../village/layout';
import { useIsMobile, usePrefersReducedMotion } from '../lib/hooks';
import { useStore } from '../state/store';
import { useSceneFlags } from './hooks';

/* --- ACT 9 — THE ACTUAL 2025 REVISION SEQUENCE ---------------------------- */

export function ActRevisions() {
  const reduced = usePrefersReducedMotion();
  const [step, setStep] = useState(reduced ? D.revisionPath.length - 1 : 0);

  useEffect(() => {
    if (reduced || step >= D.revisionPath.length - 1) return;
    const t = window.setTimeout(() => setStep((s) => s + 1), 2200);
    return () => window.clearTimeout(t);
  }, [step, reduced]);

  return (
    <article>
      <p className="eyebrow">Act 9 · Back to India</p>
      <h1>One quarter, four estimates.</h1>
      <p>
        We are going to hold the quarter completely still. Everything below is{' '}
        <strong>{D.priorQuarter}</strong> — April to June 2025 — nominal GDP. Only the
        estimate of it changes.
      </p>

      <div className="revision">
        {D.revisionPath.map((r, i) => (
          <div className="revision-row" key={r.date} data-shown={i <= step} data-current={i === step}>
            <div>
              <p className="revision-date">{r.date}</p>
              <SeriesPill series={r.seriesId === 'old-2011-12' ? 'old' : 'new'} />
            </div>
            <div>
              <p className="revision-value">{i <= step ? inr(r.value) : '—'}</p>
              <p className="revision-why">
                <strong>{r.label}.</strong> {r.why}
              </p>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() => setStep(0)}
        disabled={step === 0}
      >
        ↺ Replay
      </button>

      <h2 className="big-statement">Same quarter. Different — updated — estimate.</h2>
      <p>
        The economy did not travel backwards. April to June 2025 happened exactly once and is
        not going to happen differently. What changed is our measurement of it: first because
        the whole series was recompiled on a new base year, then twice more as fuller annual
        data and new price indices arrived.
      </p>
      <Note>
        The single biggest step —{' '}
        <span className="mono">{computed.rebaseStep.toFixed(2)} lakh crore</span> of the total{' '}
        <span className="mono">{computed.totalRevision.toFixed(2)}</span> — happened at the
        base-year change itself, which is exactly what Act 8 was about. Every figure here is
        traceable: see <a href="#/sources">Sources</a>.
      </Note>

      <StoryNav />
    </article>
  );
}

/* --- ACT 10 — REVISIT 2.6% ------------------------------------------------ */

export function ActAha() {
  const [switched, setSwitched] = useState(false);

  return (
    <article>
      <p className="eyebrow">Act 10 · The comparison, fixed</p>
      <h1>Now put the right two numbers together.</h1>

      <div className="compare">
        <div className="series-box" data-series={switched ? 'new' : 'old'}>
          <span className="quarter">{D.priorQuarter} · Nominal GDP</span>
          <p className="value" style={{ color: switched ? 'var(--teal)' : 'var(--clay)' }}>
            <NumberFlow value={switched ? 80.0 : 86.05} format={(v) => `₹${v.toFixed(2)}`} /> lakh crore
          </p>
          <SeriesPill series={switched ? 'new' : 'old'} />
        </div>
        <span className="arrow" aria-hidden="true">
          →
        </span>
        <div className="series-box" data-series="new">
          <span className="quarter">{D.currentQuarter} · Nominal GDP</span>
          <p className="value">₹88.27 lakh crore</p>
          <SeriesPill series="new" />
        </div>
      </div>

      {!switched ? (
        <>
          <Note tone="warn">
            <strong>⚠ Different series.</strong> ₹86.05 → ₹88.27 gives{' '}
            {computed.apparentPct.toFixed(2)}%, and that is arithmetically correct. But the
            left-hand number was produced by the old 2011–12 framework and the right-hand one
            by the new 2022–23 framework. A growth rate needs both ends measured the same way.
          </Note>
          <button type="button" className="btn btn-primary" onClick={() => setSwitched(true)}>
            Use the same series for both →
          </button>
        </>
      ) : (
        <>
          <p>
            Both ends now come from the 2022–23 series. Same framework, same methods, same
            price basis. Now the division means something.
          </p>
          <GrowthCalculator
            from={80.0}
            to={88.27}
            fromLabel={`${D.priorQuarter} (₹ lakh crore)`}
            toLabel={`${D.currentQuarter} (₹ lakh crore)`}
            accent="var(--teal)"
            editable={false}
          />
          <div className="cards">
            <StatCard
              label="Nominal GDP growth"
              value="10.3%"
              sub={`${inr(80.0)} → ${inr(88.27)}, both on the new series`}
              accent="var(--teal)"
            />
          </div>
        </>
      )}

      <StoryNav />
    </article>
  );
}

/* --- ACT 11 — WHY 7.8%? --------------------------------------------------- */

export function ActNominalVsReal() {
  const mobile = useIsMobile();
  const setMode = useStore((s) => s.setMode);
  const setPose = useStore((s) => s.setPose);
  const set3dFlags = useStore((s) => s.set3dFlags);
  const [atFactory, setAtFactory] = useState(false);

  useEffect(() => {
    return () => {
      set3dFlags({ flowsOn: false });
    };
  }, [set3dFlags]);

  const goToFactory = () => {
    setAtFactory(true);
    setMode('stage');
    setPose('factory');
    set3dFlags({ flowsOn: true });
  };
  const backToNumbers = () => {
    setAtFactory(false);
    setMode('ambient');
    set3dFlags({ flowsOn: false });
  };

  return (
    <article>
      <p className="eyebrow">Act 11 · Nominal vs real</p>
      <h1>“Okay, 10.3%. Then why does everyone say 7.8%?”</h1>
      <h2 className="big-statement" style={{ color: 'var(--amber)', marginTop: 0 }}>
        Prices.
      </h2>

      <p>
        The 10.3% figure is measured in current rupees. If every single thing in the economy
        had been produced in exactly the same quantity as last year but sold for more money,
        that number would still have gone up. It answers "how much bigger is the money
        value?" — not "how much more was actually produced?"
      </p>

      <div className="cards">
        <StatCard
          label="Nominal GDP · current prices"
          value="10.3%"
          sub={`${inr(D.nominal.prior)} → ${inr(D.nominal.current)}`}
          accent="var(--amber)"
        />
        <StatCard
          label="Real GDP · constant 2022–23 prices"
          value="7.8%"
          sub={`${inr(D.real.prior)} → ${inr(D.real.current)}`}
          accent="var(--teal)"
        />
      </div>

      <p>
        Real GDP is a separate estimate, built in a constant-price framework: quantities and
        values are expressed in the prices of the base year so that a change in the figure
        reflects a change in production rather than a change in price levels.
      </p>

      <Note tone="warn">
        <strong>A trap worth avoiding.</strong> Real growth is <em>not</em> nominal growth
        minus a headline inflation rate. 10.3 − 7.8 = 2.5 is not "inflation". The gap between
        the two is an implicit deflator — a result that falls out of the two estimates, built
        industry by industry from many different price indices. It is not an input you can
        subtract, and it does not correspond to CPI or WPI.
      </Note>

      {!mobile &&
        (!atFactory ? (
          <button type="button" className="btn btn-ghost" onClick={goToFactory}>
            For the curious: see this at the factory →
          </button>
        ) : (
          <>
            <h2>Output and inputs are separate things</h2>
            <p>
              In the village, watch the factory. Timber goes in. Furniture comes out. Those two
              streams have their own prices, and those prices do not have to move together.
            </p>
            <p>
              That is why deflating output and inputs with their own price indices — double
              deflation — can give a different measure of real value added than deflating the
              value added with one index. India's 2022–23 series adopted double deflation, and
              it is one of the reasons real growth in the new series is not a simple
              re-scaling of the old one. Worked example in{' '}
              <a href="#/what-changed">what changed</a>.
            </p>
            <button type="button" className="btn btn-ghost btn-sm" onClick={backToNumbers}>
              ← Back to the numbers
            </button>
            <WorldCallouts
              items={
                [
                  { id: 'ff-in', position: [18, 0, 25], label: 'Inputs in — timber', emoji: '🪵', tone: 'clay', offsetY: 6 },
                  { id: 'ff-out', position: [28, 0, 2], label: 'Output out — furniture', emoji: '🪑', tone: 'teal', offsetY: 6 },
                  { id: 'ff-plant', position: anchors.factory, label: 'Value added = output − inputs', emoji: '🏭', offsetY: 14, keepOnMobile: true },
                ] satisfies CalloutItem[]
              }
            />
          </>
        ))}

      <StoryNav />
    </article>
  );
}

/* --- ACT 12 — DOES REBASING SOLVE GDP FOREVER? ---------------------------- */

const CYCLE = [
  'The economy changes',
  'The reference picture ages',
  'Better data become available',
  'The statistical framework is reviewed',
  'Past estimates may change',
  'The economy changes again',
];

export function ActForever() {
  const mobile = useIsMobile();
  useSceneFlags({ futureOn: !mobile });

  return (
    <article>
      <p className="eyebrow">Act 12 · Is that it, then?</p>
      <h1>“Is the new system perfect forever?”</h1>
      <h2 className="big-statement" style={{ color: 'var(--clay)', marginTop: 0 }}>
        No.
      </h2>
      {mobile ? (
        <p>
          New activities will emerge — whatever the equivalent of "delivery riders" turns
          out to be in 2035. The 2022–23 picture describes the economy as it is now, which
          means it starts ageing immediately.
        </p>
      ) : (
        <p>
          Look at the village again. Those faint outlines are activities that do not exist yet
          — whatever the equivalent of "delivery riders" turns out to be in 2035. The 2022–23
          picture describes the village as it is now, which means it starts ageing immediately.
        </p>
      )}

      <ol className="cycle">
        {CYCLE.map((item, i) => (
          <li key={item}>
            <span className="n" aria-hidden="true">
              {i === CYCLE.length - 1 ? '↻' : i + 1}
            </span>
            {item}
          </li>
        ))}
      </ol>

      <p>
        Better measurement does not remove the need for future revisions — it is what
        produces them. Every statistical agency in the world runs this loop. What makes the
        loop trustworthy is not that the numbers stop moving; it is that each move is
        documented, explained and checkable.
      </p>

      {!mobile && (
        <WorldCallouts
          items={[{ id: 'fut', position: anchors.centre, label: 'Whatever comes next', emoji: '❓', offsetY: 26 }]}
        />
      )}
      <StoryNav />
    </article>
  );
}

/* --- INDIA'S BASE-YEAR HISTORY -------------------------------------------- */

export function ActHistory() {
  return (
    <article>
      <p className="eyebrow">Reference · India</p>
      <h1>This has happened eight times before.</h1>
      <p>
        Rebasing is not new and not unusual. India has changed the base year of its national
        accounts repeatedly since the first official estimates.
      </p>

      <div className="table-wrap">
        <table>
          <caption className="visually-hidden">
            India's national accounts base years and when each was introduced
          </caption>
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Base year</th>
              <th scope="col">Introduced</th>
            </tr>
          </thead>
          <tbody>
            {baseYearHistory.map((r) => (
              <tr key={r.to} data-highlight={r.to === '2022–23'}>
                <td className="num">{r.n}</td>
                <td>
                  {r.from} <span aria-hidden="true">→</span> <strong>{r.to}</strong>
                  {r.note && (
                    <>
                      <br />
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-faint)' }}>{r.note}</span>
                    </>
                  )}
                </td>
                <td className="num">
                  {r.introduced}
                  {r.precision === 'year' && (
                    <>
                      <br />
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>year only</span>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Note>
        <strong>About these dates.</strong> Publication conventions were not uniform across
        these decades. Recent base-year changes were announced in a dated press release;
        older ones were introduced through National Accounts Statistics volumes and committee
        reports, so those rows carry a year rather than a day. The table says which is which
        rather than implying a precision that does not exist. Sources are listed on the{' '}
        <a href="#/sources">Sources</a> page.
      </Note>

      <p>
        The gap between revisions has ranged from about four years to about eleven. The
        2011–12 series ran for eleven years — a period that included demonetisation, GST, a
        pandemic and the arrival of platform work.
      </p>

      <StoryNav />
    </article>
  );
}

/* --- FINAL ANSWER --------------------------------------------------------- */

export function ActAnswer() {
  return (
    <article>
      <p className="eyebrow">The answer</p>
      <h1>Three numbers, finally sorted out.</h1>

      <div className="cards">
        <StatCard
          label="≈ 2.6%"
          value="Not a growth rate"
          sub={`${inr(86.05)} → ${inr(88.27)}`}
          accent="var(--clay)"
        />
        <StatCard label="10.3%" value="Nominal" sub={`${inr(80.0)} → ${inr(88.27)}`} accent="var(--amber)" />
        <StatCard label="7.8%" value="Real" sub={`${inr(75.46)} → ${inr(81.36)}`} accent="var(--teal)" />
      </div>

      <h2>≈ 2.6%</h2>
      <p>
        <strong>Mathematics: fine. Comparison: not valid as a growth rate.</strong> It puts a
        level from the old 2011–12 series next to a level from the new 2022–23 series. It
        measures the distance between two rulers as much as the growth of the economy.
      </p>

      <h2>10.3%</h2>
      <p>
        <strong>Nominal GDP growth.</strong> {inr(80.0)} → {inr(88.27)}, both from the same
        latest series, both at current prices. This is how much the money value of production
        grew.
      </p>

      <h2>7.8%</h2>
      <p>
        <strong>Real GDP growth.</strong> {inr(75.46)} → {inr(81.36)}, both in the same
        constant-price framework. This is the headline figure, and it is the one that tries to
        answer "was more produced?"
      </p>

      <Note>
        “2.6% is not an alternative measurement of India's 7.8% real GDP growth, because it
        compares GDP levels from two different statistical series.”
      </Note>

      <h2 style={{ marginTop: '2rem' }}>What you should ask instead</h2>
      <p>
        Concluding that the 2.6% comparison is invalid is not the same as concluding that
        everything is fine. It moves the argument to better ground. These are the questions
        that actually bear on whether the new numbers deserve confidence:
      </p>
      <ol className="cycle">
        <li>
          <span className="n" aria-hidden="true">
            1
          </span>
          Why did individual estimates change, sector by sector?
        </li>
        <li>
          <span className="n" aria-hidden="true">
            2
          </span>
          Does the new series measurably improve measurement, and how would we know?
        </li>
        <li>
          <span className="n" aria-hidden="true">
            3
          </span>
          Are the source data transparent enough for someone outside to check?
        </li>
        <li>
          <span className="n" aria-hidden="true">
            4
          </span>
          Are the assumptions and methodology documented and defensible?
        </li>
        <li>
          <span className="n" aria-hidden="true">
            5
          </span>
          How large are future revisions likely to be?
        </li>
      </ol>
      <p>
        Those are answerable questions with public documents attached to them. This explainer
        deliberately does not answer them for you — it gets you to the point where you can.
      </p>

      <div className="story-nav">
        <a className="btn btn-ghost" href="#/sources">
          Read the sources
        </a>
        <a className="btn btn-ghost" href="#/faq">
          FAQ
        </a>
        <a className="btn btn-primary" href="#/">
          Start again
        </a>
      </div>
    </article>
  );
}
