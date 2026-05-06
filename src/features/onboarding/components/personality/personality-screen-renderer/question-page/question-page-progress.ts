import type { IpipQuestion } from "@/features/onboarding/data/ipip-questions";
import type { RawAnswers } from "@/features/onboarding/utils/score-calculator";

const ESTIMATED_SECONDS_PER_QUESTION = 5;

interface GetQuestionPageProgressParams {
  answers: RawAnswers;
  pageNumber: number;
  pageQuestions: IpipQuestion[];
  totalPages: number;
}

export function getQuestionPageProgress({
  answers,
  pageNumber,
  pageQuestions,
  totalPages,
}: GetQuestionPageProgressParams) {
  const pagesLeft = totalPages - pageNumber;
  const answeredQuestionIds = new Set(
    pageQuestions
      .filter((question) => answers[question.id] !== undefined)
      .map((question) => question.id),
  );

  return {
    allAnswered: answeredQuestionIds.size === pageQuestions.length,
    answeredCount: answeredQuestionIds.size,
    answeredQuestionIds,
    isFinalPage: pageNumber === totalPages,
    timeLeftLabel:
      pagesLeft > 0
        ? formatTimeLeft(pagesLeft, pageQuestions.length)
        : undefined,
  };
}

function formatTimeLeft(pagesLeft: number, perPage: number): string {
  const questionsLeft = pagesLeft * perPage;
  const secondsLeft = questionsLeft * ESTIMATED_SECONDS_PER_QUESTION;

  if (secondsLeft < 60) {
    return `~${secondsLeft}s left`;
  }

  return `~${Math.ceil(secondsLeft / 60)} min left`;
}
