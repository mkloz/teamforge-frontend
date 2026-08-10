import { IPIP_QUESTIONS } from "@/features/onboarding/data/ipip-questions/question-pools";
import type {
  Dimension,
  IpipQuestion,
} from "@/features/onboarding/data/ipip-questions.types";

export type { Dimension, IpipQuestion };
export { IPIP_QUESTIONS };

export type TestLength = 30 | 50 | 150;

export const STARTER_QUESTION_IDS = [
  1, 31, 61, 91, 121, 3, 33, 63, 93, 122,
] as const;
export const STARTER_MANIFEST_VERSION = "FINDAFEW_STARTER_10_V1" as const;
export const STARTER_MANIFEST_HASH =
  "c97863821ba78e46b64a8ccf85789a53cff66ef0bf595c148472e0a2d8ea3d32" as const;

export const TEST_LENGTH_CONFIG: Record<
  TestLength,
  {
    label: string;
    sublabel: string;
    estimatedMinutes: number;
    itemsPerDimension: number;
    questionsPerPage: number;
    recommended?: boolean;
  }
> = {
  30: {
    label: "Quick",
    sublabel: "6 short pages · about 2 minutes",
    estimatedMinutes: 2,
    itemsPerDimension: 6,
    questionsPerPage: 5,
    recommended: true,
  },
  50: {
    label: "Standard",
    sublabel: "10 short pages · about 5 minutes",
    estimatedMinutes: 5,
    itemsPerDimension: 10,
    questionsPerPage: 5,
  },
  150: {
    label: "Detailed",
    sublabel: "30 pages · about 15 minutes",
    estimatedMinutes: 15,
    itemsPerDimension: 30,
    questionsPerPage: 5,
  },
};

/**
 * Build an interleaved question list for a given test length.
 * Cycles O → C → E → A → N, drawing evenly from each dimension.
 */
export function buildQuestionList(length: TestLength): IpipQuestion[] {
  const { itemsPerDimension } = TEST_LENGTH_CONFIG[length];
  const dimensions: Dimension[] = ["O", "C", "E", "A", "N"];
  const pools: Record<Dimension, IpipQuestion[]> = {
    O: IPIP_QUESTIONS.filter((q) => q.dimension === "O").slice(
      0,
      itemsPerDimension,
    ),
    C: IPIP_QUESTIONS.filter((q) => q.dimension === "C").slice(
      0,
      itemsPerDimension,
    ),
    E: IPIP_QUESTIONS.filter((q) => q.dimension === "E").slice(
      0,
      itemsPerDimension,
    ),
    A: IPIP_QUESTIONS.filter((q) => q.dimension === "A").slice(
      0,
      itemsPerDimension,
    ),
    N: IPIP_QUESTIONS.filter((q) => q.dimension === "N").slice(
      0,
      itemsPerDimension,
    ),
  };

  const result: IpipQuestion[] = [];
  for (let i = 0; i < itemsPerDimension; i++) {
    for (const dim of dimensions) {
      result.push(pools[dim][i]);
    }
  }
  return result;
}

export function buildStarterFirstQuestionList(
  length: TestLength,
): IpipQuestion[] {
  const questions = buildQuestionList(length);

  if (length !== 30) return questions;

  const byId = new Map(questions.map((question) => [question.id, question]));
  const starter = STARTER_QUESTION_IDS.map((id) => byId.get(id)).filter(
    (question): question is IpipQuestion => question !== undefined,
  );
  const starterIds = new Set<number>(STARTER_QUESTION_IDS);

  return [
    ...starter,
    ...questions.filter((question) => !starterIds.has(question.id)),
  ];
}
