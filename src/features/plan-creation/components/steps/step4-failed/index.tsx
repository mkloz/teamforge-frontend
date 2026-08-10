import { FailureHero } from "./failure-hero";
import { FailureReasons } from "./failure-reasons";
import { FailureRecoveryActions } from "./failure-recovery-actions";
import { FailureSuggestions } from "./failure-suggestions";
import { getStep4FailedContent } from "./step4-failed-content";
import type { Step4FailedProps } from "./types";

export function Step4Failed({
  groupFormationMode,
  onSwitchToManual,
}: Step4FailedProps) {
  const isAuto = groupFormationMode === "AUTO";
  const content = getStep4FailedContent(groupFormationMode);
  const hasRecoveryActions = isAuto && onSwitchToManual;

  return (
    <div className="flex flex-col gap-5 pb-10">
      <FailureHero title={content.title} description={content.description} />
      <FailureReasons context={content.context} reasons={content.reasons} />
      <FailureSuggestions suggestions={content.suggestions} />

      {hasRecoveryActions && (
        <FailureRecoveryActions onSwitchToManual={onSwitchToManual} />
      )}

      <p className="px-2 text-center text-muted-foreground text-xs leading-relaxed">
        Use <span className="font-semibold text-foreground">Try again</span> to
        return to group setup with your plan intact.
      </p>
    </div>
  );
}
