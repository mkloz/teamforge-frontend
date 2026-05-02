import {
  buildQuestionList,
  TEST_LENGTH_CONFIG,
  type IpipQuestion,
  type TestLength,
} from "@/features/onboarding/data/ipip-questions";

export const TEST_LENGTH_OPTIONS: TestLength[] = [30, 50, 150];
export const RESOLUTION_SEGMENTS = [0, 1, 2, 3, 4, 5];

export function getLengthConfig(length: TestLength) {
  return TEST_LENGTH_CONFIG[length];
}

export function countAnsweredQuestions(
  length: TestLength,
  answers: Record<number, number>,
) {
  const questions = buildQuestionList(length);

  return questions.filter(
    (question: IpipQuestion) => answers[question.id] !== undefined,
  ).length;
}

export function getLengthProgress(
  length: TestLength,
  answers: Record<number, number>,
) {
  const answeredCount = countAnsweredQuestions(length, answers);

  return {
    answeredCount,
    isComplete: answeredCount >= length,
    progressPercent: Math.round((answeredCount / length) * 100),
  };
}

export function getResolutionSegmentCount(length: TestLength) {
  if (length === 30) {
    return 2;
  }

  if (length === 50) {
    return 4;
  }

  return 6;
}
