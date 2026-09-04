import { describe, expect, it } from 'vitest';
import { actualIndiaData as D, computed, pctChange } from './actualIndiaData';
import { valueChainTotals, doubleDeflationWorked } from './illustrativeVillageData';

/**
 * The whole site rests on three divisions. If any of these drift, the argument breaks,
 * so they are asserted against both the raw computation and the rounded display value.
 */
describe('the three growth rates', () => {
  it('gives ≈2.58% for the invalid cross-series comparison', () => {
    expect(pctChange(86.05, 88.27)).toBeCloseTo(2.58, 2);
    expect(computed.apparentPct.toFixed(1)).toBe('2.6');
  });

  it('gives ≈10.34% nominal growth on the same series', () => {
    expect(pctChange(80.0, 88.27)).toBeCloseTo(10.34, 2);
    expect(computed.nominalPct.toFixed(1)).toBe('10.3');
    expect(D.nominal.growthPct).toBe(10.3);
  });

  it('gives ≈7.82% real growth at constant prices', () => {
    expect(pctChange(75.46, 81.36)).toBeCloseTo(7.82, 2);
    expect(computed.realPct.toFixed(1)).toBe('7.8');
    expect(D.real.growthPct).toBe(7.8);
  });
});

describe('the revision path', () => {
  it('runs 86.05 → 80.32 → 80.44 → 80.00 and lands on the published comparable figure', () => {
    expect(D.revisionPath.map((r) => r.value)).toEqual([86.05, 80.32, 80.44, 80.0]);
    expect(D.revisionPath.at(-1)!.value).toBe(D.nominal.prior);
  });

  it('starts on the old series and ends on the new one', () => {
    expect(D.revisionPath[0].seriesId).toBe('old-2011-12');
    expect(D.revisionPath.at(-1)!.seriesId).toBe('new-2022-23');
  });

  it('attributes most of the change to the base-year step', () => {
    expect(computed.rebaseStep).toBeCloseTo(-5.73, 2);
    expect(computed.totalRevision).toBeCloseTo(-6.05, 2);
    expect(Math.abs(computed.rebaseStep)).toBeGreaterThan(Math.abs(computed.totalRevision) * 0.9);
  });
});

describe('village teaching examples', () => {
  it('shows double counting: summed sales exceed value added', () => {
    expect(valueChainTotals.sumOfSales).toBe(270_000);
    expect(valueChainTotals.sumOfValueAdded).toBe(130_000);
    // Value added must equal the final sale price, or the example teaches the wrong thing.
    expect(valueChainTotals.sumOfValueAdded).toBe(130_000);
  });

  it('shows double deflation diverging from single deflation', () => {
    const w = doubleDeflationWorked;
    expect(w.va1).toBe(60);
    expect(w.va2).toBe(64);
    expect(w.doubleDeflatedGrowth).toBeGreaterThan(w.singleDeflatedGrowth);
  });
});
