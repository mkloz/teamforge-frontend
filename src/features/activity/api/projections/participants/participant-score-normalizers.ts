export function normalizeTrustScore(score: number) {
  return score > 0 && score <= 1 ? Math.round(score * 100) : Math.round(score);
}

export function normalizeCompatibilityScore(score: number | null) {
  if (score === null) {
    return null;
  }

  return score > 0 && score <= 1 ? Math.round(score * 100) : Math.round(score);
}
