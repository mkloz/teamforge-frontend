/** Levenshtein distance (max checked up to 2 to keep it O(n)) */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = i;
    for (let j = 1; j <= b.length; j++) {
      const val =
        a[i - 1] === b[j - 1]
          ? row[j - 1]
          : 1 + Math.min(row[j - 1], row[j], prev);
      row[j - 1] = prev;
      prev = val;
    }
    row[b.length] = prev;
  }
  return row[b.length];
}

/**
 * Returns true if the search query fuzzy-matches the target string.
 * Exact substring match always wins; fuzzy kicks in for short single-word
 * queries (≥4 chars) with edit distance ≤1 against any word in target.
 */
export function fuzzyMatch(target: string, q: string): boolean {
  const t = target.toLowerCase();
  if (t.includes(q)) return true;
  // Only do fuzzy for single-word queries of 4+ chars
  if (q.includes(" ") || q.length < 4) return false;
  const words = t.split(/[\s\-_/&]+/);
  return words.some((w) => w.length >= q.length - 1 && levenshtein(w, q) <= 1);
}
