import { Check } from "lucide-react";
import type { TestLength } from "@/features/onboarding/data/ipip-questions";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import type { getIntermissionUpgradeOptions } from "./constants";

type IntermissionUpgradeOption = ReturnType<
  typeof getIntermissionUpgradeOptions
>[number];

interface ExtensionOptionCardProps {
  isSelected: boolean;
  onSelect: (length: TestLength | null) => void;
  option: IntermissionUpgradeOption;
}

export function ExtensionOptionCard({
  isSelected,
  onSelect,
  option,
}: ExtensionOptionCardProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={() => onSelect(isSelected ? null : option.length)}
      className={cn(
        "group/btn relative h-auto w-full min-w-0 justify-between rounded-xl border px-3 py-2.5 transition-all sm:px-3.5 sm:py-3",
        isSelected
          ? "border-forge-teal/70 bg-forge-teal/5 shadow-forge-teal/10 shadow-sm"
          : "border-border/60 bg-card hover:border-slate-muted/35 dark:border-white/10 hover:dark:border-white/16",
      )}
    >
      <div className="relative z-10 flex min-w-0 flex-col items-start">
        <div className="mb-1.5 flex min-w-0 items-center gap-2">
          <span
            className={cn(
              "max-w-full truncate rounded-full px-2 py-0.5 font-bold font-sans text-micro uppercase tracking-wider",
              isSelected
                ? "bg-forge-teal text-white"
                : "bg-muted text-muted-foreground dark:bg-white/8",
            )}
          >
            {option.config.label}
          </span>
        </div>
        <span className="max-w-full truncate font-bold font-sans text-ink text-xs">
          +{option.questionsToAdd} more questions
        </span>
      </div>

      <div className="relative z-10 flex shrink-0 items-center gap-2 sm:gap-3">
        <div className="mr-0 flex flex-col items-end sm:mr-1">
          <span className="font-medium font-sans text-micro text-muted-foreground lowercase">
            est. +{option.estimatedMinutesToAdd} min
          </span>
        </div>
        <div
          className={cn(
            "flex size-6 items-center justify-center rounded-full border-2 transition-all",
            isSelected
              ? "border-forge-teal bg-forge-teal text-white"
              : "border-border bg-card text-slate-muted/55 group-hover/btn:border-slate-muted/35 group-hover/btn:text-slate-muted/70 dark:border-white/12 dark:text-white/40 dark:group-hover/btn:border-white/18 dark:group-hover/btn:text-white/60",
          )}
        >
          {isSelected ? (
            <Check size={16} strokeWidth={3.5} />
          ) : (
            <div className="size-1.5 rounded-full bg-current" />
          )}
        </div>
      </div>
    </Button>
  );
}
