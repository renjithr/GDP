export type FaqItem = { q: string; a: string; tags?: string[] };

/**
 * These deliberately cover the ten questions in the product spec's acceptance test,
 * so a visitor who skims can still leave able to answer them.
 */
export const faq: FaqItem[] = [
  {
    q: 'What is GDP actually trying to measure?',
    a: 'The value of everything newly produced inside a country over a period, counted once. Not sales, not money moving around, not wealth — new value added at each step of production. If you added up every sale, the same table would be counted three times as it moved from timber seller to carpenter to shop.',
  },
  {
    q: 'Why isn’t India’s GDP obtained by counting every transaction?',
    a: 'Because there is no register that sees every transaction. India has hundreds of millions of workers and tens of millions of businesses, most of them small and unincorporated, and a quarterly number has to be produced within two months of the quarter ending. Counting everything would be neither possible nor timely, so the estimate is assembled from the records that do exist plus surveys and indicators.',
  },
  {
    q: 'Why is GDP called an estimate?',
    a: 'Because it is built by combining directly observed information (company filings, government accounts, tax records, crop measurement) with sample surveys and activity indicators, using an agreed statistical framework. Estimated does not mean invented: every part of it is anchored to real information about the economy. It does mean the number carries uncertainty and gets refined as fuller data arrive.',
  },
  {
    q: 'Why can an old GDP estimate change?',
    a: 'Three ordinary reasons. Fuller data arrive for a period that was first estimated from partial information. Better source data or methods replace weaker ones. Or the entire series is recompiled on a new base year, which re-does the benchmarks, coverage, classifications and price measurement together. The past economy does not change; the measurement of it does.',
  },
  {
    q: 'What problem does a base-year revision try to solve?',
    a: 'A GDP series is calibrated against a detailed reference picture of the economy in one benchmark year — what activities exist, how large they are, how they are measured, what data are available. Economies change structure. The longer a base year is in use, the more the reference picture describes an economy that no longer exists. Rebasing redraws that picture using a recent year and the best current data.',
  },
  {
    q: 'Why can some sectors be revised down while others are revised up?',
    a: 'Because the revision is not a single adjustment applied to a total. Each activity is re-estimated with better information. Where the old framework was assuming more activity than newer data support, the estimate falls. Where an activity had grown faster than the old framework could capture, it rises. The headline revision is the net of all those movements — which is also why "rebasing lowers GDP" is not a rule.',
  },
  {
    q: 'Why is ₹86.05 → ₹88.27 lakh crore not the correct growth comparison?',
    a: 'Because the two figures come from different statistical series. ₹86.05 lakh crore was Q1 FY 2025–26 as published in August 2025 on the old 2011–12 base-year series. ₹88.27 lakh crore is Q1 FY 2026–27 on the new 2022–23 series. Dividing one by the other measures the distance between two rulers as well as the growth of the economy. The arithmetic is right; the comparison is not valid for a growth rate.',
  },
  {
    q: 'Where does 10.3% come from?',
    a: 'From comparing like with like at current prices. On the new 2022–23 series, Q1 FY 2025–26 nominal GDP is ₹80.00 lakh crore and Q1 FY 2026–27 is ₹88.27 lakh crore. That is 10.34%, reported as 10.3%.',
  },
  {
    q: 'Where does 7.8% come from?',
    a: 'From the same two quarters measured at constant 2022–23 prices, which strips out the effect of price change: ₹75.46 lakh crore to ₹81.36 lakh crore, or 7.82%, reported as 7.8%. This is "real" growth — the part that reflects more production rather than higher prices. It is not simply nominal growth minus a headline inflation rate; it is a separate estimate built in a constant-price framework.',
  },
  {
    q: 'Does revising GDP prove manipulation — or prove the numbers are right?',
    a: 'Neither. A revision on its own proves only that the estimate changed. Revisions are a normal, documented feature of national accounts everywhere, and every statistical agency publishes them. That is also not a reason to stop asking questions. The useful scrutiny is specific: are the new source data and methods documented, are the changes applied consistently across the series, can independent analysts reproduce the numbers, and how large have past revisions turned out to be?',
  },
  {
    q: 'Is the village based on real Indian data?',
    a: 'No. GDP Village is a teaching model. Every number attached to it is fictional and marked ILLUSTRATIVE EXAMPLE. The India figures are kept strictly separate and each one is traceable to an official MoSPI or PIB release on the Sources page.',
  },
  {
    q: 'Does this site take a political side?',
    a: 'No. It explains what the numbers are and where they come from, so the argument can be had on the facts. Whether the new series is well-executed, well-documented and independently checkable is a legitimate question, and the answer is not settled by this explainer.',
  },
];
