import { AnimatePresence, m } from "framer-motion";
import { AlertCircle } from "lucide-react";

import { Notice } from "@/shared/components/ui/notice";
import type { ForgeFooterChildProps } from "./types";

type ForgeFooterState = ForgeFooterChildProps["fw"];

const PLAN_VALIDATION_STEP = 3;
const UNSET_LOCATION_TYPE = "TBD";

export function FooterValidationHints({ fw }: ForgeFooterChildProps) {
  const planValidationMessage = fw.forgeValidationMessage;
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
            className="rounded-xl border-spark-amber/20 bg-spark-amber/8 px-3 py-2.5"
            contentClassName="font-semibold text-muted-foreground/90 leading-snug"
          >
            <p>{planValidationMessage}</p>
          </Notice>
        </m.div>
      )}
    </AnimatePresence>
  );
}

function shouldShowFooterPlanValidation(fw: ForgeFooterState) {
  return [
    isPlanValidationStep(fw),
    hasBlockingPlanValidation(fw),
    hasStartedPlanDetails(fw),
  ].every(Boolean);
}

function isPlanValidationStep(fw: ForgeFooterState) {
  return fw.step === PLAN_VALIDATION_STEP;
}

function hasBlockingPlanValidation(fw: ForgeFooterState) {
  return [!fw.canAdvanceStep2, Boolean(fw.forgeValidationMessage)].every(
    Boolean,
  );
}

function hasStartedPlanDetails(fw: ForgeFooterState) {
  return [hasEnteredPlanText(fw), hasSelectedPlanLocation(fw)].some(Boolean);
}

function hasEnteredPlanText(fw: ForgeFooterState) {
  return [fw.planName.trim(), fw.planDate, fw.planTime].some(hasText);
}

function hasSelectedPlanLocation(fw: ForgeFooterState) {
  return fw.locationType !== UNSET_LOCATION_TYPE;
}

function hasText(value: string) {
  return value.length > 0;
}
