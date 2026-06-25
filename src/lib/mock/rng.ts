/** Deterministic, seedable PRNG (mulberry32) so the dataset is stable across renders/SSR. */
export function makeRng(seed: number) {
  let a = seed >>> 0;
  return function next(): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Rng = () => number;

export const pick = <T>(rng: Rng, arr: readonly T[]): T => arr[Math.floor(rng() * arr.length)];

export const pickMany = <T>(rng: Rng, arr: readonly T[], count: number): T[] => {
  const pool = [...arr];
  const out: T[] = [];
  for (let i = 0; i < count && pool.length; i++) {
    out.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
  }
  return out;
};

export const range = (rng: Rng, min: number, max: number): number =>
  Math.floor(rng() * (max - min + 1)) + min;

export const roundTo = (n: number, step: number) => Math.round(n / step) * step;

export const chance = (rng: Rng, p: number) => rng() < p;

/* ============================================================
   Internetdan real rasmlar (deterministik, API-kalitsiz).
   - cover/photo: loremflickr — tadbir/konsert/to'y mavzusidagi Flickr suratlari,
     `lock` = seed bo'yicha barqaror (har safar bir xil rasm).
   - avatar: pravatar — real yuz suratlari (img 1–70).
   ============================================================ */
function hashSeed(seed: string | number): number {
  const s = String(seed);
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Madaniy xizmatlar marketpleysi uchun mavzuli teglar.
const PHOTO_TAGS = "concert,stage,music,wedding,celebration,dance";

const flickr = (seed: string | number, w: number, h: number) =>
  `https://loremflickr.com/${w}/${h}/${PHOTO_TAGS}?lock=${hashSeed(seed)}`;

export const cover = (seed: string | number) => flickr(seed, 1200, 720);
export const photo = (seed: string | number) => flickr(seed, 800, 600);
// pravatar 70 ta yuz suratiga ega (img 1–70).
export const avatar = (n: number) => `https://i.pravatar.cc/300?img=${(Math.abs(n) % 70) + 1}`;

/** Subtract days from a fixed reference "now" so SSR/CSR agree. */
export const REFERENCE_NOW = new Date("2026-06-16T09:00:00Z").getTime();
export const daysFromNow = (days: number) =>
  new Date(REFERENCE_NOW + days * 86400000).toISOString();
export const isoDate = (days: number) =>
  new Date(REFERENCE_NOW + days * 86400000).toISOString().slice(0, 10);
