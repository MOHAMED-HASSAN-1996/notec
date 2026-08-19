// Notec matching engine — finds the same event when two people add
// the same link or nearly the same information.

export function normalizeUrl(raw: string): string {
  if (!raw) return "";
  let u = raw.trim().toLowerCase();
  if (!u.includes(".")) return "";
  if (!/^https?:\/\//i.test(u)) u = "https://" + u;
  try {
    const parsed = new URL(u);
    u = parsed.hostname.replace(/^www\./, "") + parsed.pathname;
  } catch {
    return "";
  }
  return u.replace(/\/+$/, "");
}

export function normalizeTitle(t: string): string {
  return t
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function bigrams(t: string): Set<string> {
  const s = t.replace(/\s+/g, "");
  const set = new Set<string>();
  if (s.length === 1) {
    set.add(s);
    return set;
  }
  for (let i = 0; i < s.length - 1; i++) set.add(s.slice(i, i + 2));
  return set;
}

/** Dice coefficient over character bigrams. 0..1 */
export function titleSimilarity(a: string, b: string): number {
  const A = bigrams(normalizeTitle(a));
  const B = bigrams(normalizeTitle(b));
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  A.forEach((x) => {
    if (B.has(x)) inter++;
  });
  return (2 * inter) / (A.size + B.size);
}

export const SIMILAR_THRESHOLD = 0.8;
