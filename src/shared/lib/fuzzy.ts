/** Levenshtein distance for short search tokens. */
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

export type FuzzyMatchKind =
  | "exact"
  | "none"
  | "prefix"
  | "substring"
  | "typo"
  | "word-prefix";

export interface FuzzyMatchResult {
  kind: FuzzyMatchKind;
  query: string;
  score: number;
  target: string;
}

/**
 * Returns true if the search query fuzzy-matches the target string.
 * Exact substring match always wins; fuzzy kicks in for short single-word
 * queries (≥4 chars) with edit distance ≤1 against any word in target.
 */
export function fuzzyMatch(target: string, q: string): boolean {
  return getFuzzyMatchScore(target, q) > 0;
}

export function getFuzzyMatchScore(target: string, q: string): number {
  return getFuzzyMatch(target, q).score;
}

export function getFuzzyMatch(target: string, q: string): FuzzyMatchResult {
  const normalizedTarget = normalizeSearchText(target);
  const query = normalizeSearchText(q);

  if (!normalizedTarget || !query) {
    return buildFuzzyMatchResult("none", normalizedTarget, query);
  }

  if (normalizedTarget === query) {
    return buildFuzzyMatchResult("exact", normalizedTarget, query);
  }

  if (normalizedTarget.startsWith(query)) {
    return buildFuzzyMatchResult("prefix", normalizedTarget, query);
  }

  if (getSearchWords(normalizedTarget).some((word) => word.startsWith(query))) {
    return buildFuzzyMatchResult("word-prefix", normalizedTarget, query);
  }

  if (normalizedTarget.includes(query)) {
    return buildFuzzyMatchResult("substring", normalizedTarget, query);
  }

  if (hasSingleWordTypoMatch(normalizedTarget, query)) {
    return buildFuzzyMatchResult("typo", normalizedTarget, query);
  }

  return buildFuzzyMatchResult("none", normalizedTarget, query);
}

export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFKD")
    .replaceAll(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, " ")
    .trim();
}

function buildFuzzyMatchResult(
  kind: FuzzyMatchKind,
  target: string,
  query: string,
): FuzzyMatchResult {
  return {
    kind,
    query,
    score: getFuzzyMatchKindScore(kind),
    target,
  };
}

function getFuzzyMatchKindScore(kind: FuzzyMatchKind) {
  const scores: Record<FuzzyMatchKind, number> = {
    exact: 100,
    none: 0,
    prefix: 90,
    substring: 72,
    typo: 56,
    "word-prefix": 82,
  };

  return scores[kind];
}

function hasSingleWordTypoMatch(target: string, query: string) {
  // Only do fuzzy typo matching for single-word queries of 4+ chars.
  if (query.includes(" ") || query.length < 4) {
    return false;
  }

  return getSearchWords(target).some(
    (word) => word.length >= query.length - 1 && levenshtein(word, query) <= 1,
  );
}

function getSearchWords(value: string) {
  return value.split(/\s+/).filter(Boolean);
}
