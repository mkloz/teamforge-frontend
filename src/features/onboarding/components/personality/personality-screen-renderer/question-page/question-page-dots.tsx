import type { IpipQuestion } from "@/features/onboarding/data/ipip-questions";
import { cn } from "@/shared/lib/utils";

interface QuestionPageDotsProps {
  answeredCount: number;
  answeredQuestionIds: Set<number>;
  pageQuestions: IpipQuestion[];
}

export function QuestionPageDots({
  answeredCount,
  answeredQuestionIds,
  pageQuestions,
}: QuestionPageDotsProps) {
  return (
    <div className="flex items-center gap-1.5">
      {pageQuestions.map((question) => (
        <div
          key={question.id}
          className={cn(
            "h-0.75 flex-1 rounded-full transition-colors duration-300",
            answeredQuestionIds.has(question.id)
              ? "bg-brand-teal"
              : "bg-muted-soft",
          )}
        />
      ))}
      <span className="ml-1 shrink-0 font-black font-sans text-muted-foreground/80 text-xs leading-none">
        {answeredCount}/{pageQuestions.length}
      </span>
    </div>
  );
}
