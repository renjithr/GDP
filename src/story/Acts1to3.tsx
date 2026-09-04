import { useState } from 'react';
import { actualIndiaData as D, computed } from '../data/actualIndiaData';
import { GrowthCalculator } from '../components/Calculator';
import { StoryNav } from '../components/Chrome';
import { Note, SeriesPill, StatCard, Thought } from '../components/bits';
import { preloadVillage } from '../components/VillageStage';
import { hashFor } from '../state/routes';

/* --- ACT 1 — THE CLAIM ---------------------------------------------------- */

export function ActClaim() {
  return (
    <article>
      <p className="eyebrow">Q1 FY 2026–27 · Released {D.releaseDate}</p>
      <h1>India grew 7.8%.</h1>
      <h2 style={{ color: 'var(--text-dim)', fontSize: 'clamp(1.2rem, 3vw, 1.75rem)', marginBottom: '1.5rem' }}>
        So why are people calculating 2.6%?
      </h2>

      <div className="cards">
        <StatCard label="Real GDP growth" value="7.8%" sub="At constant 2022–23 prices" accent="var(--teal)" />
        <StatCard label="Nominal GDP growth" value="10.3%" sub="At current prices" accent="var(--teal)" />
        <StatCard label="Apparent comparison" value="≈ 2.6%" sub="Doing the sum a different way" accent="var(--clay)" />
      </div>

      <div className="series-box" data-series="new" style={{ maxWidth: '22rem' }}>
        <span className="quarter">{D.currentQuarter} · Nominal GDP</span>
        <p className="value">₹88.27 lakh crore</p>
        <SeriesPill series="new" />
      </div>

      <Thought emoji="👀">I see a problem…</Thought>

      <p>
        Three numbers, one quarter, and they do not agree. Two of them are official. One of
        them is what a lot of people got when they checked the arithmetic themselves — and
        their arithmetic is not wrong.
      </p>
      <p>
        This is a walk through where each number comes from. It takes about ten minutes, and
        it ends with you being able to judge the argument rather than pick a side of it.
      </p>

      <StoryNav nextLabel="Show me →" onNext={preloadVillage} />
    </article>
  );
}

/* --- ACT 2 — THE PROBLEM -------------------------------------------------- */

export function ActProblem() {
  const [done, setDone] = useState(false);

  return (
    <article>
      <p className="eyebrow">Act 2 · The problem</p>
      <h1>“Wasn’t last year’s GDP ₹86.05 lakh crore?”</h1>
      <p>
        It was. On <strong>29 August 2025</strong>, the same quarter one year earlier — Q1 of
        FY 2025–26 — was published at ₹86.05 lakh crore. So people did the obvious thing.
      </p>

      <div className="compare">
        <div className="series-box" data-series="old">
          <span className="quarter">{D.priorQuarter} · Nominal GDP</span>
          <p className="value">₹86.05 lakh crore</p>
          <SeriesPill series="old" />
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

      <p>Try it yourself. Change the numbers if you like — the calculation is not hiding anything.</p>

      <GrowthCalculator
        from={86.05}
        to={88.27}
        fromLabel="Last year (₹ lakh crore)"
        toLabel="This year (₹ lakh crore)"
        accent="var(--clay)"
        onComplete={() => setDone(true)}
      />

      {done && (
        <>
          <Note tone="warn">
            <strong>{computed.apparentPct.toFixed(2)}% — about 2.6%.</strong> The arithmetic is
            correct. Hold on to that: nothing in the rest of this explainer says the sum is
            wrong.
          </Note>
          <Thought emoji="🤔">So why does the government say 7.8%?</Thought>
        </>
      )}

      <StoryNav />
    </article>
  );
}

/* --- ACT 3 — THE BIGGER SUSPICION ----------------------------------------- */

export function ActSuspicion() {
  const [revealed, setRevealed] = useState(false);

  return (
    <article>
      <p className="eyebrow">Act 3 · It gets stranger</p>
      <h1>There is one more number you should see.</h1>
      <p>
        In the release that reported ₹88.27 lakh crore for this year, the figure printed
        alongside it for the <em>same quarter last year</em> was not ₹86.05 lakh crore.
      </p>

      {!revealed ? (
        <button type="button" className="btn btn-primary" onClick={() => setRevealed(true)}>
          Show me the comparable figure
        </button>
      ) : (
        <>
          <div className="series-box" data-series="new" style={{ maxWidth: '24rem' }}>
            <span className="quarter">{D.priorQuarter} · latest comparable estimate</span>
            <p className="value" style={{ color: 'var(--amber)' }}>
              ₹80.00 lakh crore
            </p>
            <SeriesPill series="new" />
          </div>

          <h2 className="big-statement">Wait.</h2>
          <p style={{ fontSize: '1.15rem' }}>
            <span className="mono">₹86.05</span> became <span className="mono">₹80.00</span>?
          </p>

          <h2 className="big-statement" style={{ color: 'var(--amber)' }}>
            “Did the government reduce last year’s GDP just to show higher growth?”
          </h2>

          <p>
            That is a fair question and it deserves a real answer, not a brush-off. A number
            that moves by ₹6 lakh crore for a quarter that already happened is exactly the
            kind of thing you should want explained.
          </p>

          <Note>
            <strong>Before answering it, we need to understand what a GDP number actually
            is.</strong>{' '}
            Not the definition from a textbook — how the figure gets made. Once you have that,
            the answer to the question above becomes something you can check rather than
            something you have to trust.
          </Note>

          <p>
            So we are going to leave India's numbers for a while and go somewhere much
            smaller, where you can see the whole economy at once.
          </p>
        </>
      )}

      <StoryNav nextLabel="Enter GDP Village →" onNext={preloadVillage} />
      {!revealed && (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-faint)' }}>
          Or <a href={hashFor('village')}>skip ahead to the village</a>.
        </p>
      )}
    </article>
  );
}
