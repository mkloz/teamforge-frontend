import { PERSONALITY_INFO_BY_TYPE } from "@/features/onboarding/data/personality-metadata";
import { motion } from "framer-motion";

import type { PersonalityType } from "@/shared/schemas/enums";

import { CompletionBlueprintAction } from "./completion-blueprint-action";
import { CompletionBlueprintBackground } from "./completion-blueprint-background";
import { CompletionBlueprintCard } from "./completion-blueprint-card";
import { CompletionBlueprintHeader } from "./completion-blueprint-header";
import { completionStagger } from "./completion-blueprint-motion";

interface CompletionBlueprintProps {
  personalityType: PersonalityType | null;
  interestCount: number;
  onEnter: () => void;
}

export function CompletionBlueprint({
  personalityType,
  interestCount,
  onEnter,
}: CompletionBlueprintProps) {
  const nickname = personalityType
    ? PERSONALITY_INFO_BY_TYPE[personalityType]?.name
    : "The Forge Explorer";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="dark fixed inset-0 z-100 flex flex-col items-center justify-center overflow-hidden bg-hero-bg text-foreground"
    >
      <CompletionBlueprintBackground />

      <motion.div
        variants={completionStagger}
        initial="initial"
        animate="animate"
        className="relative z-10 flex w-full max-w-md flex-col items-center px-6"
      >
        <CompletionBlueprintHeader />
        <CompletionBlueprintCard
          personalityType={personalityType}
          nickname={nickname}
          interestCount={interestCount}
        />
        <CompletionBlueprintAction onEnter={onEnter} />
      </motion.div>
    </motion.div>
  );
}
