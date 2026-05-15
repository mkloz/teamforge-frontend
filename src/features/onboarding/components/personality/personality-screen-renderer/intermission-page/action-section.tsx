import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Target } from "lucide-react";
import { fadeUpItem } from "@/features/onboarding/constants/motion";
import type { TestLength } from "@/features/onboarding/data/ipip-questions";
import { Button } from "@/shared/components/ui/button";
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
      className="mx-auto flex w-full max-w-xl xs:flex-row flex-col-reverse xs:items-center items-stretch gap-3 pt-8 pb-6 sm:pb-8"
    >
      {!isDone && (
        <Button
          variant="outline"
          size="md"
          onClick={onAdjustLength}
          className="w-full xs:w-auto min-w-0 xs:shrink-0"
        >
          <Target size={14} strokeWidth={2.5} />
          <span className="truncate">Adjust depth</span>
        </Button>
      )}

      <Button
        variant={hasUpgradeSelected ? "secondary" : "primary"}
        size="md"
        onClick={onContinue}
        className="w-full min-w-0 xs:flex-1"
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
