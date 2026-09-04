/**
 * FICTIONAL TEACHING DATA for GDP Village.
 *
 * None of this is Indian statistical data. Every value here is rendered in the UI
 * behind an ILLUSTRATIVE EXAMPLE badge (see <Illustrative/>), and the village and the
 * India figures are never shown in the same numeric comparison.
 */

export const ILLUSTRATIVE = 'ILLUSTRATIVE EXAMPLE' as const;

/** Total value added by the whole village, in fictional lakh, at each story beat. */
export const villageGdp = {
  2010: 20,
  2026: 64,
} as const;

/**
 * Act 6 — the stale-picture problem. A measuring framework anchored to 2011–12 keeps
 * assuming the carpenter trade is as big as it was, and has no good handle on an
 * activity that barely existed then.
 */
export const staleEstimates = [
  {
    id: 'carpenter',
    emoji: '🪚',
    label: 'Traditional carpentry',
    oldEstimate: 22,
    updatedEstimate: 17,
    direction: 'down' as const,
    why: 'The old picture still assumed the number and size of independent workshops seen years earlier. Fresher information on these businesses suggested the activity had been over-stated.',
  },
  {
    id: 'delivery',
    emoji: '🛵',
    label: 'Delivery & logistics services',
    oldEstimate: 5,
    updatedEstimate: 6.1,
    direction: 'up' as const,
    why: 'An activity that was small when the old picture was drawn had grown, and better information on it suggested the activity had been under-stated.',
  },
] as const;

/**
 * The value-chain example used to introduce value added. Amounts in rupees.
 * Deliberately small and concrete: a village, not a national accounts table.
 */
export const valueChain = {
  steps: [
    {
      id: 'timber',
      emoji: '🪵',
      actor: 'Timber seller',
      sells: 'Wood to the carpenter',
      salePrice: 40_000,
      boughtIn: 0,
      note: 'Treated here as the start of the chain.',
    },
    {
      id: 'carpenter',
      emoji: '🪚',
      actor: 'Carpenter',
      sells: 'A finished table to the shop',
      salePrice: 100_000,
      boughtIn: 40_000,
      note: 'The wood is an intermediate input — it is used up making the table.',
    },
    {
      id: 'shop',
      emoji: '🏪',
      actor: 'Furniture shop',
      sells: 'The table to a household',
      salePrice: 130_000,
      boughtIn: 100_000,
      note: 'The shop adds display, storage, credit and service.',
    },
  ],
} as const;

export const valueChainTotals = {
  /** What you get if you naively add up every sale in the chain. */
  sumOfSales: valueChain.steps.reduce((t, s) => t + s.salePrice, 0),
  /** What GDP actually counts: each step's own contribution. */
  sumOfValueAdded: valueChain.steps.reduce((t, s) => t + (s.salePrice - s.boughtIn), 0),
};

/**
 * Optional deep dive: why deflating output and inputs separately can give a different
 * answer from deflating value added with a single price index.
 */
export const doubleDeflation = {
  year1: { output: 100, inputs: 40 },
  year2: { output: 110, inputs: 46 },
  priceIndex: { output: 102, inputs: 108 },
};

export const doubleDeflationWorked = (() => {
  const { year1, year2, priceIndex } = doubleDeflation;
  const va1 = year1.output - year1.inputs;
  const va2 = year2.output - year2.inputs;
  const realOutput2 = (year2.output / priceIndex.output) * 100;
  const realInputs2 = (year2.inputs / priceIndex.inputs) * 100;
  const doubleDeflated = realOutput2 - realInputs2;
  const singleDeflated = (va2 / priceIndex.output) * 100;
  return {
    va1,
    va2,
    nominalGrowth: ((va2 - va1) / va1) * 100,
    realOutput2,
    realInputs2,
    doubleDeflated,
    doubleDeflatedGrowth: ((doubleDeflated - va1) / va1) * 100,
    singleDeflated,
    singleDeflatedGrowth: ((singleDeflated - va1) / va1) * 100,
  };
})();

/** Act 7 — the multi-activity business used to explain activity-level information. */
export const furnitureLtd = {
  name: 'Furniture Ltd',
  groupedAs: 'MANUFACTURING',
  parts: [
    { id: 'factory', emoji: '🏭', label: 'Manufacturing', detail: 'Making furniture in the plant.' },
    { id: 'warehouse', emoji: '📦', label: 'Warehousing & logistics', detail: 'Storing and moving finished goods.' },
    { id: 'shop', emoji: '🏪', label: 'Trade', detail: 'Selling directly to customers through its own outlet.' },
  ],
} as const;
