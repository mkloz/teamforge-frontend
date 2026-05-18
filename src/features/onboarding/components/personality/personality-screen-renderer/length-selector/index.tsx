import { motion } from "framer-motion";
import { staggerContainer } from "@/features/onboarding/constants/motion";
import type { TestLength } from "@/features/onboarding/data/ipip-questions";
import { LengthSelectorActions } from "./length-selector-actions";
import { LengthSelectorHeader } from "./length-selector-header";
import type { LengthSelectorMode } from "./length-selector-options";
import { LengthSelectorOptionsList } from "./length-selector-options-list";
import { useLengthSelector } from "./use-length-selector";

interface LengthSelectorProps {
  onBack: () => void;
  onBegin: (length: TestLength) => void;
  onSelectionChange?: (length: TestLength) => void;
  initialLength?: TestLength;
  mode?: LengthSelectorMode;
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
  const {
    actionLabel,
    content,
    handleBegin,
    isAdjust,
    selectedLength,
    setSelectedLength,
  } = useLengthSelector({
    answers,
    initialLength,
    mode,
    onBegin,
    onSelectionChange,
  });

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="mx-auto flex min-h-0 w-full max-w-xl flex-1 flex-col gap-0 sm:px-0"
    >
      <LengthSelectorHeader {...content} />
      <LengthSelectorOptionsList
        answers={answers}
        isAdjust={isAdjust}
        onSelect={setSelectedLength}
        selectedLength={selectedLength}
      />
      <LengthSelectorActions
        actionLabel={actionLabel}
        backLabel={isAdjust ? "Back to break" : "Back to guidance"}
        onBack={onBack}
        onBegin={handleBegin}
      />
    </motion.div>
  );
}
