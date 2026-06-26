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

const PROGRESSIVE_SCREEN_IDS = new Set<ScreenState["id"]>([
  "questions",
  "intermission",
  "length",
]);
const COMPLETE_PROGRESS_SCREEN_IDS = new Set<ScreenState["id"]>([
  "calculating",
  "results",
]);

function getIntermissionInterval(length: TestLength) {
  return length === 50 ? 6 : 5;
}

function shouldTriggerIntermission(
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

  if (
    shouldShowIntermissionStep({
      currentPage,
      isReviewMode,
      testLength,
      totalPages,
    })
  ) {
    return getQuestionIntermissionStep(currentPage, isFinalPage, testLength);
  }

  if (currentPage < totalPages) {
    return getQuestionStep(currentPage + 1);
  }

  return { type: "complete" } as const;
}

function shouldShowIntermissionStep({
  currentPage,
  isReviewMode,
  testLength,
  totalPages,
}: GetNextQuestionStepParams) {
  return (
    !isReviewMode &&
    (shouldTriggerIntermission(currentPage, testLength, totalPages) ||
      shouldShowFinalIntermission(currentPage, testLength, totalPages))
  );
}

function shouldShowFinalIntermission(
  currentPage: number,
  testLength: TestLength,
  totalPages: number,
) {
  return currentPage === totalPages && testLength < 150;
}

function getQuestionIntermissionStep(
  currentPage: number,
  isFinalPage: boolean,
  testLength: TestLength,
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

function getQuestionStep(currentPage: number) {
  return {
    screen: { id: "questions", currentPage },
    type: "questions",
  } as const;
}

export function getIntermissionContinuationStep({
  nextPageIndex,
  totalPages,
}: GetIntermissionContinuationParams) {
  if (nextPageIndex > totalPages) {
    return { type: "complete" } as const;
  }

  return getQuestionStep(nextPageIndex);
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
  if (PROGRESSIVE_SCREEN_IDS.has(screenId)) {
    return getAnsweredQuestionsRatio(answersCount, totalQuestions);
  }

  if (COMPLETE_PROGRESS_SCREEN_IDS.has(screenId)) {
    return 1;
  }

  return 0;
}

function getAnsweredQuestionsRatio(
  answersCount: number,
  totalQuestions: number,
) {
  return totalQuestions === 0 ? 0 : answersCount / totalQuestions;
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
