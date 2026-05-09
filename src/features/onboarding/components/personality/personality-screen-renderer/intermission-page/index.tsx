import { motion } from "framer-motion";
import { staggerContainer } from "@/features/onboarding/constants/motion";
import type { TestLength } from "@/features/onboarding/data/ipip-questions";
import { ActionSection } from "./action-section";
import { ExtensionSection } from "./extension-section";
import { IntermissionHeader } from "./header";
import { InsightSection } from "./insight-section";
import { useIntermissionPage } from "./use-intermission-page";

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
  const {
    content,
    handleContinue,
    isDone,
    selectedUpgrade,
    setSelectedUpgrade,
    shouldShowExtension,
  } = useIntermissionPage({
    answeredCount,
    milestoneIndex,
    onContinue,
    onExtend,
    totalQuestions,
  });

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="mx-auto flex min-h-dvh w-full max-w-xl flex-col justify-start gap-0 pt-6 text-center sm:pt-0 lg:min-h-0"
    >
      <div className="flex min-h-0 flex-1 flex-col justify-center">
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

        {shouldShowExtension && (
          <ExtensionSection
            totalQuestions={totalQuestions}
            selectedUpgrade={selectedUpgrade}
            onSelect={setSelectedUpgrade}
          />
        )}
      </div>

      <ActionSection
        isDone={isDone}
        selectedUpgrade={selectedUpgrade}
        onContinue={handleContinue}
        onAdjustLength={onAdjustLength}
      />
    </motion.div>
  );
}
