import { cn } from "@/shared/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import type { IpipQuestion } from "../../data/ipip-questions";
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
        "relative w-full p-4 transition-all duration-300 bg-white sm:rounded-2xl rounded-xl border border-slate-200/60 shadow-xs",
        answered
          ? "border-forge-teal/30 bg-forge-teal/1 shadow-sm"
          : "hover:shadow-sm sm:hover:shadow-md active:bg-slate-50/50",
      )}
    >
      {/* Header row: pill + answered badge */}
      <div className="flex items-center justify-between mb-2.5 sm:mb-3 h-5 sm:h-6">
        <span className="inline-flex items-center font-sans text-[9px] sm:text-nano font-bold uppercase tracking-widest rounded-full px-2 py-0.5 sm:px-2.5 sm:py-1 bg-slate-500/10 text-slate-500/65">
          Q {index} of {totalQuestions}
        </span>

        <AnimatePresence>
          {answered && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="inline-flex items-center gap-1 font-sans text-[9px] sm:text-nano font-bold uppercase tracking-wider rounded-full px-2 py-0.5 sm:px-2.5 sm:py-1 bg-forge-teal/10 text-forge-teal"
            >
              <Check size={9} strokeWidth={3} className="sm:w-2.5 sm:h-2.5" />
              Done
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Statement text */}
      <h3 className="font-sans text-sm sm:text-base font-semibold leading-snug mb-3 sm:mb-5 text-pretty text-ink">
        {question.text}
      </h3>

      <LikertScale
        value={value}
        onChange={(val) => onChange(question.id, val)}
      />
    </div>
  );
}
