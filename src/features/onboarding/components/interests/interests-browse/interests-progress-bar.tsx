import { ArrowLeft, ArrowRight } from "lucide-react";
import { MAX_INTERESTS } from "@/features/onboarding/data/interests-data";
import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/shared/components/ui/progress";
import {
  getInterestsProgressPercent,
  getInterestsProgressText,
} from "./interests-progress-model";

interface ProgressBarProps {
  backLabel?: string;
  selectedCount: number;
  canContinue: boolean;
  isAtMax: boolean;
  onBack: () => void;
  onContinue: () => void;
}

export function InterestsProgressBar({
  backLabel = "Back",
  selectedCount,
  canContinue,
  isAtMax,
  onBack,
  onContinue,
}: ProgressBarProps) {
  const pct = getInterestsProgressPercent(selectedCount);
  const progressText = getInterestsProgressText({
    selectedCount,
    canContinue,
    isAtMax,
  });

  return (
    <div className="w-full py-3.5">
      <Progress
        aria-label="Interests selection progress"
        className="mb-3 h-1 bg-slate-muted/10"
        indicatorClassName="bg-forge-teal"
        value={pct}
      />
      <div className="flex xs:flex-row flex-col xs:items-center xs:justify-between gap-3 xs:gap-4">
        <div className="min-w-0">
          <span className="font-bold font-sans text-ink text-sm">
            {selectedCount}
            <span className="font-normal text-slate-muted/50">
              {" "}
              / {MAX_INTERESTS}
            </span>
          </span>
          <p className="mt-1 font-bold font-sans text-slate-muted/60 text-xs leading-none">
            {progressText}
          </p>
        </div>
        <div className="xs:flex grid xs:shrink-0 grid-cols-2 items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="min-w-0 shrink-0"
          >
            <ArrowLeft size={14} strokeWidth={2.5} />
            <span className="hidden sm:block">{backLabel}</span>
            <span className="block sm:hidden">Back</span>
          </Button>
          <Button
            size="sm"
            onClick={canContinue ? onContinue : undefined}
            disabled={!canContinue}
            className="min-w-0"
            aria-label={
              canContinue
                ? "Review your selected interests"
                : "Select more interests to continue"
            }
          >
            <span className="hidden sm:block">Review picks</span>
            <span className="block sm:hidden">Continue</span>
            <ArrowRight size={14} strokeWidth={1.5} />
          </Button>
        </div>
      </div>
    </div>
  );
}
