/**
 * Village palette, drawn from the reference art: warm ochre earth roads, terracotta
 * tile roofs, whitewashed and pastel walls, paddy green, corrugated steel for anything
 * industrial. Flat colours only — the whole village ships with zero image textures.
 */
export const C = {
  sky: '#cfe2ec',
  haze: '#d9e6ec',

  grass: '#93b25e',
  grassDry: '#a8ab62',
  paddy: '#5d9433',
  paddyYoung: '#7fbd4c',
  soil: '#ad875a',

  road: '#c8a06a',
  roadEdge: '#b98f5c',
  path: '#d5b586',

  roofTile: '#b4552f',
  roofTileDark: '#96432a',
  roofThatch: '#c8a86a',

  wall: ['#efe4ce', '#c3d5dc', '#e6c6bf', '#d3dfc0', '#ecd6a4', '#e8e0d2'],
  wallShade: '#d8cbb4',

  metal: '#8fa3ae',
  metalDark: '#6f838e',
  metalWall: '#b3bec4',
  concrete: '#cdc5b6',
  brick: '#b0603c',
  rebar: '#8d8d84',

  timber: '#c08d4f',
  timberDark: '#8d6337',

  trunk: '#7a5a3a',
  crown: '#517f39',
  crownAlt: '#628f42',
  crownDeep: '#3f6c31',
  palm: '#57904a',

  water: '#79b3c6',

  busBody: '#eae1cd',
  busStripe: '#2f6ea8',
  autoYellow: '#e2b83c',
  autoGreen: '#3d7a49',
  truck: '#3d7f8c',
  truckAlt: '#c1663a',
  scooter: '#3f8f5a',
  deliveryBox: '#df7139',

  people: ['#d9534f', '#3f7fbf', '#e0a13a', '#5fa877', '#a76fb0', '#e07a5f', '#4f9aa8'],

  ghost: '#4aa3e0',
  gridOld: '#c05a1e',
  gridNew: '#0e8f72',
  highlight: '#ffd166',
} as const;

export const SUN_DIRECTION: [number, number, number] = [38, 46, 22];
