import { m } from "framer-motion";

import { fadeUpItem } from "@/features/onboarding/constants/motion";
import type { TestLength } from "@/features/onboarding/data/ipip-questions";
import type { PersonalityAssessmentCapabilities } from "@/shared/schemas/personality-assessment";

import { DynamicAssessmentOptionCard } from "./dynamic-assessment-option-card";
import { LengthOptionCard } from "./length-option-card";
import {
  type AssessmentSelection,
  TEST_LENGTH_OPTIONS,
} from "./length-selector-options";

interface LengthSelectorOptionsListProps {
  answers: Record<number, number>;
  isAdjust: boolean;
  dynamicCapability: PersonalityAssessmentCapabilities["dynamic"] | null;
  onSelect: (selection: AssessmentSelection) => void;
  selection: AssessmentSelection;
}

export function LengthSelectorOptionsList({
  answers,
  isAdjust,
  dynamicCapability,
  onSelect,
  selection,
}: LengthSelectorOptionsListProps) {
  return (
    <m.div variants={fadeUpItem} className="flex flex-col gap-2.5 pb-8">
      {TEST_LENGTH_OPTIONS.map((length) => (
        <LengthOptionCard
          key={length}
          length={length}
          isSelected={selection.kind === "fixed" && selection.length === length}
          onSelect={(nextLength: TestLength) =>
            onSelect({ kind: "fixed", length: nextLength })
          }
          answers={answers}
          isAdjust={isAdjust}
        />
      ))}
      {!isAdjust && dynamicCapability ? (
        <DynamicAssessmentOptionCard
          capability={dynamicCapability}
          isSelected={selection.kind === "dynamic"}
          onSelect={() => onSelect({ kind: "dynamic" })}
        />
      ) : null}
    </m.div>
  );
}
