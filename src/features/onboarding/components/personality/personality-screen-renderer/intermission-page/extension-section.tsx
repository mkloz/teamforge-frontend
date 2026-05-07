import { motion } from "framer-motion";
import { fadeUpItem } from "@/features/onboarding/constants/motion";
import type { TestLength } from "@/features/onboarding/data/ipip-questions";
import { getIntermissionUpgradeOptions } from "./constants";
import { ExtensionOptionCard } from "./extension-option-card";

interface ExtensionSectionProps {
  totalQuestions: number;
  selectedUpgrade: TestLength | null;
  onSelect: (length: TestLength | null) => void;
}

export function ExtensionSection({
  totalQuestions,
  selectedUpgrade,
  onSelect,
}: ExtensionSectionProps) {
  const upgradeOptions = getIntermissionUpgradeOptions(totalQuestions);

  return (
    <motion.div
      variants={fadeUpItem}
      className="mb-5 flex w-full flex-col items-start text-left"
    >
      <div className="mb-5 h-px w-full bg-slate-200/60 sm:mb-6 dark:bg-white/10" />

      <h3 className="mb-1.5 flex items-center gap-2 font-sans text-base font-bold text-ink">
        Want a sharper result?
      </h3>
      <p className="mb-4 font-sans text-sm leading-relaxed font-medium text-muted-foreground sm:mb-5">
        You have completed the baseline. You can stop here, or answer a little
        more to make the final read more specific.
      </p>

      <div className="flex w-full flex-col gap-2.5">
        {upgradeOptions.map((option) => (
          <ExtensionOptionCard
            key={option.length}
            option={option}
            isSelected={selectedUpgrade === option.length}
            onSelect={onSelect}
          />
        ))}
      </div>
    </motion.div>
  );
}
