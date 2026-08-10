import { m } from "framer-motion";

import { cn } from "@/shared/lib/utils";

import {
  type getLengthOptionViewModel,
  RESOLUTION_SEGMENTS,
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
      <p className="mb-2 text-pretty font-medium font-sans text-muted-foreground text-xs leading-relaxed sm:mb-1.5">
        {viewModel.config.sublabel}
      </p>

      <div className="flex w-full items-center gap-2 opacity-80 sm:justify-end">
        <span className="shrink-0 font-bold font-sans text-muted-foreground text-xs">
          {getPrecisionLabel(isAdjust, viewModel)}
        </span>

        {showProgress ? (
          <div className="h-1.5 w-24 shrink-0 overflow-hidden rounded-full bg-muted sm:w-28 dark:bg-white/10">
            <m.div
              initial={{ width: 0 }}
              animate={{ width: `${viewModel.progressPercent}%` }}
              className="h-full bg-brand-teal"
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
                    ? "bg-brand-teal/40"
                    : "bg-muted dark:bg-white/10",
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
