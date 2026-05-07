import { FailureHero } from "./failure-hero";
import { FailureReasons } from "./failure-reasons";
import { FailureRecoveryActions } from "./failure-recovery-actions";
import { FailureSuggestions } from "./failure-suggestions";
import { getStep4FailedContent } from "./step4-failed-content";
import type { Step4FailedProps } from "./types";

export function Step4Failed({
  forgeMode,
  isKeepSearchingEnabled = false,
  isKeepingSearch = false,
  onKeepSearchingChange,
  onSwitchToManual,
}: Step4FailedProps) {
  const isAuto = forgeMode === "AUTO";
  const content = getStep4FailedContent(forgeMode);
  const hasRecoveryActions =
    isAuto && (onKeepSearchingChange || onSwitchToManual);

  return (
    <div className="flex animate-in flex-col gap-5 pb-10 duration-500 fade-in slide-in-from-bottom-2">
      <FailureHero description={content.description} />
      <FailureReasons context={content.context} reasons={content.reasons} />
      <FailureSuggestions suggestions={content.suggestions} />

      {hasRecoveryActions && (
        <FailureRecoveryActions
          isKeepSearchingEnabled={isKeepSearchingEnabled}
          isKeepingSearch={isKeepingSearch}
          onKeepSearchingChange={onKeepSearchingChange}
          onSwitchToManual={onSwitchToManual}
        />
      )}

      <p className="border-t border-border/30 pt-4 text-center text-xs leading-relaxed text-muted-foreground">
        Use <span className="font-semibold text-foreground">Try again</span> to
        return to group setup with your plan intact.
      </p>
    </div>
  );
}
