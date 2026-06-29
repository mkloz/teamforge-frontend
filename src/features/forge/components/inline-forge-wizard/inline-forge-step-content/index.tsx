import { AnimatePresence, domMax, LazyMotion } from "framer-motion";
import { useInlineForgeStepActions } from "../use-inline-forge-step-actions";
import { CurrentForgeStep } from "./current-forge-step";
import { StepTransitionFrame } from "./step-transition-frame";
import type { InlineForgeStepContentProps } from "./types";

export function InlineForgeStepContent({
  activityShakeRequestId,
  fw,
}: InlineForgeStepContentProps) {
  const actions = useInlineForgeStepActions({ fw });

  return (
    <div className="relative mt-2 flex-1">
      <LazyMotion features={domMax}>
        <AnimatePresence mode="popLayout" initial={false}>
          <StepTransitionFrame navDirection={fw.navDirection} step={fw.step}>
            <CurrentForgeStep
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
