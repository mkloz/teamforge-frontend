import type { Dimension, IpipQuestion } from "../data/ipip-questions";

export type RawAnswers = Record<number, 1 | 2 | 3 | 4 | 5>;

export interface OceanVector {
  O: number; // [-1, 1]
  C: number;
  E: number;
  A: number;
  N: number; // stored as raw neuroticism; display as reversed (stability)
}

export type ScoreConfidence = "none" | "low" | "medium" | "high";

export interface DimensionScoreMeta {
  answerCount: number;
  confidence: ScoreConfidence;
  completionRatio: number;
  questionCount: number;
}

export interface OceanVectorWithMeta extends OceanVector {
  answerCount: number;
  confidence: ScoreConfidence;
  completionRatio: number;
  dimensionMeta: Record<Dimension, DimensionScoreMeta>;
  questionCount: number;
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
  const answerCounts: Record<Dimension, number> = {
    O: 0,
    C: 0,
    E: 0,
    A: 0,
    N: 0,
  };
  const questionCounts: Record<Dimension, number> = {
    O: 0,
    C: 0,
    E: 0,
    A: 0,
    N: 0,
  };

  for (const q of questions) {
    questionCounts[q.dimension]++;

    const raw = getLikertAnswer(answers[q.id]);
    if (raw === null) continue;

    const scored = q.keyed === "+" ? raw : LIKERT_REVERSE_SUM - raw;
    sums[q.dimension] += scored;
    answerCounts[q.dimension]++;
  }

  const vector: OceanVector = {
    O: normalizeScore(sums.O, answerCounts.O),
    C: normalizeScore(sums.C, answerCounts.C),
    E: normalizeScore(sums.E, answerCounts.E),
    A: normalizeScore(sums.A, answerCounts.A),
    N: normalizeScore(sums.N, answerCounts.N),
  };

  const softBoundary: Dimension[] = DIMENSIONS.filter(
    (dimension) => Math.abs(vector[dimension]) < SOFT_BOUNDARY_THRESHOLD,
  );
  const dimensionMeta = buildDimensionMeta(
    questionCounts,
    answerCounts,
    vector,
  );
  const answerCount = sumDimensionCounts(answerCounts);
  const questionCount = questions.length;

  return {
    ...vector,
    answerCount,
    confidence: getOverallConfidence(questionCounts, answerCounts, vector),
    completionRatio: getCompletionRatio(answerCount, questionCount),
    dimensionMeta,
    questionCount,
    softBoundary,
  };
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

function buildDimensionMeta(
  questionCounts: Record<Dimension, number>,
  answerCounts: Record<Dimension, number>,
  vector: OceanVector,
): Record<Dimension, DimensionScoreMeta> {
  return {
    O: buildDimensionScoreMeta("O", questionCounts, answerCounts, vector),
    C: buildDimensionScoreMeta("C", questionCounts, answerCounts, vector),
    E: buildDimensionScoreMeta("E", questionCounts, answerCounts, vector),
    A: buildDimensionScoreMeta("A", questionCounts, answerCounts, vector),
    N: buildDimensionScoreMeta("N", questionCounts, answerCounts, vector),
  };
}

function buildDimensionScoreMeta(
  dimension: Dimension,
  questionCounts: Record<Dimension, number>,
  answerCounts: Record<Dimension, number>,
  vector: OceanVector,
): DimensionScoreMeta {
  const answerCount = answerCounts[dimension];
  const questionCount = questionCounts[dimension];
  const confidenceValue = getDimensionConfidenceValue(
    answerCount,
    questionCount,
    vector[dimension],
  );

  return {
    answerCount,
    confidence: toScoreConfidence(confidenceValue),
    completionRatio: getCompletionRatio(answerCount, questionCount),
    questionCount,
  };
}

function getCompletionRatio(answerCount: number, questionCount: number) {
  if (questionCount <= 0) {
    return 0;
  }

  return Math.round((answerCount / questionCount) * 100) / 100;
}

function getDimensionConfidenceValue(
  answerCount: number,
  questionCount: number,
  score: number,
) {
  if (answerCount === 0 || questionCount === 0) {
    return 0;
  }

  const completion = getCompletionRatio(answerCount, questionCount);
  const boundaryConfidence = getBoundaryConfidence(score);
  const depthConfidence = getAnswerDepthConfidence(answerCount);

  return completion * depthConfidence * (0.65 + boundaryConfidence * 0.35);
}

function getBoundaryConfidence(score: number) {
  const distance = Math.abs(clampVectorScore(score));

  if (distance < SOFT_BOUNDARY_THRESHOLD) {
    return 0.2 + (distance / SOFT_BOUNDARY_THRESHOLD) * 0.3;
  }

  if (distance < SOFT_BOUNDARY_THRESHOLD * 2) {
    return (
      0.5 +
      ((distance - SOFT_BOUNDARY_THRESHOLD) / SOFT_BOUNDARY_THRESHOLD) * 0.3
    );
  }

  return 1;
}

function getOverallConfidence(
  questionCounts: Record<Dimension, number>,
  answerCounts: Record<Dimension, number>,
  vector: OceanVector,
) {
  const confidenceValue =
    DIMENSIONS.reduce(
      (total, dimension) =>
        total +
        getDimensionConfidenceValue(
          answerCounts[dimension],
          questionCounts[dimension],
          vector[dimension],
        ),
      0,
    ) / DIMENSIONS.length;

  return toScoreConfidence(confidenceValue);
}

function getAnswerDepthConfidence(answerCount: number) {
  if (answerCount >= 6) {
    return 1;
  }

  if (answerCount >= 3) {
    return 0.75;
  }

  if (answerCount >= 2) {
    return 0.55;
  }

  return 0.35;
}

function toScoreConfidence(value: number): ScoreConfidence {
  if (value <= 0) {
    return "none";
  }

  if (value >= 0.75) {
    return "high";
  }

  if (value >= 0.45) {
    return "medium";
  }

  return "low";
}

function sumDimensionCounts(counts: Record<Dimension, number>) {
  return DIMENSIONS.reduce((total, dimension) => total + counts[dimension], 0);
}
