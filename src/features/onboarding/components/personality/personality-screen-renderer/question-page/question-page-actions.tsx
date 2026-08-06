import { ArrowRight, RotateCcw } from "lucide-react";

import { Button } from "@/shared/components/ui/button";

interface QuestionPageActionsProps {
  allAnswered: boolean;
  finalActionLabel?: string;
  isFinalPage: boolean;
  onNext: () => void;
  onReview: () => void;
}

export function QuestionPageActions({
  allAnswered,
  finalActionLabel = "See results",
  isFinalPage,
  onNext,
  onReview,
}: QuestionPageActionsProps) {
  return (
    <div className="mt-auto flex items-center gap-3 pt-6">
      {isFinalPage ? (
        <Button
          variant="outline"
          onClick={onReview}
          className="min-w-0 shrink-0"
        >
          <RotateCcw size={16} />
          <span className="truncate">Review</span>
        </Button>
      ) : null}
      <Button
        variant="primary"
        onClick={onNext}
        disabled={!allAnswered}
        className="min-w-0 flex-1"
      >
        <span className="truncate">
          {isFinalPage ? finalActionLabel : "Next page"}
        </span>
        <ArrowRight size={18} />
      </Button>
    </div>
  );
}
