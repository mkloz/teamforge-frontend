import { m } from "framer-motion";
import { staggerContainer } from "@/features/onboarding/constants/motion";
import type { TestLength } from "@/features/onboarding/data/ipip-questions";
import { ActionSection } from "./action-section";
import { ExtensionSection } from "./extension-section";
import { IntermissionHeader } from "./header";
import { InsightSection } from "./insight-section";
import { useIntermissionPage } from "./use-intermission-page";

interface IntermissionPageProps {
  allowLengthChanges: boolean;
  milestoneIndex: number;
  answeredCount: number;
  totalQuestions: number;
  onAdjustLength: () => void;
  onExtend: (length: TestLength) => void;
  onContinue: () => void;
  isStarterMilestone?: boolean;
  onExploreAfterStarter?: () => void;
  starterError?: string | null;
  isCompletingStarter?: boolean;
}

export function IntermissionPage({
  allowLengthChanges,
  milestoneIndex,
  answeredCount,
  totalQuestions,
  onAdjustLength,
  onExtend,
  onContinue,
  isStarterMilestone = false,
  onExploreAfterStarter,
  starterError = null,
  isCompletingStarter = false,
}: IntermissionPageProps) {
  const {
    content,
    handleContinue,
    isDone,
    selectedUpgrade,
    setSelectedUpgrade,
    shouldShowExtension,
  } = useIntermissionPage({
    allowLengthChanges,
    answeredCount,
    milestoneIndex,
    onContinue,
    onExtend,
    totalQuestions,
  });

  return (
    <m.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="mx-auto flex min-h-0 w-full max-w-xl flex-1 flex-col justify-start gap-0 pt-6 text-center sm:pt-0"
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
        allowLengthChanges={allowLengthChanges}
        isDone={isDone}
        selectedUpgrade={selectedUpgrade}
        onContinue={handleContinue}
        onAdjustLength={onAdjustLength}
        isStarterMilestone={isStarterMilestone}
        onExploreAfterStarter={onExploreAfterStarter}
        starterError={starterError}
        isCompletingStarter={isCompletingStarter}
      />
    </m.div>
  );
}
