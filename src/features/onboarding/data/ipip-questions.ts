import { IPIP_QUESTIONS } from "@/features/onboarding/data/ipip-questions/question-pools";
import type {
  Dimension,
  IpipQuestion,
} from "@/features/onboarding/data/ipip-questions.types";

export type { Dimension, IpipQuestion };
export { IPIP_QUESTIONS };

export type TestLength = 30 | 50 | 150;

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
    sublabel: "10 pages · about 2 minutes",
    estimatedMinutes: 2,
    itemsPerDimension: 6,
    questionsPerPage: 3,
  },
  50: {
    label: "Standard",
    sublabel: "17 pages · about 5 minutes",
    estimatedMinutes: 5,
    itemsPerDimension: 10,
    questionsPerPage: 3,
    recommended: true,
  },
  150: {
    label: "Detailed",
    sublabel: "50 pages · about 15 minutes",
    estimatedMinutes: 15,
    itemsPerDimension: 30,
    questionsPerPage: 3,
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
