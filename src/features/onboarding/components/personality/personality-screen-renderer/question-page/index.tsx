import type { IpipQuestion } from "@/features/onboarding/data/ipip-questions";
import type { RawAnswers } from "@/features/onboarding/lib/personality-answer";

import { QuestionList } from "./question-list";
import { QuestionPageActions } from "./question-page-actions";
import { QuestionPageDots } from "./question-page-dots";
import { QuestionPageHeader } from "./question-page-header";
import { getQuestionPageProgress } from "./question-page-progress";

interface QuestionPageProps {
  finalActionLabel?: string;
  pageQuestions: IpipQuestion[];
  startIndex: number;
  pageNumber: number;
  totalPages: number;
  totalQuestions: number;
  answers: RawAnswers;
  onAnswer: (questionId: number, val: 1 | 2 | 3 | 4 | 5) => void;
  onNext: () => void;
  onReview: () => void;
}

export function QuestionPage({
  finalActionLabel,
  pageQuestions,
  startIndex,
  pageNumber,
  totalPages,
  totalQuestions,
  answers,
  onAnswer,
  onNext,
  onReview,
}: QuestionPageProps) {
  const progress = getQuestionPageProgress({
    answers,
    pageNumber,
    pageQuestions,
    totalPages,
  });

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-xl flex-1 flex-col px-0">
      <div className="mb-6 pr-12 sm:pr-14">
        <div className="min-w-0 flex-1">
          <QuestionPageHeader
            pageNumber={pageNumber}
            totalPages={totalPages}
            timeLeftLabel={progress.timeLeftLabel}
          />
          <QuestionPageDots
            answeredCount={progress.answeredCount}
            answeredQuestionIds={progress.answeredQuestionIds}
            pageQuestions={pageQuestions}
          />
        </div>
      </div>
      <QuestionList
        answers={answers}
        onAnswer={onAnswer}
        pageNumber={pageNumber}
        pageQuestions={pageQuestions}
        startIndex={startIndex}
        totalQuestions={totalQuestions}
      />
      <QuestionPageActions
        allAnswered={progress.allAnswered}
        finalActionLabel={finalActionLabel}
        isFinalPage={progress.isFinalPage}
        onNext={onNext}
        onReview={onReview}
      />
    </div>
  );
}
