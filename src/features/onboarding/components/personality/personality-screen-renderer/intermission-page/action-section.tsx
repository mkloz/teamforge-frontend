import { m } from "framer-motion";
import { ArrowRight, ArrowUpRight, Target } from "lucide-react";
import { fadeUpItem } from "@/features/onboarding/constants/motion";
import type { TestLength } from "@/features/onboarding/data/ipip-questions";
import { Button } from "@/shared/components/ui/button";
import { getIntermissionActionLabel } from "./constants";

interface ActionSectionProps {
  allowLengthChanges: boolean;
  isDone: boolean;
  selectedUpgrade: TestLength | null;
  onContinue: () => void;
  onAdjustLength: () => void;
  isStarterMilestone?: boolean;
  onExploreAfterStarter?: () => void;
  starterError?: string | null;
  isCompletingStarter?: boolean;
}

export function ActionSection({
  allowLengthChanges,
  isDone,
  selectedUpgrade,
  onContinue,
  onAdjustLength,
  isStarterMilestone = false,
  onExploreAfterStarter,
  starterError = null,
  isCompletingStarter = false,
}: ActionSectionProps) {
  const hasUpgradeSelected = selectedUpgrade !== null;
  const buttonLabel = getIntermissionActionLabel({ isDone, selectedUpgrade });

  return (
    <>
      {starterError ? (
        <p
          role="alert"
          className="mx-auto w-full max-w-xl pt-5 text-left font-medium text-danger text-sm"
        >
          {starterError}
        </p>
      ) : null}
      <m.div
        variants={fadeUpItem}
        className="mx-auto flex w-full max-w-xl xs:flex-row flex-col-reverse xs:items-center items-stretch gap-3 pt-8 pb-6 sm:pb-8"
      >
        {isStarterMilestone && onExploreAfterStarter ? (
          <Button
            variant="primary"
            size="md"
            onClick={onExploreAfterStarter}
            disabled={isCompletingStarter}
            className="w-full xs:flex-1"
          >
            Choose interests
            <ArrowRight size={16} strokeWidth={2.5} />
          </Button>
        ) : allowLengthChanges && !isDone ? (
          <Button
            variant="outline"
            size="md"
            onClick={onAdjustLength}
            className="w-full xs:w-auto min-w-0 xs:shrink-0"
          >
            <Target size={14} strokeWidth={2.5} />
            <span className="truncate">Adjust depth</span>
          </Button>
        ) : null}

        <Button
          variant={
            isStarterMilestone
              ? "outline"
              : hasUpgradeSelected
                ? "secondary"
                : "primary"
          }
          size="md"
          onClick={onContinue}
          disabled={isCompletingStarter}
          className="w-full min-w-0 xs:flex-1"
        >
          <span className="truncate">
            {isStarterMilestone ? "Continue full assessment" : buttonLabel}
          </span>
          {hasUpgradeSelected ? (
            <ArrowUpRight size={16} strokeWidth={2.5} />
          ) : (
            <ArrowRight size={16} strokeWidth={2.5} />
          )}
        </Button>
      </m.div>
    </>
  );
}
