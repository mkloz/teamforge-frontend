import { AnimatePresence, motion } from "framer-motion";
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

  return (
    <div
      className={cn(
        "relative w-full rounded-xl border border-border bg-card p-4 shadow-xs transition-all duration-300",
        answered
          ? "border-forge-teal/30 bg-forge-teal/6 shadow-sm"
          : "hover:shadow-sm active:bg-muted/50 sm:hover:shadow-md dark:active:bg-white/5",
      )}
    >
      <div className="mb-2.5 flex h-5 items-center justify-between sm:mb-3 sm:h-6">
        <StatusPill
          tone="muted"
          size="xs"
          surface="soft"
          className="font-sans text-nano sm:px-2.5 sm:py-1"
        >
          Q {index} of {totalQuestions}
        </StatusPill>

        <AnimatePresence>
          {answered && (
            <motion.span
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
                className="font-sans text-nano sm:px-2.5 sm:py-1"
                iconClassName="size-2.5"
              >
                Done
              </StatusPill>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <h3 className="mb-3 text-pretty font-sans font-semibold text-ink text-sm leading-snug sm:mb-5 sm:text-base">
        {question.text}
      </h3>

      <LikertScale
        value={value}
        onChange={(val) => onChange(question.id, val)}
      />
    </div>
  );
}
