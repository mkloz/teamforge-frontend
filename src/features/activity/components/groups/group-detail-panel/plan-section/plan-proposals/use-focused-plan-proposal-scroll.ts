import { useCallback, useEffect, useRef } from "react";

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

    const frame = window.requestAnimationFrame(() => {
      target.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [focusedProposalId, proposals]);

  return useCallback((proposalId: string, element: HTMLDivElement | null) => {
    proposalRefs.current[proposalId] = element;
  }, []);
}
