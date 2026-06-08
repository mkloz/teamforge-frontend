import { motion } from "framer-motion";
import type { TestLength } from "@/features/onboarding/data/ipip-questions";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { LengthOptionPrecision } from "./length-option-precision";
import { LengthOptionSelectionIndicator } from "./length-option-selection-indicator";
import { LengthOptionSummary } from "./length-option-summary";
import { getLengthOptionViewModel } from "./length-selector-options";

interface LengthOptionCardProps {
  answers?: Record<number, number>;
  isAdjust?: boolean;
  isSelected: boolean;
  length: TestLength;
  onSelect: (length: TestLength) => void;
}

export function LengthOptionCard({
  answers = {},
  isAdjust = false,
  isSelected,
  length,
  onSelect,
}: LengthOptionCardProps) {
  const viewModel = getLengthOptionViewModel(length, answers);

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={() => onSelect(length)}
      className={cn(
        "relative h-auto w-full overflow-hidden rounded-xl border-2 bg-card p-4 text-left text-card-foreground shadow-none transition-all duration-300 focus-visible:ring-forge-teal/20 sm:p-4.5",
        isSelected
          ? "border-forge-teal/30 bg-forge-teal/8"
          : viewModel.isRecommended
            ? "border-forge-teal/10 bg-card hover:border-forge-teal/20 dark:border-forge-teal/20"
            : "border-border bg-card dark:hover:border-white/15",
      )}
      contentClassName="block h-auto w-full"
    >
      {isSelected && (
        <motion.div
          layoutId="length-selection-bg"
          className="pointer-events-none absolute inset-0 bg-forge-teal/8"
          initial={false}
          transition={{ type: "spring", stiffness: 400, damping: 35 }}
        />
      )}

      <div className="relative z-10 grid grid-cols-1 items-center gap-3.5 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:gap-5">
        <div className="flex items-center gap-3">
          <LengthOptionSelectionIndicator isSelected={isSelected} />
          <LengthOptionSummary
            isAdjust={isAdjust}
            length={length}
            viewModel={viewModel}
          />
        </div>

        <div className="hidden h-10 w-px bg-border/80 sm:block dark:bg-white/8" />

        <LengthOptionPrecision isAdjust={isAdjust} viewModel={viewModel} />
      </div>
    </Button>
  );
}
