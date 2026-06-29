import { m } from "framer-motion";

import { fadeUpItem } from "@/features/onboarding/constants/motion";
import type { TestLength } from "@/features/onboarding/data/ipip-questions";

import { LengthOptionCard } from "./length-option-card";
import { TEST_LENGTH_OPTIONS } from "./length-selector-options";

interface LengthSelectorOptionsListProps {
  answers: Record<number, number>;
  isAdjust: boolean;
  onSelect: (length: TestLength) => void;
  selectedLength: TestLength;
}

export function LengthSelectorOptionsList({
  answers,
  isAdjust,
  onSelect,
  selectedLength,
}: LengthSelectorOptionsListProps) {
  return (
    <m.div variants={fadeUpItem} className="flex flex-col gap-2.5 pb-8">
      {TEST_LENGTH_OPTIONS.map((length) => (
        <LengthOptionCard
          key={length}
          length={length}
          isSelected={selectedLength === length}
          onSelect={onSelect}
          answers={answers}
          isAdjust={isAdjust}
        />
      ))}
    </m.div>
  );
}
