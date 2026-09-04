import type { Vec3 } from '../lib/types';

/**
 * The economic activities a visitor can select, in the village and in the DOM fallback.
 * `anchor` is the world position the camera frames and the HTML callout pins to — it must
 * stay in step with src/village/layout.ts.
 */

export type MeasurementBand = 'MORE DIRECTLY OBSERVED' | 'SURVEY-HEAVY' | 'INDICATOR-HEAVY';

export type SectorId =
  | 'farm'
  | 'shop'
  | 'carpenter'
  | 'construction'
  | 'government'
  | 'factory'
  | 'warehouse'
  | 'delivery';

export type Sector = {
  id: SectorId;
  emoji: string;
  label: string;
  /** One line, plain language: what this activity contributes. */
  what: string;
  /** How a statistician mostly learns about it. Bands only — never invented precision. */
  band: MeasurementBand;
  bandWhy: string;
  /** The kinds of information that feed the estimate. Shown as flowing signals in 3D. */
  signals: string[];
  /** Year from which the activity exists in the village at all. */
  appearsIn: number;
  anchor: Vec3;
  /** Camera framing when this sector is selected. */
  camera: { distance: number; yawDeg: number; pitchDeg: number };
  /** Text alternative describing what the 3D shows, for screen readers. */
  sceneDescription: string;
};

export const sectors: Sector[] = [
  {
    id: 'farm',
    emoji: '🌾',
    label: 'Farms',
    what: 'Growing crops — the oldest activity in the village and still a large part of it.',
    band: 'MORE DIRECTLY OBSERVED',
    bandWhy:
      'Cropped area, yields and prices are measured through dedicated agricultural enumeration and price collection, so the estimate leans on measurement of the activity itself.',
    signals: ['Area sown', 'Yield estimates', 'Crop prices', 'Input use'],
    appearsIn: 2010,
    anchor: [-26, 0, -18],
    camera: { distance: 116, yawDeg: -18, pitchDeg: 35 },
    sceneDescription:
      'Green paddy plots west of the village, worked by a few figures, with irrigation channels between them.',
  },
  {
    id: 'shop',
    emoji: '🏪',
    label: 'Small shops',
    what: 'The bazaar row: general store, tea stall, provisions. Many owners, no accounts department.',
    band: 'SURVEY-HEAVY',
    bandWhy:
      'Most of these businesses file little or nothing centrally, so the estimate depends heavily on sample surveys of unincorporated enterprises and of the workforce, scaled up.',
    signals: ['Enterprise surveys', 'Workforce surveys', 'Price data'],
    appearsIn: 2010,
    anchor: [-3, 0, -6],
    camera: { distance: 88, yawDeg: -30, pitchDeg: 32 },
    sceneDescription:
      'A row of small tiled-roof shops with awnings facing the main road, customers standing at the counters.',
  },
  {
    id: 'carpenter',
    emoji: '🪚',
    label: 'Carpenters',
    what: 'Independent workshops turning timber into furniture, one piece at a time.',
    band: 'SURVEY-HEAVY',
    bandWhy:
      'Small unincorporated units are learned about mainly through periodic sample surveys of such enterprises and of workers, rather than from records each workshop files.',
    signals: ['Enterprise surveys', 'Workforce surveys', 'Material inputs'],
    appearsIn: 2010,
    anchor: [15, 0, -25],
    camera: { distance: 104, yawDeg: 24, pitchDeg: 48 },
    sceneDescription:
      'Open-sided workshops north-east of the crossroads with stacked timber, workbenches and finished chairs outside.',
  },
  {
    id: 'construction',
    emoji: '🏗️',
    label: 'Construction',
    what: 'Houses, walls and roads being built — a lot of it by small crews, on and off.',
    band: 'INDICATOR-HEAVY',
    bandWhy:
      'Much of the activity is hard to observe directly, so estimates lean on indicators such as the use of construction materials and related activity measures.',
    signals: ['Material use', 'Activity indicators', 'Workforce surveys'],
    appearsIn: 2010,
    anchor: [36, 0, -10],
    camera: { distance: 92, yawDeg: 34, pitchDeg: 33 },
    sceneDescription:
      'A half-built brick structure with rebar columns, scaffolding, a sand heap and workers laying blocks.',
  },
  {
    id: 'government',
    emoji: '🏫',
    label: 'Public services',
    what: 'The school, the clinic and the panchayat office — services the village does not buy in a market.',
    band: 'MORE DIRECTLY OBSERVED',
    bandWhy:
      'Government activity is compiled largely from budget and accounts documents, which are published records rather than survey estimates.',
    signals: ['Government accounts', 'Budget documents', 'Staffing data'],
    appearsIn: 2010,
    anchor: [-7, 0, 20],
    camera: { distance: 102, yawDeg: -50, pitchDeg: 33 },
    sceneDescription:
      'A long yellow school building with a veranda and a flagpole, a small clinic beside it, children in the yard.',
  },
  {
    id: 'factory',
    emoji: '🏭',
    label: 'Furniture factory',
    what: 'One firm making furniture at scale, with machines, shifts and a payroll.',
    band: 'MORE DIRECTLY OBSERVED',
    bandWhy:
      'A registered factory files accounts and returns, so a large share of what it does is visible in records rather than being inferred.',
    signals: ['Company accounts', 'Industrial statistics', 'Tax records', 'Production indices'],
    appearsIn: 2015,
    anchor: [32, 0, 18],
    camera: { distance: 114, yawDeg: 62, pitchDeg: 31 },
    sceneDescription:
      'A long corrugated-steel plant with a sawtooth roof and a chimney, stacked pallets in the yard, a truck at the gate.',
  },
  {
    id: 'warehouse',
    emoji: '📦',
    label: 'Warehouse',
    what: 'Storage and dispatch — goods pause here on the way to somewhere else.',
    band: 'MORE DIRECTLY OBSERVED',
    bandWhy:
      'Warehousing operated by registered businesses shows up in company accounts and administrative records, though the smaller operators around it do not.',
    signals: ['Company accounts', 'Tax records', 'Freight indicators'],
    appearsIn: 2018,
    anchor: [6, 0, 21],
    camera: { distance: 96, yawDeg: 12, pitchDeg: 32 },
    sceneDescription:
      'A long grey godown with a raised loading bay, cartons stacked outside and a truck reversing in.',
  },
  {
    id: 'delivery',
    emoji: '🛵',
    label: 'Delivery & platforms',
    what: 'Orders placed on a phone, goods carried the last few kilometres by scooter.',
    band: 'INDICATOR-HEAVY',
    bandWhy:
      'The work is spread across platforms, small operators and individual riders, so estimates lean on a mix of business records and activity indicators rather than one clean source.',
    signals: ['Business accounts', 'Administrative data', 'Activity indicators', 'Workforce surveys'],
    appearsIn: 2022,
    anchor: [4, 0, 8],
    camera: { distance: 80, yawDeg: -6, pitchDeg: 30 },
    sceneDescription:
      'A small dispatch kiosk by the crossroads with parked scooters and riders loading insulated boxes.',
  },
];

export const sectorById = (id: SectorId) => sectors.find((s) => s.id === id)!;

export const bandColor: Record<MeasurementBand, string> = {
  'MORE DIRECTLY OBSERVED': 'var(--band-observed)',
  'SURVEY-HEAVY': 'var(--band-survey)',
  'INDICATOR-HEAVY': 'var(--band-indicator)',
};
