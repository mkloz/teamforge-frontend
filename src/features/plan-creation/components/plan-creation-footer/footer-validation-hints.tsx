import { AnimatePresence, m } from "framer-motion";
import { AlertCircle } from "lucide-react";

import { Notice } from "@/shared/components/ui/notice";
import type { PlanBuilderFooterChildProps } from "./types";

type PlanBuilderFooterState = PlanBuilderFooterChildProps["fw"];

const PLAN_VALIDATION_STEP = 3;
const UNSET_LOCATION_TYPE = "TBD";

export function FooterValidationHints({ fw }: PlanBuilderFooterChildProps) {
  const planValidationMessage = fw.planCreationValidationMessage;
  const shouldShowPlanValidation = shouldShowFooterPlanValidation(fw);

  return (
    <AnimatePresence>
      {shouldShowPlanValidation && (
        <m.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
        >
          <Notice
            role="status"
            tone="warning"
            size="xs"
            icon={<AlertCircle aria-hidden="true" className="size-3.5" />}
            iconClassName="mt-0.5"
            className="rounded-xl border-brand-amber/20 bg-accent-soft px-3 py-2.5"
            contentClassName="font-semibold text-muted-foreground/90 leading-snug"
          >
            <p>{planValidationMessage}</p>
          </Notice>
        </m.div>
      )}
    </AnimatePresence>
  );
}

function shouldShowFooterPlanValidation(fw: PlanBuilderFooterState) {
  return [
    isPlanValidationStep(fw),
    hasBlockingPlanValidation(fw),
    hasStartedPlanDetails(fw),
  ].every(Boolean);
}

function isPlanValidationStep(fw: PlanBuilderFooterState) {
  return fw.step === PLAN_VALIDATION_STEP;
}

function hasBlockingPlanValidation(fw: PlanBuilderFooterState) {
  return [!fw.canAdvanceStep2, Boolean(fw.planCreationValidationMessage)].every(
    Boolean,
  );
}

function hasStartedPlanDetails(fw: PlanBuilderFooterState) {
  return [hasEnteredPlanText(fw), hasSelectedPlanLocation(fw)].some(Boolean);
}

function hasEnteredPlanText(fw: PlanBuilderFooterState) {
  return [fw.planName.trim(), fw.planDate, fw.planTime].some(hasText);
}

function hasSelectedPlanLocation(fw: PlanBuilderFooterState) {
  return fw.locationType !== UNSET_LOCATION_TYPE;
}

function hasText(value: string) {
  return value.length > 0;
}
