import { faq } from '../data/faq';
import { sources } from '../data/sources';
import { actualIndiaData as D } from '../data/actualIndiaData';
import { StoryNav } from '../components/Chrome';

export function FaqPage() {
  return (
    <article>
      <p className="eyebrow">Reference</p>
      <h1>Questions people actually ask</h1>
      <p>
        If you only read one page of this site, read this one — it contains the whole
        argument in short form.
      </p>

      {faq.map((item) => (
        <details className="deep-dive" key={item.q}>
          <summary>{item.q}</summary>
          <p style={{ marginBottom: 0 }}>{item.a}</p>
        </details>
      ))}

      <div className="story-nav">
        <a className="btn btn-ghost" href="#/sources">
          Sources
        </a>
        <a className="btn btn-primary" href="#/">
          Start the walkthrough
        </a>
      </div>
    </article>
  );
}

export function SourcesPage() {
  return (
    <article>
      <p className="eyebrow">Reference</p>
      <h1>Sources</h1>
      <p>
        Every official figure on this site comes from a published MoSPI or PIB document.
        Nothing about India is estimated, adjusted or interpolated here.
      </p>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <p className="eyebrow" style={{ marginBottom: '0.6rem' }}>
          The numbers used
        </p>
        <div className="table-wrap" style={{ margin: 0 }}>
          <table>
            <thead>
              <tr>
                <th scope="col">Figure</th>
                <th scope="col">Value</th>
                <th scope="col">Series</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{D.currentQuarter} nominal GDP</td>
                <td className="num">₹88.27 lakh crore</td>
                <td>2022–23</td>
              </tr>
              <tr>
                <td>{D.priorQuarter} nominal GDP (comparable)</td>
                <td className="num">₹80.00 lakh crore</td>
                <td>2022–23</td>
              </tr>
              <tr>
                <td>{D.currentQuarter} real GDP</td>
                <td className="num">₹81.36 lakh crore</td>
                <td>2022–23 constant prices</td>
              </tr>
              <tr>
                <td>{D.priorQuarter} real GDP (comparable)</td>
                <td className="num">₹75.46 lakh crore</td>
                <td>2022–23 constant prices</td>
              </tr>
              <tr>
                <td>{D.priorQuarter} nominal GDP as first published</td>
                <td className="num">₹86.05 lakh crore</td>
                <td>2011–12</td>
              </tr>
              <tr>
                <td>Revision path for {D.priorQuarter}</td>
                <td className="num">86.05 → 80.32 → 80.44 → 80.00</td>
                <td>old → new</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {sources.map((s) => (
        <div className="source-item" key={s.id}>
          <h3>
            <a href={s.url} target="_blank" rel="noopener noreferrer">
              {s.title}
            </a>
          </h3>
          <p className="source-meta">
            {s.publisher} · {s.date}
          </p>
          <p className="stat-label" style={{ marginBottom: '0.2rem' }}>
            Used for
          </p>
          <ul>
            {s.supports.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          {s.note && <p className="source-note">{s.note}</p>}
        </div>
      ))}

      <h2 style={{ marginTop: '2rem' }}>About GDP Village’s own numbers</h2>
      <p>
        The village is fictional. Its GDP, its carpenters' output, the delivery figures and
        the double-deflation worked example are all invented for teaching and are labelled{' '}
        <span className="pill pill-illustrative">✎ ILLUSTRATIVE EXAMPLE</span> wherever they
        appear. They are never presented as Indian statistical data, and the two are kept in
        separate data modules in the source code so they cannot be mixed up.
      </p>
      <p>
        The village's visual design is an original low-poly interpretation of a South Indian
        village, built procedurally in the browser. It is not a depiction of any real place.
      </p>

      <StoryNav />
      <div className="story-nav">
        <a className="btn btn-ghost" href="#/faq">
          FAQ
        </a>
        <a className="btn btn-primary" href="#/">
          Start the walkthrough
        </a>
      </div>
    </article>
  );
}
