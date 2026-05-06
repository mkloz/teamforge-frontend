import { motion } from "framer-motion";

import {
  popDownItem,
  resultsContainer,
} from "@/features/onboarding/constants/motion";
import type { PersonalityEvaluation } from "@/features/onboarding/lib/personality-evaluation";

const TYPE_DIMENSION_LABELS = [
  "Energy",
  "Mind",
  "Nature",
  "Tactics",
  "Identity",
] as const;

interface TypeSignatureProps {
  result: PersonalityEvaluation;
  typeLabel: string;
}

export function TypeSignature({ result, typeLabel }: TypeSignatureProps) {
  const typeLetters = result.type.split("");
  const letters = [...typeLetters, result.variant];

  return (
    <motion.div
      variants={resultsContainer}
      className="flex flex-wrap items-end gap-x-2 gap-y-2"
      aria-label={typeLabel}
    >
      {letters.map((letter, index) => (
        <div
          key={`${letter}-${TYPE_DIMENSION_LABELS[index]}`}
          className="flex items-end gap-2"
        >
          {index === typeLetters.length && (
            <motion.span
              variants={popDownItem}
              className="pb-5 text-[2.4rem] font-black leading-none text-muted-foreground/60 sm:pb-6 sm:text-[3rem]"
              aria-hidden="true"
            >
              -
            </motion.span>
          )}
          <motion.div
            variants={popDownItem}
            className="w-11 text-center sm:w-14"
          >
            <span className="block text-[3rem] font-black leading-none tracking-tight text-ink sm:text-[3.85rem]">
              {letter}
            </span>
            <span className="mt-1 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              {TYPE_DIMENSION_LABELS[index]}
            </span>
          </motion.div>
        </div>
      ))}
    </motion.div>
  );
}
