import { AnimatePresence, domMax, LazyMotion } from "framer-motion";
import { useInlinePlanStepActions } from "../use-inline-plan-step-actions";
import { CurrentPlanCreationStep } from "./current-plan-creation-step";
import { StepTransitionFrame } from "./step-transition-frame";
import type { InlinePlanStepContentProps } from "./types";

export function InlinePlanStepContent({
  activityShakeRequestId,
  fw,
}: InlinePlanStepContentProps) {
  const actions = useInlinePlanStepActions({ fw });

  return (
    <div className="relative mt-2 flex-1">
      <LazyMotion features={domMax}>
        <AnimatePresence mode="popLayout" initial={false}>
          <StepTransitionFrame navDirection={fw.navDirection} step={fw.step}>
            <CurrentPlanCreationStep
              actions={actions}
              activityShakeRequestId={activityShakeRequestId}
              fw={fw}
            />
          </StepTransitionFrame>
        </AnimatePresence>
      </LazyMotion>
    </div>
  );
}
