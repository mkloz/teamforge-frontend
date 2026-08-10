import { AnimatePresence, m } from "framer-motion";
import { Check } from "lucide-react";
import type { IpipQuestion } from "@/features/onboarding/data/ipip-questions";
import { StatusPill } from "@/shared/components/ui/status-pill";
import { cn } from "@/shared/lib/utils";
import { LikertScale } from "./likert-scale";

interface QuestionCardProps {
  question: IpipQuestion;
  /** 1-based global index */
  index: number;
  totalQuestions: number;
  value: 1 | 2 | 3 | 4 | 5 | undefined;
  onChange: (questionId: number, val: 1 | 2 | 3 | 4 | 5) => void;
}

export function QuestionCard({
  question,
  index,
  totalQuestions,
  value,
  onChange,
}: QuestionCardProps) {
  const answered = value !== undefined;
  const questionLabelId = `personality-question-${question.id}`;

  return (
    <div
      className={cn(
        "relative w-full rounded-xl bg-card p-4 shadow-soft-sm transition-all duration-300",
        answered
          ? "border-brand-teal/30 bg-primary-soft shadow-sm"
          : "hover:shadow-sm active:bg-muted/50 hover:sm:shadow-md active:dark:bg-white/5",
      )}
    >
      <div className="mb-2.5 flex h-5 items-center justify-between sm:mb-3 sm:h-6">
        <StatusPill
          tone="muted"
          size="xs"
          surface="soft"
          className="font-sans text-xs sm:px-2.5 sm:py-1"
        >
          Q {index} of {totalQuestions}
        </StatusPill>

        <AnimatePresence>
          {answered && (
            <m.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <StatusPill
                icon={Check}
                tone="teal"
                size="xs"
                surface="soft"
                className="font-sans text-xs sm:px-2.5 sm:py-1"
                iconClassName="size-2.5"
              >
                Done
              </StatusPill>
            </m.span>
          )}
        </AnimatePresence>
      </div>

      <h3
        id={questionLabelId}
        className="mb-3 text-pretty font-sans font-semibold text-ink text-sm leading-snug sm:mb-5 sm:text-base"
      >
        {question.text}
      </h3>

      <LikertScale
        labelledBy={questionLabelId}
        value={value}
        onChange={(val) => onChange(question.id, val)}
      />
    </div>
  );
}
