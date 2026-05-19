import type { Dimension, IpipQuestion } from "../data/ipip-questions";

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

const DIMENSIONS: Dimension[] = ["O", "C", "E", "A", "N"];
const SOFT_BOUNDARY_THRESHOLD = 0.167;
const MIN_LIKERT_ANSWER = 1;
const MAX_LIKERT_ANSWER = 5;
const LIKERT_REVERSE_SUM = 6;

function normalizeScore(sum: number, n: number): number {
  if (n === 0) return 0;
  const midpoint = n * 3;
  const maxDev = n * 2;
  return clampVectorScore((sum - midpoint) / maxDev);
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
  const sums: Record<Dimension, number> = { O: 0, C: 0, E: 0, A: 0, N: 0 };
  const counts: Record<Dimension, number> = { O: 0, C: 0, E: 0, A: 0, N: 0 };

  for (const q of questions) {
    const raw = getLikertAnswer(answers[q.id]);
    if (raw === null) continue;

    const scored = q.keyed === "+" ? raw : LIKERT_REVERSE_SUM - raw;
    sums[q.dimension] += scored;
    counts[q.dimension]++;
  }

  const vector: OceanVector = {
    O: normalizeScore(sums.O, counts.O),
    C: normalizeScore(sums.C, counts.C),
    E: normalizeScore(sums.E, counts.E),
    A: normalizeScore(sums.A, counts.A),
    N: normalizeScore(sums.N, counts.N),
  };

  const softBoundary: Dimension[] = DIMENSIONS.filter(
    (dimension) => Math.abs(vector[dimension]) < SOFT_BOUNDARY_THRESHOLD,
  );

  return { ...vector, softBoundary };
}

/** Percentage (0-100) for display in spectrum bars. Stability is N inverted. */
export function toDisplayPercent(vector: OceanVector, dim: Dimension): number {
  const raw = clampVectorScore(dim === "N" ? -vector.N : vector[dim]);
  return Math.round(((raw + 1) / 2) * 100);
}

function getLikertAnswer(value: unknown): RawAnswers[number] | null {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    return null;
  }

  switch (value) {
    case MIN_LIKERT_ANSWER:
    case 2:
    case 3:
    case 4:
    case MAX_LIKERT_ANSWER:
      return value;
    default:
      return null;
  }
}

function clampVectorScore(score: number) {
  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.max(-1, Math.min(1, score));
}
