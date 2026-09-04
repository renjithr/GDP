export type BaseYearChange = {
  /** Revision number as conventionally counted; the first published estimates are "—". */
  n: string;
  from: string;
  to: string;
  introduced: string;
  /** Honest statement of how precisely this date is known. */
  precision: 'day' | 'year';
  note?: string;
};

/**
 * India's national-accounts base years.
 *
 * Publication conventions were not uniform across these decades. Recent changes were
 * announced through a dated press release; older ones were introduced through National
 * Accounts Statistics volumes and committee reports, so those entries carry a year
 * rather than a date. `precision` drives how the UI presents each row — the table does
 * not pretend a 1967 revision is documented the way a 2026 one is.
 */
export const baseYearHistory: BaseYearChange[] = [
  {
    n: '—',
    from: 'Initial estimates',
    to: '1948–49',
    introduced: '1956',
    precision: 'year',
    note: 'The first official national income estimates for independent India were published in 1956, following the National Income Committee’s work.',
  },
  { n: '1', from: '1948–49', to: '1960–61', introduced: '1967', precision: 'year' },
  { n: '2', from: '1960–61', to: '1970–71', introduced: '1978', precision: 'year' },
  { n: '3', from: '1970–71', to: '1980–81', introduced: '1988', precision: 'year' },
  { n: '4', from: '1980–81', to: '1993–94', introduced: '1999', precision: 'year' },
  { n: '5', from: '1993–94', to: '1999–2000', introduced: '2006', precision: 'year' },
  { n: '6', from: '1999–2000', to: '2004–05', introduced: '2010', precision: 'year' },
  {
    n: '7',
    from: '2004–05',
    to: '2011–12',
    introduced: '30 January 2015',
    precision: 'day',
    note: 'Released with a shift towards using corporate filings (MCA-21) and other administrative data more extensively.',
  },
  {
    n: '8',
    from: '2011–12',
    to: '2022–23',
    introduced: '27 February 2026',
    precision: 'day',
    note: 'FY 2022–23 was chosen as a recent post-pandemic normal year with comprehensive data across sectors. This is the revision behind the numbers on this site.',
  },
];

/** Roughly how long each base year stayed in use, for the "the picture ages" point. */
export const yearsBetweenRevisions = [11, 11, 10, 11, 7, 4, 5, 11];
