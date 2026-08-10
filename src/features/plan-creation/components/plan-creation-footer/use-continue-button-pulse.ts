import { useEffect, useRef, useState } from "react";

import type { PlanBuilderState } from "@/features/plan-creation/hooks/use-plan-builder";

export function useContinueButtonPulse(fw: PlanBuilderState) {
  const [continuePulse, setContinuePulse] = useState(false);
  const prevActivity = useRef<string | null>(null);

  useEffect(() => {
    if (
      fw.step === 1 &&
      fw.selectedActivity &&
      fw.selectedActivity !== prevActivity.current
    ) {
      prevActivity.current = fw.selectedActivity;
      const t1 = setTimeout(() => setContinuePulse(true), 0);
      const t2 = setTimeout(() => setContinuePulse(false), 650);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }

    return undefined;
  }, [fw.selectedActivity, fw.step]);

  return continuePulse;
}
