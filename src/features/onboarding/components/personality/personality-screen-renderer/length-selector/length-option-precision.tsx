import { motion } from "framer-motion";

import { cn } from "@/shared/lib/utils";

import {
  RESOLUTION_SEGMENTS,
  type getLengthOptionViewModel,
} from "./length-selector-options";

type LengthOptionViewModel = ReturnType<typeof getLengthOptionViewModel>;

interface LengthOptionPrecisionProps {
  isAdjust: boolean;
  viewModel: LengthOptionViewModel;
}

export function LengthOptionPrecision({
  isAdjust,
  viewModel,
}: LengthOptionPrecisionProps) {
  const showProgress = isAdjust && viewModel.answeredCount > 0;

  return (
    <div className="flex flex-col justify-center sm:items-end sm:text-right">
      <p className="mb-2 font-sans text-xs leading-relaxed font-medium text-pretty text-muted-foreground sm:mb-1.5">
        {viewModel.config.sublabel}
      </p>

      <div className="flex w-full items-center gap-2 opacity-80 sm:justify-end">
        <span className="shrink-0 font-sans text-xs font-black tracking-wide text-muted-foreground uppercase">
          {getPrecisionLabel(isAdjust, viewModel)}
        </span>

        {showProgress ? (
          <div className="h-1.5 w-24 shrink-0 overflow-hidden rounded-full bg-slate-100 sm:w-28 dark:bg-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${viewModel.progressPercent}%` }}
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
                  index < viewModel.resolutionSegmentCount
                    ? "bg-forge-teal/40"
                    : "bg-slate-100 dark:bg-white/10",
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getPrecisionLabel(
  isAdjust: boolean,
  viewModel: LengthOptionViewModel,
) {
  if (!isAdjust || viewModel.answeredCount === 0) {
    return "Result detail";
  }

  return viewModel.isComplete
    ? "Completed"
    : `Resume (at ${viewModel.progressPercent}%):`;
}
