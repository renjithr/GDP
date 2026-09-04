/**
 * OFFICIAL INDIAN STATISTICAL DATA.
 *
 * Everything in this file is published by MoSPI / PIB and is traceable to an entry in
 * `src/data/sources.ts` via its `sourceId`. Nothing invented for the teaching village
 * belongs here — that lives in `illustrativeVillageData.ts` and is always labelled
 * ILLUSTRATIVE in the UI.
 */

export const UNIT = '₹ lakh crore';

/** Formats a lakh-crore figure the way the press notes do. */
export const inr = (v: number, decimals = 2) =>
  `₹${v.toFixed(decimals)} lakh crore`;

/** Percentage change from `from` to `to`. Unrounded — round only at display time. */
export const pctChange = (from: number, to: number) => ((to - from) / from) * 100;

export type SeriesId = 'old-2011-12' | 'new-2022-23';

export const series: Record<SeriesId, { id: SeriesId; label: string; short: string; baseYear: string }> = {
  'old-2011-12': {
    id: 'old-2011-12',
    label: 'Old GDP series (base year 2011–12)',
    short: 'Old 2011–12 series',
    baseYear: '2011–12',
  },
  'new-2022-23': {
    id: 'new-2022-23',
    label: 'New GDP series (base year 2022–23)',
    short: 'New 2022–23 series',
    baseYear: '2022–23',
  },
};

export const actualIndiaData = {
  /** The quarter whose growth is being argued about. */
  currentQuarter: 'Q1 FY 2026–27',
  priorQuarter: 'Q1 FY 2025–26',
  releaseDate: '31 August 2026',

  /** GDP at current prices — "nominal". Both figures are from the new 2022–23 series. */
  nominal: {
    current: 88.27,
    prior: 80.0,
    growthPct: 10.3,
    seriesId: 'new-2022-23' as SeriesId,
    sourceId: 'q1-fy2627-press-note',
  },

  /** GDP at constant (2022–23) prices — "real". */
  real: {
    current: 81.36,
    prior: 75.46,
    growthPct: 7.8,
    seriesId: 'new-2022-23' as SeriesId,
    sourceId: 'q1-fy2627-press-note',
  },

  /**
   * The figure that starts the argument: Q1 FY 2025–26 as first published, on the old
   * 2011–12 series. Comparing this with 88.27 crosses two different series.
   */
  oldSeriesPrior: {
    value: 86.05,
    seriesId: 'old-2011-12' as SeriesId,
    publishedOn: '29 August 2025',
    sourceId: 'q1-fy2526-press-note',
  },

  /**
   * The same quarter — Q1 FY 2025–26 nominal GDP — as re-estimated over four
   * publications. The quarter never changes; the estimate of it does.
   */
  revisionPath: [
    {
      date: '29 August 2025',
      value: 86.05,
      seriesId: 'old-2011-12' as SeriesId,
      label: 'First published',
      why: 'The original estimate for Q1 FY 2025–26, produced on the 2011–12 base-year series.',
      sourceId: 'q1-fy2526-press-note',
    },
    {
      date: '27 February 2026',
      value: 80.32,
      seriesId: 'new-2022-23' as SeriesId,
      label: 'New 2022–23 series',
      why: 'The whole back series was recompiled on the new 2022–23 base year, with updated benchmarks, source data, classifications and methods.',
      sourceId: 'new-series-press-note',
    },
    {
      date: '5 June 2026',
      value: 80.44,
      seriesId: 'new-2022-23' as SeriesId,
      label: 'Provisional estimates for FY 2025–26',
      why: 'Routine updating as fuller annual data for FY 2025–26 became available.',
      sourceId: 'pe-fy2526-press-note',
    },
    {
      date: '31 August 2026',
      value: 80.0,
      seriesId: 'new-2022-23' as SeriesId,
      label: 'Latest comparable estimate',
      why: 'Updated again as the new Producer Price Index and Banking Services Price Index series (base 2022–23) and refreshed administrative data were incorporated.',
      sourceId: 'q1-fy2627-press-note',
    },
  ],

  /** The three numbers the whole argument reduces to. */
  headline: {
    real: { pct: 7.8, from: 75.46, to: 81.36, basis: 'Constant (2022–23) prices, same series' },
    nominal: { pct: 10.3, from: 80.0, to: 88.27, basis: 'Current prices, same series' },
    apparent: { pct: 2.6, from: 86.05, to: 88.27, basis: 'Current prices, but two different series' },
  },
} as const;

/**
 * Recomputed rather than hardcoded, so the displayed percentages can never drift
 * away from the levels they are derived from.
 */
export const computed = {
  apparentPct: pctChange(86.05, 88.27), // ≈ 2.58
  nominalPct: pctChange(80.0, 88.27), // ≈ 10.34
  realPct: pctChange(75.46, 81.36), // ≈ 7.82
  /** How much of Q1 FY 2025–26's re-estimation happened at the base-year change itself. */
  rebaseStep: 80.32 - 86.05, // ≈ -5.73
  totalRevision: 80.0 - 86.05, // ≈ -6.05
};
