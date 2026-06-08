import {
  buildQuestionList,
  type IpipQuestion,
  TEST_LENGTH_CONFIG,
  type TestLength,
} from "@/features/onboarding/data/ipip-questions";

export type LengthSelectorMode = "begin" | "adjust";

export const TEST_LENGTH_OPTIONS: TestLength[] = [30, 50, 150];
export const RESOLUTION_SEGMENTS = [0, 1, 2, 3, 4, 5];

const LENGTH_SELECTOR_CONTENT: Record<
  LengthSelectorMode,
  { eyebrow: string; title: string; description: string }
> = {
  adjust: {
    eyebrow: "Intermission",
    title: "Adjust test depth",
    description:
      "You can increase or decrease the remaining density of your test. Your existing progress will be preserved regardless of your choice.",
  },
  begin: {
    eyebrow: "Test depth",
    title: "Choose your read",
    description:
      "Pick the version that fits your patience today. You can still update it later.",
  },
};

export function getLengthConfig(length: TestLength) {
  return TEST_LENGTH_CONFIG[length];
}

export function getLengthSelectorContent(mode: LengthSelectorMode) {
  return LENGTH_SELECTOR_CONTENT[mode];
}

export function getLengthSelectorActionLabel(
  mode: LengthSelectorMode,
  isSelectedComplete: boolean,
) {
  if (mode === "begin") {
    return "Begin assessment";
  }

  return isSelectedComplete ? "Complete & View Results" : "Confirm & Continue";
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

export function getLengthOptionViewModel(
  length: TestLength,
  answers: Record<number, number>,
) {
  const config = getLengthConfig(length);
  const progress = getLengthProgress(length, answers);

  return {
    answeredCount: progress.answeredCount,
    config,
    isComplete: progress.isComplete,
    isRecommended: Boolean(config.recommended),
    progressPercent: progress.progressPercent,
    resolutionSegmentCount: getResolutionSegmentCount(length),
  };
}
