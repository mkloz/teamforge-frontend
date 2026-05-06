import { motion } from "framer-motion";
import { fadeUpItem } from "@/features/onboarding/constants/motion";
import {
  PersonalityScreenShell,
  StepNavigation,
} from "./personality-screen-layout";

interface Theory101Props {
  onBack: () => void;
  onNext: () => void;
}

export function Theory101({ onBack, onNext }: Theory101Props) {
  return (
    <PersonalityScreenShell className="max-w-lg">
      <motion.p
        variants={fadeUpItem}
        className="mb-3 text-center font-sans text-xs font-bold uppercase tracking-[0.18em] text-forge-teal"
      >
        How the read works
      </motion.p>

      <motion.h1
        variants={fadeUpItem}
        className="mb-5 text-center font-sans text-[1.75rem] font-extrabold leading-tight text-ink text-balance sm:mb-6 sm:text-3xl"
      >
        You are not one fixed type
      </motion.h1>

      <motion.div
        variants={fadeUpItem}
        className="mb-8 flex flex-col gap-5 px-1 text-left leading-relaxed"
      >
        <p className="font-sans text-sm font-medium text-muted-foreground sm:text-chat-input">
          Most generic tests group people into strict categories (like entirely
          a "Thinker" or purely a "Feeler"). But human psychology is much more
          nuanced than that.
        </p>

        <div className="flex flex-col gap-4">
          <p className="font-sans text-sm sm:text-chat-input leading-relaxed text-pretty text-muted-foreground">
            That's where the{" "}
            <span className="text-ink font-bold">Big Five (OCEAN) model</span>{" "}
            comes in. Instead of boxing you in, it measures exactly where you
            sit on a <i className="text-foreground/85 font-medium">spectrum</i>{" "}
            for five distinct traits:
          </p>

          <ul className="ml-2 flex flex-col gap-2.5 border-l-2 border-forge-teal/30 py-1 pl-4 font-sans text-sm text-foreground/90 sm:ml-4 sm:gap-3 sm:pl-5 sm:text-chat-input">
            <li className="flex items-center gap-2.5">
              <span className="font-black text-forge-teal w-4">O</span>
              <span>Openness to Experience</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="font-black text-forge-teal w-4">C</span>
              <span>Conscientiousness</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="font-black text-forge-teal w-4">E</span>
              <span>Extraversion</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="font-black text-forge-teal w-4">A</span>
              <span>Agreeableness</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="font-black text-forge-teal w-4">N</span>
              <span>Neuroticism (Stability)</span>
            </li>
          </ul>
        </div>

        <p className="font-sans text-sm leading-relaxed text-muted-foreground opacity-90 sm:text-chat-input">
          By measuring traits on a continuous scale, the Big Five provides a
          remarkably accurate mathematical map of your personality. It's the
          gold standard in modern psychology, and the foundation of TeamForge.
        </p>
      </motion.div>

      <StepNavigation
        onBack={onBack}
        onNext={onNext}
        backLabel="Back to intro"
        backClassName="w-auto shrink-0 px-4"
      />
    </PersonalityScreenShell>
  );
}
