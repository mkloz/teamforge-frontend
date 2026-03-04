import { Card } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { memo } from "react";
import type { IpipQuestion } from "../data/ipip-questions";
import { LikertScale } from "./likert-scale";

interface QuestionCardProps {
  question: IpipQuestion;
  /** 1-based global index */
  index: number;
  totalQuestions: number;
  value: 1 | 2 | 3 | 4 | 5 | undefined;
  onChange: (questionId: number, val: 1 | 2 | 3 | 4 | 5) => void;
}

export const QuestionCard = memo(function QuestionCard({
  question,
  index,
  totalQuestions,
  value,
  onChange,
}: QuestionCardProps) {
  const answered = value !== undefined;

  return (
    <Card
      className={cn(
        "relative w-full p-4 transition duration-200 bg-white",
        answered
          ? "border-forge-teal/45 shadow-[0_4px_20px_rgba(13,148,136,0.08)]"
          : "border-slate-200/50 shadow-none hover:shadow-sm",
      )}
    >
      {/* Header row: pill + answered badge */}
      <div className="flex items-center justify-between mb-3 h-6">
        <span className="inline-flex items-center font-sans text-[9px] font-semibold uppercase tracking-widest rounded-full px-2.5 py-1 bg-slate-500/10 text-slate-500/65">
          Q {index} of {totalQuestions}
        </span>

        <AnimatePresence>
          {answered && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="inline-flex items-center gap-1 font-sans text-[9px] font-semibold uppercase tracking-wider rounded-full px-2.5 py-1 bg-forge-teal/10 text-forge-teal"
            >
              <Check size={10} strokeWidth={2.8} />
              Done
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Statement text */}
      <p className="font-sans text-sm font-medium leading-relaxed mb-3 text-pretty text-[#1C1C1A]">
        {question.text}
      </p>

      <LikertScale
        value={value}
        onChange={(val) => onChange(question.id, val)}
      />
    </Card>
  );
});
