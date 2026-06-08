import { useEffect, useRef, useState } from "react";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";

type HighlightedTarget = "plan" | "planning" | null;

interface UseGroupPlanDetailLandingFocusInput {
  detail: GroupPlanDetail;
  planId?: string;
  proposalId?: string;
}

export function useGroupPlanDetailLandingFocus({
  detail,
  planId,
  proposalId,
}: UseGroupPlanDetailLandingFocusInput) {
  const planSectionRef = useRef<HTMLElement>(null);
  const planningSectionRef = useRef<HTMLElement>(null);
  const [highlightedTarget, setHighlightedTarget] =
    useState<HighlightedTarget>(null);
  const [highlightedProposalId, setHighlightedProposalId] = useState<
    string | null
  >(null);

  useEffect(() => {
    let frameId: number | null = null;
    let timeoutId: number | null = null;

    if (planId || proposalId) {
      const proposalIsVisible = Boolean(
        proposalId &&
          detail.planning.proposals.some(
            (proposal) => proposal.id === proposalId,
          ),
      );
      const shouldFocusPlanning = Boolean(proposalId);
      const target = shouldFocusPlanning
        ? planningSectionRef.current
        : planSectionRef.current;

      setHighlightedTarget(shouldFocusPlanning ? "planning" : "plan");
      setHighlightedProposalId(proposalIsVisible ? (proposalId ?? null) : null);

      frameId = window.requestAnimationFrame(() => {
        const prefersReducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;

        target?.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start",
        });
      });
      timeoutId = window.setTimeout(() => {
        setHighlightedTarget(null);
        setHighlightedProposalId(null);
      }, 3600);
    } else {
      setHighlightedTarget(null);
      setHighlightedProposalId(null);
    }

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [detail.planning.proposals, planId, proposalId]);

  return {
    highlightedProposalId,
    isPlanHighlighted: highlightedTarget === "plan",
    isPlanningHighlighted: highlightedTarget === "planning",
    planSectionRef,
    planningSectionRef,
  };
}
