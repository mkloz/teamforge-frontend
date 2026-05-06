import { fadeUpItem } from "@/features/onboarding/constants/motion";
import type { TestLength } from "@/features/onboarding/data/ipip-questions";
import { Button } from "@/shared/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Target } from "lucide-react";
import { getIntermissionActionLabel } from "./constants";

interface ActionSectionProps {
  isDone: boolean;
  selectedUpgrade: TestLength | null;
  onContinue: () => void;
  onAdjustLength: () => void;
}

export function ActionSection({
  isDone,
  selectedUpgrade,
  onContinue,
  onAdjustLength,
}: ActionSectionProps) {
  const hasUpgradeSelected = selectedUpgrade !== null;
  const buttonLabel = getIntermissionActionLabel({ isDone, selectedUpgrade });

  return (
    <motion.div
      variants={fadeUpItem}
      className="mx-auto flex w-full max-w-xl flex-col-reverse items-stretch gap-3 pb-6 pt-8 min-[430px]:flex-row min-[430px]:items-center sm:pb-8"
    >
      {!isDone && (
        <Button
          variant="outline"
          size="lg"
          onClick={onAdjustLength}
          className="h-12 w-full min-w-0 text-sm min-[430px]:w-auto min-[430px]:shrink-0 sm:h-13 sm:text-base"
        >
          <Target size={14} strokeWidth={2.5} />
          <span className="truncate">Adjust depth</span>
        </Button>
      )}

      <Button
        variant={hasUpgradeSelected ? "secondary" : "primary"}
        size="lg"
        onClick={onContinue}
        className="h-12 w-full min-w-0 text-sm min-[430px]:flex-1 sm:h-13 sm:text-base"
      >
        <span className="truncate">{buttonLabel}</span>
        {hasUpgradeSelected ? (
          <ArrowUpRight size={16} strokeWidth={2.5} />
        ) : (
          <ArrowRight size={16} strokeWidth={2.5} />
        )}
      </Button>
    </motion.div>
  );
}
