import { Button } from "@/shared/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import {
  fadeUpItem,
  staggerContainer,
} from "@/features/onboarding/constants/motion";
import type { TestLength } from "@/features/onboarding/data/ipip-questions";
import { LengthOptionCard } from "./length-option-card";
import {
  getLengthProgress,
  TEST_LENGTH_OPTIONS,
} from "./length-selector-options";

interface LengthSelectorProps {
  onBack: () => void;
  onBegin: (length: TestLength) => void;
  onSelectionChange?: (length: TestLength) => void;
  initialLength?: TestLength;
  mode?: "begin" | "adjust";
  answers?: Record<number, number>;
}

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
  const { isComplete: isSelectedComplete } = getLengthProgress(
    selected,
    answers,
  );

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
          className="text-muted-foreground hover:text-foreground px-0 hover:bg-transparent"
        >
          <ArrowLeft size={14} strokeWidth={2} />
          {isAdjust ? "Return to break" : "Back"}
        </Button>
      </motion.div>

      <motion.p
        variants={fadeUpItem}
        className="font-sans text-xs font-bold uppercase tracking-[0.15em] mb-3 text-forge-teal text-center"
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
        className="font-sans text-sm sm:text-chat-input leading-relaxed mb-10 text-muted-foreground font-medium max-w-md mx-auto text-center"
      >
        {isAdjust
          ? "You can increase or decrease the remaining density of your test. Your existing progress will be preserved regardless of your choice."
          : "More questions produce a higher resolution map of your personality, leading to more compatible group placements."}
      </motion.p>

      <motion.div variants={fadeUpItem} className="flex flex-col gap-3 mb-10">
        {TEST_LENGTH_OPTIONS.map((length) => (
          <LengthOptionCard
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
          size="hero"
          onClick={() => onBegin(selected)}
          className="w-full sm:w-auto min-w-50"
        >
          {isAdjust
            ? isSelectedComplete
              ? "Complete & View Results"
              : "Confirm & Continue"
            : "Begin assessment"}
          <ArrowRight size={18} strokeWidth={2.5} />
        </Button>
      </motion.div>
    </motion.div>
  );
}
