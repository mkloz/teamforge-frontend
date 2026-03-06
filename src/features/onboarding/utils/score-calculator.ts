import { type Dimension, type IpipQuestion } from "../data/ipip-questions";

export type RawAnswers = Record<number, 1 | 2 | 3 | 4 | 5>;

export interface OceanVector {
  O: number; // [-1, 1]
  C: number;
  E: number;
  A: number;
  N: number; // stored as raw neuroticism; display as reversed (stability)
}

export interface OceanVectorWithMeta extends OceanVector {
  /** Dimensions within ±0.167 of zero – letter still assigned but boundary is soft */
  softBoundary: Dimension[];
}

/**
 * Calculates a normalized OCEAN vector from raw Likert answers.
 * Reversed items are negated before summing.
 * Formula: (rawSum - midpoint) / maxDeviation → [-1, 1]
 * For n items: midpoint = n * 3, maxDeviation = n * 2
 */
export function calculateVector(
  questions: IpipQuestion[],
  answers: RawAnswers,
): OceanVectorWithMeta {
  const dims: Dimension[] = ["O", "C", "E", "A", "N"];
  const sums: Record<Dimension, number> = { O: 0, C: 0, E: 0, A: 0, N: 0 };
  const counts: Record<Dimension, number> = { O: 0, C: 0, E: 0, A: 0, N: 0 };

  for (const q of questions) {
    const raw = answers[q.id];
    if (raw === undefined) continue;
    const scored = q.keyed === "+" ? raw : 6 - raw;
    sums[q.dimension] += scored;
    counts[q.dimension]++;
  }

  const normalize = (sum: number, n: number): number => {
    if (n === 0) return 0;
    const midpoint = n * 3;
    const maxDev = n * 2;
    return Math.max(-1, Math.min(1, (sum - midpoint) / maxDev));
  };

  const vector = Object.fromEntries(
    dims.map((dim) => [dim, normalize(sums[dim], counts[dim])]),
  ) as unknown as OceanVector;

  const SOFT_THRESHOLD = 0.167;
  const softBoundary: Dimension[] = dims.filter(
    (d) => Math.abs(vector[d]) < SOFT_THRESHOLD,
  );

  return { ...vector, softBoundary };
}

/** Percentage (0-100) for display in spectrum bars. Stability is N inverted. */
export function toDisplayPercent(vector: OceanVector, dim: Dimension): number {
  const raw = dim === "N" ? -vector.N : vector[dim];
  return Math.round(((raw + 1) / 2) * 100);
}
