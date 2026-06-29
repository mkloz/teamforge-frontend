import { m } from "framer-motion";
import type { ReactNode } from "react";

import type { ForgeWizardState } from "@/features/forge/hooks/use-forge-wizard";

interface StepTransitionFrameProps {
  children: ReactNode;
  navDirection: ForgeWizardState["navDirection"];
  step: ForgeWizardState["step"];
}

export function StepTransitionFrame({
  children,
  navDirection,
  step,
}: StepTransitionFrameProps) {
  return (
    <m.div
      key={step}
      initial={{
        opacity: 0,
        x: navDirection === "forward" ? 24 : -24,
      }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: navDirection === "forward" ? -24 : 24 }}
      transition={{
        duration: 0.35,
        ease: [0.32, 0.72, 0, 1],
      }}
      className="flex w-full flex-col py-4"
    >
      {children}
    </m.div>
  );
}
