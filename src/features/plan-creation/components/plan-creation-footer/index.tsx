import { domAnimation, LazyMotion } from "framer-motion";

import { FooterActionArea } from "./footer-action-area";
import { MobilePlanReview } from "./mobile-plan-review";
import type { PlanBuilderFooterProps } from "./types";
import { useContinueButtonPulse } from "./use-continue-button-pulse";

export function PlanBuilderFooter({
  fw,
  onDisabledStep1Continue,
}: PlanBuilderFooterProps) {
  const continuePulse = useContinueButtonPulse(fw);

  return (
    <LazyMotion features={domAnimation}>
      <div
        className={
          fw.step === 3
            ? "-mx-4 mt-auto hidden md:-mx-12 md:block"
            : "-mx-4 mt-auto md:-mx-12"
        }
      >
        <FooterActionArea
          continuePulse={continuePulse}
          fw={fw}
          onDisabledStep1Continue={onDisabledStep1Continue}
        />
      </div>
      {fw.step === 3 ? <MobilePlanReview fw={fw} /> : null}
    </LazyMotion>
  );
}
