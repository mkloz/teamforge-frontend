import { useState } from "react";
import { motion } from "framer-motion";
import { staggerContainer } from "../../../constants/motion";
import type { TestLength } from "../../../data/ipip-questions";
import { INTERMISSION_CONTENT } from "./constants";
import { IntermissionHeader } from "./header";
import { InsightSection } from "./insight-section";
import { ExtensionSection } from "./extension-section";
import { ActionSection } from "./action-section";

interface IntermissionPageProps {
  milestoneIndex: number;
  answeredCount: number;
  totalQuestions: number;
  onAdjustLength: () => void;
  onExtend: (length: TestLength) => void;
  onContinue: () => void;
}

export function IntermissionPage({
  milestoneIndex,
  answeredCount,
  totalQuestions,
  onAdjustLength,
  onExtend,
  onContinue,
}: IntermissionPageProps) {
  const [selectedUpgrade, setSelectedUpgrade] = useState<TestLength | null>(
    null,
  );

  // Safe indexing modulo array length
  const validIndex = Math.max(0, milestoneIndex - 1);
  const content =
    INTERMISSION_CONTENT[validIndex % INTERMISSION_CONTENT.length];
  const isDone = answeredCount >= totalQuestions;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex flex-col max-w-lg mx-auto w-full gap-0 h-full justify-start pt-2 sm:pt-0 sm:justify-center lg:h-auto px-6 text-center"
    >
      <IntermissionHeader
        totalQuestions={totalQuestions}
        answeredCount={answeredCount}
        Icon={content.icon}
      />

      <InsightSection
        title={content.title}
        description={content.description}
        factTitle={content.factTitle}
        fact={content.fact}
      />

      {isDone && totalQuestions < 150 && (
        <ExtensionSection
          totalQuestions={totalQuestions}
          selectedUpgrade={selectedUpgrade}
          onSelect={setSelectedUpgrade}
        />
      )}

      <ActionSection
        isDone={isDone}
        selectedUpgrade={selectedUpgrade}
        onContinue={
          selectedUpgrade ? () => onExtend(selectedUpgrade) : onContinue
        }
        onAdjustLength={onAdjustLength}
      />
    </motion.div>
  );
}
