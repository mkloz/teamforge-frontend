export function formatTrustScore(score: number) {
  const normalized = score > 0 && score <= 1 ? score * 100 : score;
  return `${Math.round(normalized)}%`;
}
