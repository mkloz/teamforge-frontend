import type { TestLength } from "@/features/onboarding/data/ipip-questions";

import type { getLengthOptionViewModel } from "./length-selector-options";

type LengthOptionViewModel = ReturnType<typeof getLengthOptionViewModel>;

interface LengthOptionSummaryProps {
  isAdjust: boolean;
  length: TestLength;
  viewModel: LengthOptionViewModel;
}

export function LengthOptionSummary({
  isAdjust,
  length,
  viewModel,
}: LengthOptionSummaryProps) {
  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="font-sans text-base font-extrabold leading-tight text-ink">
          {viewModel.config.label}
        </span>
        {isAdjust && viewModel.isComplete ? (
          <span className="shrink-0 rounded-full bg-forge-teal px-1.5 py-px font-sans text-[0.6rem] font-black uppercase tracking-wide text-white">
            Done
          </span>
        ) : null}
      </div>
      <span className="font-sans text-xs font-bold text-muted-foreground">
        {length} items &middot; ~{viewModel.config.estimatedMinutes} min
      </span>
    </div>
  );
}
