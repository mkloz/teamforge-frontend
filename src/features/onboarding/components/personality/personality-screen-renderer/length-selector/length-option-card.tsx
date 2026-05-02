import { Card } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { memo } from "react";

import type { TestLength } from "@/features/onboarding/data/ipip-questions";
import {
  getLengthConfig,
  getLengthProgress,
  getResolutionSegmentCount,
  RESOLUTION_SEGMENTS,
} from "./length-selector-options";

interface LengthOptionCardProps {
  answers?: Record<number, number>;
  isAdjust?: boolean;
  isSelected: boolean;
  length: TestLength;
  onSelect: (length: TestLength) => void;
}

export const LengthOptionCard = memo(function LengthOptionCard({
  answers = {},
  isAdjust = false,
  isSelected,
  length,
  onSelect,
}: LengthOptionCardProps) {
  const config = getLengthConfig(length);
  const isRecommended = config.recommended;
  const { answeredCount, isComplete, progressPercent } = getLengthProgress(
    length,
    answers,
  );
  const resolutionSegmentCount = getResolutionSegmentCount(length);

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => onSelect(length)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(length);
        }
      }}
      className={cn(
        "relative overflow-hidden w-full text-left p-5 transition-all duration-300 cursor-pointer border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/20 bg-card text-card-foreground",
        isSelected
          ? "border-forge-teal/30 bg-card shadow-[0_8px_308px_rgba(13,148,136,0.08)] dark:shadow-[0_8px_32px_rgba(20,184,166,0.12)]"
          : isRecommended
            ? "border-forge-teal/10 bg-card shadow-xs hover:border-forge-teal/20 dark:border-forge-teal/20"
            : "border-border bg-card shadow-none hover:shadow-sm hover:border-slate-200 dark:hover:border-white/15",
      )}
    >
      {isSelected && (
        <motion.div
          layoutId="length-selection-bg"
          className="absolute inset-0 bg-forge-teal/1.5 pointer-events-none"
          initial={false}
          transition={{ type: "spring", stiffness: 400, damping: 35 }}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_1px_1fr] items-center gap-4 sm:gap-6 relative z-10">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex items-center justify-center shrink-0 rounded-full transition-all duration-300 w-5 h-5 border-2",
              isSelected ? "border-forge-teal" : "border-slate-300",
            )}
          >
            <AnimatePresence mode="wait">
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="w-2.5 h-2.5 bg-forge-teal rounded-full"
                />
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
              <span className="font-sans text-base font-extrabold text-ink leading-tight">
                {config.label}
              </span>
              {isAdjust && isComplete && (
                <span className="font-sans text-xs font-black uppercase tracking-wide bg-forge-teal text-white px-2 py-0.5 rounded-full shrink-0">
                  Done
                </span>
              )}
            </div>
            <span className="font-sans text-xs font-bold text-muted-foreground">
              {length} items &middot; ~{config.estimatedMinutes} min
            </span>
          </div>
        </div>

        <div className="hidden sm:block w-full h-10 bg-slate-100/80 dark:bg-white/8" />

        <div className="flex flex-col justify-center">
          <p className="font-sans text-xs text-muted-foreground font-medium leading-relaxed mb-2 sm:mb-1.5 text-pretty">
            {config.sublabel}
          </p>

          <div className="flex items-center gap-2 opacity-80">
            <span className="font-sans text-xs font-black text-muted-foreground uppercase tracking-wide">
              {isAdjust && answeredCount > 0
                ? isComplete
                  ? "Completed"
                  : `Resume (at ${progressPercent}%):`
                : "Match Precision:"}
            </span>

            {isAdjust && answeredCount > 0 ? (
              <div className="flex-1 h-1.5 bg-slate-100 dark:bg-white/10 rounded-full max-w-30 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  className="h-full bg-forge-teal"
                />
              </div>
            ) : (
              <div className="flex gap-1">
                {RESOLUTION_SEGMENTS.map((index) => (
                  <div
                    key={index}
                    className={cn(
                      "h-1.5 w-3 rounded-full transition-colors",
                      index < resolutionSegmentCount
                        ? "bg-forge-teal/40"
                        : "bg-slate-100 dark:bg-white/10",
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
});
