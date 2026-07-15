import { m } from "framer-motion";
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
    <m.div
      variants={fadeUpItem}
      className="mb-5 flex w-full flex-col items-start text-left"
    >
      <div className="mb-5 h-px w-full bg-muted/60 sm:mb-6 dark:bg-white/10" />

      <h3 className="mb-1.5 flex items-center gap-2 font-bold font-sans text-base text-ink">
        Answer more questions?
      </h3>
      <p className="mb-4 font-medium font-sans text-muted-foreground text-sm leading-relaxed sm:mb-5">
        You can stop here or continue with a longer assessment for more trait
        detail.
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
    </m.div>
  );
}
