import { domAnimation, LazyMotion, m } from "framer-motion";
import { staggerContainer } from "@/features/onboarding/constants/motion";
import type { TestLength } from "@/features/onboarding/data/ipip-questions";
import type { PersonalityAssessmentCapabilities } from "@/shared/schemas/personality-assessment";
import { LengthSelectorActions } from "./length-selector-actions";
import { LengthSelectorHeader } from "./length-selector-header";
import type { LengthSelectorMode } from "./length-selector-options";
import { LengthSelectorOptionsList } from "./length-selector-options-list";
import { useLengthSelector } from "./use-length-selector";

interface LengthSelectorProps {
  onBack: () => void;
  onBegin: (length: TestLength) => void;
  onBeginDynamic: () => void;
  onSelectionChange?: (length: TestLength) => void;
  initialLength?: TestLength;
  mode?: LengthSelectorMode;
  answers?: Record<number, number>;
  dynamicCapability?: PersonalityAssessmentCapabilities["dynamic"] | null;
}

const EMPTY_LENGTH_SELECTOR_ANSWERS: Record<number, number> = {};

export function LengthSelector({
  onBack,
  onBegin,
  onBeginDynamic,
  onSelectionChange,
  initialLength = 50,
  mode = "begin",
  answers = EMPTY_LENGTH_SELECTOR_ANSWERS,
  dynamicCapability = null,
}: LengthSelectorProps) {
  const {
    actionLabel,
    content,
    handleBegin,
    isAdjust,
    selection,
    setSelection,
  } = useLengthSelector({
    answers,
    initialLength,
    mode,
    onBegin,
    onBeginDynamic,
    onSelectionChange,
  });

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="mx-auto flex min-h-0 w-full max-w-xl flex-1 flex-col gap-0 sm:px-0"
      >
        <LengthSelectorHeader {...content} />
        <LengthSelectorOptionsList
          answers={answers}
          isAdjust={isAdjust}
          dynamicCapability={dynamicCapability}
          onSelect={setSelection}
          selection={selection}
        />
        <LengthSelectorActions
          actionLabel={actionLabel}
          backLabel={isAdjust ? "Back to break" : "Back to guidance"}
          onBack={onBack}
          onBegin={handleBegin}
        />
      </m.div>
    </LazyMotion>
  );
}
