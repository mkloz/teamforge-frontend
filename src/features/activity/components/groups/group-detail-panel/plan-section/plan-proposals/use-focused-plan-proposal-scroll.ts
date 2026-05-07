import { useCallback, useEffect, useRef } from "react";

import {
  cancelScheduledAnimationFrame,
  scheduleAnimationFrame,
} from "@/shared/lib/browser-scheduling";
import type { PlanProposal } from "@/shared/schemas/plan";

export function useFocusedPlanProposalScroll(
  focusedProposalId: string | null,
  proposals: PlanProposal[],
) {
  const proposalRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!focusedProposalId) {
      return;
    }

    const target = proposalRefs.current[focusedProposalId];

    if (!target) {
      return;
    }

    const frame = scheduleAnimationFrame(() => {
      target.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });

    return () => {
      cancelScheduledAnimationFrame(frame);
    };
  }, [focusedProposalId, proposals]);

  return useCallback((proposalId: string, element: HTMLDivElement | null) => {
    proposalRefs.current[proposalId] = element;
  }, []);
}
