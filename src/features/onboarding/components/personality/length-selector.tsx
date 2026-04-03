import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { memo, useEffect, useState } from "react";
import { fadeUpItem, staggerContainer } from "../../constants/motion";
import {
  buildQuestionList,
  TEST_LENGTH_CONFIG,
  type IpipQuestion,
  type TestLength,
} from "../../data/ipip-questions";

interface LengthSelectorProps {
  onBack: () => void;
  onBegin: (length: TestLength) => void;
  onSelectionChange?: (length: TestLength) => void;
  initialLength?: TestLength;
  mode?: "begin" | "adjust";
  answers?: Record<number, number>;
}

const OPTIONS: TestLength[] = [30, 50, 150];
const RESOLUTION_SEGMENTS = [0, 1, 2, 3, 4, 5];

/**
 * Optimized Option Card sub-component
 * Memoized to prevent unnecessary re-renders during selection transitions
 */
const OptionCard = memo(
  ({
    length,
    isSelected,
    onSelect,
    answers = {},
    isAdjust = false,
  }: {
    length: TestLength;
    isSelected: boolean;
    onSelect: (length: TestLength) => void;
    answers?: Record<number, number>;
    isAdjust?: boolean;
  }) => {
    const config = TEST_LENGTH_CONFIG[length];
    const isRecommended = config.recommended;

    // Calculate progress for this specific length
    const questions = buildQuestionList(length);
    const answeredCount = questions.filter(
      (q: IpipQuestion) => answers[q.id] !== undefined,
    ).length;
    const progressPercent = Math.round((answeredCount / length) * 100);
    const isComplete = answeredCount >= length;

    return (
      <Card
        role="button"
        tabIndex={0}
        onClick={() => onSelect(length)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(length);
          }
        }}
        className={cn(
          "relative overflow-hidden w-full text-left p-5 transition-all duration-300 cursor-pointer border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/20",
          isSelected
            ? "border-forge-teal/30 bg-white shadow-[0_8px_308px_rgba(13,148,136,0.08)]"
            : isRecommended
              ? "border-forge-teal/10 bg-white shadow-xs hover:border-forge-teal/20"
              : "border-slate-100 bg-white shadow-none hover:shadow-sm hover:border-slate-200",
        )}
      >
        {isSelected && (
          <motion.div
            layoutId="length-selection-bg"
            className="absolute inset-0 bg-forge-teal/1.5 pointer-events-none"
            initial={false}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1px_1fr] items-center gap-4 sm:gap-6 relative z-10">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex items-center justify-center shrink-0 rounded-full transition-all duration-300 w-5 h-5 border-2",
                isSelected ? "border-forge-teal" : "border-slate-300",
              )}
            >
              <AnimatePresence mode="wait">
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="w-2.5 h-2.5 bg-forge-teal rounded-full"
                  />
                )}
              </AnimatePresence>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
                <span className="font-sans text-base font-extrabold text-ink leading-tight">
                  {config.label}
                </span>
                {isRecommended && (
                  <span className="font-sans text-[8px] font-bold uppercase tracking-widest bg-spark-amber text-white px-1.5 py-0.5 rounded-full shrink-0">
                    Best value
                  </span>
                )}
                {isAdjust && isComplete && (
                  <span className="font-sans text-[8px] font-bold uppercase tracking-widest bg-forge-teal text-white px-1.5 py-0.5 rounded-full shrink-0">
                    Done
                  </span>
                )}
              </div>
              <span className="font-sans text-[10px] font-bold text-slate-400">
                {length} items &middot; ~{config.estimatedMinutes} min
              </span>
            </div>
          </div>

          <div className="hidden sm:block w-full h-10 bg-slate-100/80" />

          {/* Detail Column */}
          <div className="flex flex-col justify-center">
            <p className="font-sans text-xs text-slate-500 font-medium leading-relaxed mb-2 sm:mb-1.5 text-pretty">
              {config.sublabel}
            </p>

            <div className="flex items-center gap-1 opacity-70">
              <span className="font-sans text-[9px] font-bold text-slate-400 uppercase tracking-tighter mr-1">
                {isAdjust && answeredCount > 0
                  ? isComplete
                    ? "Completed"
                    : `Resume (at ${progressPercent}%):`
                  : "Match Precision:"}
              </span>

              {isAdjust && answeredCount > 0 ? (
                <div className="flex-1 h-1 bg-slate-100 rounded-full max-w-30 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    className="h-full bg-forge-teal"
                  />
                </div>
              ) : (
                RESOLUTION_SEGMENTS.map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1 w-2.5 rounded-full transition-colors",
                      i < (length === 30 ? 2 : length === 50 ? 4 : 6)
                        ? "bg-forge-teal/40"
                        : "bg-slate-100",
                    )}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  },
);

OptionCard.displayName = "OptionCard";

export function LengthSelector({
  onBack,
  onBegin,
  onSelectionChange,
  initialLength = 50,
  mode = "begin",
  answers = {},
}: LengthSelectorProps) {
  const [selected, setSelected] = useState<TestLength>(initialLength);

  useEffect(() => {
    onSelectionChange?.(selected);
  }, [selected, onSelectionChange]);

  const handleSelect = (length: TestLength) => {
    setSelected(length);
  };

  const isAdjust = mode === "adjust";
  const selectedQuestions = buildQuestionList(selected);
  const selectedAnsweredCount = selectedQuestions.filter(
    (q: IpipQuestion) => answers[q.id] !== undefined,
  ).length;
  const isSelectedComplete = selectedAnsweredCount >= selected;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex flex-col max-w-xl mx-auto w-full gap-0 sm:px-0"
    >
      <motion.div variants={fadeUpItem}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="flex items-center gap-1.5 font-sans text-xs font-medium mb-2 w-fit text-slate-400 hover:text-slate-600 px-0 hover:bg-transparent border-0 focus:ring-0 focus:outline-none focus:bg-transparent"
        >
          <ArrowLeft size={14} strokeWidth={2} />
          {isAdjust ? "Return to break" : "Back"}
        </Button>
      </motion.div>

      <motion.p
        variants={fadeUpItem}
        className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] mb-3 text-forge-teal text-center"
      >
        {isAdjust ? "Intermission" : "Assessment depth"}
      </motion.p>

      <motion.h2
        variants={fadeUpItem}
        className="font-sans text-2xl sm:text-3xl font-extrabold leading-tight mb-3 text-ink tracking-tight text-center"
      >
        {isAdjust ? "Adjust test depth" : "How much time do you have?"}
      </motion.h2>

      <motion.p
        variants={fadeUpItem}
        className="font-sans text-sm sm:text-chat-input leading-relaxed mb-10 text-slate-500 font-medium max-w-md mx-auto text-center"
      >
        {isAdjust
          ? "You can increase or decrease the remaining density of your test. Your existing progress will be preserved regardless of your choice."
          : "More questions produce a higher resolution map of your personality, leading to more compatible group placements."}
      </motion.p>

      <motion.div variants={fadeUpItem} className="flex flex-col gap-3 mb-10">
        {OPTIONS.map((length) => (
          <OptionCard
            key={length}
            length={length}
            isSelected={selected === length}
            onSelect={handleSelect}
            answers={answers}
            isAdjust={isAdjust}
          />
        ))}
      </motion.div>

      <motion.div variants={fadeUpItem} className="flex justify-center">
        <Button
          size="lg"
          onClick={() => onBegin(selected)}
          className="w-full sm:w-auto min-w-50 h-14 rounded-xl text-base font-bold bg-forge-teal hover:bg-forge-teal/90 shadow-lg shadow-forge-teal/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {isAdjust
            ? isSelectedComplete
              ? "Complete & View Results"
              : "Confirm & Continue"
            : "Begin assessment"}
          <ArrowRight className="ml-2" size={18} strokeWidth={2.5} />
        </Button>
      </motion.div>
    </motion.div>
  );
}
