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
              className="type-signature-dash pb-5 font-black text-muted-foreground/60 leading-none sm:pb-6"
              aria-hidden="true"
            >
              -
            </motion.span>
          )}
          <motion.div
            variants={popDownItem}
            className="w-11 text-center sm:w-14"
          >
            <span className="type-signature-letter block font-black text-ink leading-none tracking-tight">
              {letter}
            </span>
            <span className="type-signature-label mt-1 block font-black text-muted-foreground uppercase tracking-widest">
              {TYPE_DIMENSION_LABELS[index]}
            </span>
          </motion.div>
        </div>
      ))}
    </motion.div>
  );
}
