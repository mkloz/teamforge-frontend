import { cn } from "@/shared/lib/utils";
import type { IpipQuestion } from "@/features/onboarding/data/ipip-questions";

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
              ? "bg-forge-teal"
              : "bg-slate-500/15",
          )}
        />
      ))}
      <span className="ml-1 shrink-0 font-sans text-xs leading-none font-black text-muted-foreground/80">
        {answeredCount}/{pageQuestions.length}
      </span>
    </div>
  );
}
