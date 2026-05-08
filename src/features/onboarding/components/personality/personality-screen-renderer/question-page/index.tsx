import { Link } from "@tanstack/react-router";
import { TeamForgeLogo } from "@/assets/logo";
import type { IpipQuestion } from "@/features/onboarding/data/ipip-questions";
import type { RawAnswers } from "@/features/onboarding/utils/score-calculator";
import { Button } from "@/shared/components/ui/button";

import { QuestionList } from "./question-list";
import { QuestionPageActions } from "./question-page-actions";
import { QuestionPageDots } from "./question-page-dots";
import { QuestionPageHeader } from "./question-page-header";
import { getQuestionPageProgress } from "./question-page-progress";

interface QuestionPageProps {
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
    <div className="mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-xl flex-col px-0 sm:min-h-[calc(100dvh-4rem)] sm:px-0">
      <div className="mb-6 flex items-center gap-3">
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

        <Button
          asChild
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0 rounded-lg p-0 text-white/80 hover:bg-white/5 hover:text-white focus-visible:ring-forge-teal focus-visible:ring-offset-hero-bg"
        >
          <Link to="/" aria-label="Back to TeamForge home">
            <TeamForgeLogo className="size-10" showBackground={false} />
          </Link>
        </Button>
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
        isFinalPage={progress.isFinalPage}
        onNext={onNext}
        onReview={onReview}
      />
    </div>
  );
}
