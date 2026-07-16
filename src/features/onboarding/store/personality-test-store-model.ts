import {
  buildQuestionList,
  IPIP_QUESTIONS,
  type TestLength,
} from "../data/ipip-questions";
import type { PersonalityTestSnapshot } from "./personality-test-store.types";

export const PERSONALITY_TEST_DEFAULT_STATE: PersonalityTestSnapshot = {
  screen: { id: "intro" },
  testLength: 50,
  questionIds: [],
  answers: {},
  previousScreen: null,
  isReviewMode: false,
};

const QUESTION_BY_ID = new Map(
  IPIP_QUESTIONS.map((question) => [question.id, question]),
);

export function buildPersonalityQuestionIds(testLength: TestLength) {
  return buildQuestionList(testLength).map((question) => question.id);
}

export function hydrateQuestions(questionIds: number[]) {
  if (!questionIds.length) {
    return [];
  }

  return questionIds
    .map((questionId) => QUESTION_BY_ID.get(questionId))
    .filter((question) => question !== undefined);
}
