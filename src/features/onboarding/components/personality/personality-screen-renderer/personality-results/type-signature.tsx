import { m } from "framer-motion";

import {
  popDownItem,
  resultsContainer,
} from "@/features/onboarding/constants/motion";
import type { PersonalityType } from "@/shared/schemas/enums";

const TYPE_DIMENSION_LABELS = [
  "Energy",
  "Information",
  "Decisions",
  "Structure",
];

interface TypeSignatureProps {
  personalityType: PersonalityType;
}

export function TypeSignature({ personalityType }: TypeSignatureProps) {
  return (
    <m.div
      variants={resultsContainer}
      className="flex flex-wrap items-end gap-2"
      aria-label={`Personality type ${personalityType}`}
    >
      {personalityType.split("").map((letter, index) => (
        <m.div
          key={`${letter}-${TYPE_DIMENSION_LABELS[index]}`}
          variants={popDownItem}
          className="w-14 text-center"
        >
          <span className="block font-black text-5xl text-ink leading-none tracking-tight sm:text-6xl">
            {letter}
          </span>
          <span className="mt-1 block font-bold text-muted-foreground text-xs">
            {TYPE_DIMENSION_LABELS[index]}
          </span>
        </m.div>
      ))}
    </m.div>
  );
}
