/** Display helpers. Rounding happens here and nowhere else. */

export const pct = (v: number, decimals = 1) => `${v.toFixed(decimals)}%`;

export const lakhCrore = (v: number, decimals = 2) => `₹${v.toFixed(decimals)}`;

export const rupees = (v: number) =>
  `₹${v.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

/** Fictional village amounts are always in "lakh" and always carry the unit. */
export const villageLakh = (v: number) => `₹${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)} lakh`;

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const inverseLerp = (a: number, b: number, v: number) => (b === a ? 0 : (v - a) / (b - a));

export const smoothstep = (t: number) => {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
};

/** Frame-rate independent exponential approach. `lambda` is roughly "speed". */
export const damp = (current: number, target: number, lambda: number, dt: number) =>
  lerp(current, target, 1 - Math.exp(-lambda * dt));
