import {
  buildQuestionList,
  type IpipQuestion,
  type TestLength,
} from "../data/ipip-questions";
import type { ScreenState } from "../store/personality-test-store";
import { calculateVector, type RawAnswers } from "../utils/score-calculator";
import { evaluatePersonalityVector } from "./personality-evaluation";

interface GetNextQuestionStepParams {
  currentPage: number;
  isReviewMode: boolean;
  testLength: TestLength;
  totalPages: number;
}

interface GetIntermissionContinuationParams {
  nextPageIndex: number;
  totalPages: number;
}

export function getIntermissionInterval(length: TestLength) {
  return length === 50 ? 6 : 5;
}

export function shouldTriggerIntermission(
  currentPage: number,
  length: TestLength,
  totalPages: number,
) {
  const interval = getIntermissionInterval(length);
  return currentPage % interval === 0 && currentPage < totalPages;
}

export function getNextQuestionStep({
  currentPage,
  isReviewMode,
  testLength,
  totalPages,
}: GetNextQuestionStepParams) {
  const isFinalPage = currentPage === totalPages;
  const isNotDeep = testLength < 150;

  if (
    !isReviewMode &&
    (shouldTriggerIntermission(currentPage, testLength, totalPages) ||
      (isFinalPage && isNotDeep))
  ) {
    return {
      screen: {
        id: "intermission",
        type: isFinalPage
          ? 99
          : currentPage / getIntermissionInterval(testLength),
        nextPageIndex: currentPage + 1,
      },
      type: "intermission",
    } as const;
  }

  if (currentPage < totalPages) {
    return {
      screen: { id: "questions", currentPage: currentPage + 1 },
      type: "questions",
    } as const;
  }

  return { type: "complete" } as const;
}

export function getIntermissionContinuationStep({
  nextPageIndex,
  totalPages,
}: GetIntermissionContinuationParams) {
  if (nextPageIndex > totalPages) {
    return { type: "complete" } as const;
  }

  return {
    screen: { id: "questions", currentPage: nextPageIndex },
    type: "questions",
  } as const;
}

export function calculatePersonalityResult(
  questions: IpipQuestion[],
  answers: RawAnswers,
) {
  const vector = calculateVector(questions, answers);
  const result = evaluatePersonalityVector(vector);

  return { result, vector };
}

export function calculatePersonalityProgress(
  screenId: ScreenState["id"],
  answersCount: number,
  totalQuestions: number,
) {
  if (
    screenId === "questions" ||
    screenId === "intermission" ||
    screenId === "length"
  ) {
    if (totalQuestions === 0) return 0;
    return answersCount / totalQuestions;
  }

  if (screenId === "calculating" || screenId === "results") {
    return 1;
  }

  return 0;
}

export function resolvePersonalityQuestions(
  questionIds: number[],
  testLength: TestLength,
  hydrateQuestions: (ids: number[]) => IpipQuestion[],
) {
  if (questionIds.length > 0) {
    return hydrateQuestions(questionIds);
  }

  return buildQuestionList(testLength);
}

export function findFirstUnansweredPage(
  testLength: TestLength,
  answers: RawAnswers,
  questionsPerPage: number,
) {
  const activeQuestions = buildQuestionList(testLength);
  const firstUnansweredIndex = activeQuestions.findIndex(
    (question) => answers[question.id] === undefined,
  );

  if (firstUnansweredIndex === -1) {
    return Math.ceil(activeQuestions.length / questionsPerPage);
  }

  return Math.floor(firstUnansweredIndex / questionsPerPage) + 1;
}

export function getQuestionPageSlice(
  questions: IpipQuestion[],
  currentPage: number,
  questionsPerPage: number,
) {
  const pageStart = (currentPage - 1) * questionsPerPage;

  return {
    pageStart,
    pageQuestions: questions.slice(pageStart, pageStart + questionsPerPage),
  };
}

export function countAnsweredQuestions(
  questions: IpipQuestion[],
  answers: RawAnswers,
) {
  return questions.filter((question) => answers[question.id] !== undefined)
    .length;
}

export function getTotalQuestionPages(
  questions: IpipQuestion[],
  questionsPerPage: number,
) {
  return Math.ceil(questions.length / questionsPerPage);
}
