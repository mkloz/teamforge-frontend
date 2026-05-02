import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { fadeUpItem } from "@/features/onboarding/constants/motion";
import {
  TEST_LENGTH_CONFIG,
  type TestLength,
} from "@/features/onboarding/data/ipip-questions";

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
  return (
    <motion.div
      variants={fadeUpItem}
      className="w-full mb-6 flex flex-col items-start text-left"
    >
      <div className="h-px w-full bg-slate-200/60 dark:bg-white/10 mb-8" />

      <h3 className="font-sans text-base font-bold text-ink mb-1.5 flex items-center gap-2">
        Continue Exploring
      </h3>
      <p className="font-sans text-sm text-muted-foreground font-medium mb-6 leading-relaxed">
        You've completed the baseline assessment. You can stop here, or answer
        more questions to generate a higher-resolution profile.
      </p>

      <div className="flex flex-col w-full gap-3">
        {([30, 50, 150] as const)
          .filter((len) => len > totalQuestions)
          .map((numLen) => {
            const config = TEST_LENGTH_CONFIG[numLen];
            const isSelected = selectedUpgrade === numLen;

            const currentEst =
              Object.values(TEST_LENGTH_CONFIG).find(
                (c) => c.itemsPerDimension * 5 === totalQuestions,
              )?.estimatedMinutes || 0;

            return (
              <button
                key={numLen}
                onClick={() => onSelect(isSelected ? null : numLen)}
                className={cn(
                  "w-full flex items-center justify-between py-3 px-4 rounded-xl transition-all cursor-pointer group/btn relative border active:scale-[0.98]",
                  isSelected
                    ? "border-forge-teal bg-forge-teal/5 shadow-sm shadow-forge-teal/10"
                    : "border-slate-200/60 dark:border-white/10 bg-card hover:border-slate-300 dark:hover:border-white/16 hover:shadow-xs",
                )}
              >
                <div className="flex flex-col items-start relative z-10">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className={cn(
                        "font-sans text-xs font-bold uppercase tracking-wider rounded-full px-2 py-0.5",
                        isSelected
                          ? "bg-forge-teal text-white"
                          : "bg-slate-100 dark:bg-white/8 text-muted-foreground",
                      )}
                    >
                      {config.label}
                    </span>
                  </div>
                  <span className="font-sans text-xs font-bold text-ink">
                    +{config.itemsPerDimension * 5 - totalQuestions} more
                    questions
                  </span>
                </div>

                <div className="flex items-center gap-3 relative z-10">
                  <div className="flex flex-col items-end mr-2">
                    <span className="font-sans text-xs text-muted-foreground font-medium lowercase">
                      est. +{config.estimatedMinutes - currentEst} min
                    </span>
                  </div>
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all",
                      isSelected
                        ? "bg-forge-teal border-forge-teal text-white"
                        : "bg-card border-slate-200 dark:border-white/12 text-slate-300 dark:text-white/40 group-hover/btn:border-slate-300 dark:group-hover/btn:border-white/18 group-hover/btn:text-slate-400 dark:group-hover/btn:text-white/60",
                    )}
                  >
                    {isSelected ? (
                      <Check size={16} strokeWidth={3.5} />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-current" />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
      </div>
    </motion.div>
  );
}
