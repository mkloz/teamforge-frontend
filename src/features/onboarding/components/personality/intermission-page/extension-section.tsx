import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";
import { Sparkles, Check } from "lucide-react";
import { fadeUpItem } from "../../../constants/motion";
import {
  TEST_LENGTH_CONFIG,
  type TestLength,
} from "../../../data/ipip-questions";

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
      className="w-full mb-2 p-5 rounded-2xl bg-spark-amber/5 border border-spark-amber/20 relative overflow-hidden group/extend"
    >
      <div className="absolute top-0 right-0 p-3 opacity-20 text-spark-amber">
        <Sparkles size={40} strokeWidth={1} />
      </div>

      <div className="flex flex-col items-start text-left relative z-10">
        <h3 className="font-sans text-sm font-black text-ink mb-1 flex items-center gap-2">
          <Sparkles size={14} className="text-spark-amber animate-pulse" />
          Unlock Deeper Insights
        </h3>
        <p className="font-sans text-[11px] text-slate-500 font-medium mb-4 max-w-70">
          You've finished your current set, but your profile could be even more
          precise.
        </p>

        <div className="flex flex-col w-full gap-3">
          {(Object.keys(TEST_LENGTH_CONFIG) as unknown as TestLength[])
            .filter((len) => Number(len) > totalQuestions)
            .map((len) => {
              const numLen = Number(len) as TestLength;
              const config = TEST_LENGTH_CONFIG[numLen];
              const isSelected = selectedUpgrade === numLen;
              const isDeep = numLen === 150;

              const currentEst =
                (
                  Object.values(TEST_LENGTH_CONFIG) as Array<{
                    itemsPerDimension: number;
                    estimatedMinutes: number;
                  }>
                ).find((c) => c.itemsPerDimension * 5 === totalQuestions)
                  ?.estimatedMinutes || 0;

              return (
                <button
                  key={len}
                  onClick={() => onSelect(isSelected ? null : numLen)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-xl transition-all cursor-pointer group/btn relative border-2 bg-white shadow-xs active:scale-[0.98]",
                    isSelected
                      ? "border-forge-teal bg-forge-teal/2 shadow-md -translate-y-0.5"
                      : isDeep
                        ? "border-spark-amber/20 hover:border-spark-amber/40 hover:bg-spark-amber/2"
                        : "border-slate-100 hover:border-slate-200 hover:shadow-sm",
                  )}
                >
                  <div className="flex flex-col items-start relative z-10">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className={cn(
                          "font-sans text-[10px] font-black uppercase tracking-widest rounded-full px-2 py-0.5",
                          isSelected
                            ? "bg-forge-teal text-white"
                            : isDeep
                              ? "bg-spark-amber/10 text-spark-amber"
                              : "bg-slate-100 text-slate-500",
                        )}
                      >
                        {config.label}
                      </span>
                      {config.recommended && !isSelected && (
                        <span className="bg-forge-teal text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm">
                          RECOMMENDED
                        </span>
                      )}
                    </div>
                    <span className="font-sans text-xs font-bold text-ink">
                      +{config.itemsPerDimension * 5 - totalQuestions} more
                      questions
                    </span>
                  </div>

                  <div className="flex items-center gap-3 relative z-10">
                    <div className="flex flex-col items-end mr-1">
                      <span className="font-sans text-[10px] text-slate-400 font-medium lowercase">
                        est. +{config.estimatedMinutes - currentEst} min
                      </span>
                    </div>
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
                        isSelected
                          ? "bg-forge-teal border-forge-teal text-white"
                          : isDeep
                            ? "bg-white border-spark-amber/20 text-spark-amber"
                            : "bg-white border-slate-100 text-slate-300 group-hover/btn:border-slate-200 group-hover/btn:text-slate-400",
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
      </div>
    </motion.div>
  );
}
