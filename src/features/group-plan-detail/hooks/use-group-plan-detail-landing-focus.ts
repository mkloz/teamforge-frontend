import { useEffect, useRef, useState } from "react";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";

type HighlightedTarget = "plan" | "planning" | null;
type LandingFocusTarget = Exclude<HighlightedTarget, null>;

interface UseGroupPlanDetailLandingFocusInput {
  detail: GroupPlanDetail;
  planId?: string;
  proposalId?: string;
}

interface LandingFocusRequest {
  element: HTMLElement | null;
  highlightedProposalId: string | null;
  highlightedTarget: LandingFocusTarget;
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

    const focusRequest = getLandingFocusRequest({
      planElement: planSectionRef.current,
      planId,
      planningElement: planningSectionRef.current,
      proposalId,
      proposals: detail.planning.proposals,
    });

    if (focusRequest) {
      setHighlightedTarget(focusRequest.highlightedTarget);
      setHighlightedProposalId(focusRequest.highlightedProposalId);
      frameId = window.requestAnimationFrame(() => {
        scrollLandingFocusTarget(focusRequest.element);
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

function getLandingFocusRequest({
  planElement,
  planId,
  planningElement,
  proposalId,
  proposals,
}: {
  planElement: HTMLElement | null;
  planId?: string;
  planningElement: HTMLElement | null;
  proposalId?: string;
  proposals: GroupPlanDetail["planning"]["proposals"];
}): LandingFocusRequest | null {
  if (!hasLandingFocusParams({ planId, proposalId })) {
    return null;
  }

  const shouldFocusPlanning = Boolean(proposalId);

  return {
    element: shouldFocusPlanning ? planningElement : planElement,
    highlightedProposalId: getHighlightedProposalId(proposalId, proposals),
    highlightedTarget: shouldFocusPlanning ? "planning" : "plan",
  };
}

function hasLandingFocusParams({
  planId,
  proposalId,
}: {
  planId?: string;
  proposalId?: string;
}) {
  return Boolean(planId || proposalId);
}

function getHighlightedProposalId(
  proposalId: string | undefined,
  proposals: GroupPlanDetail["planning"]["proposals"],
) {
  return isProposalVisible(proposalId, proposals) ? (proposalId ?? null) : null;
}

function isProposalVisible(
  proposalId: string | undefined,
  proposals: GroupPlanDetail["planning"]["proposals"],
) {
  return Boolean(
    proposalId && proposals.some((proposal) => proposal.id === proposalId),
  );
}

function scrollLandingFocusTarget(target: HTMLElement | null) {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  target?.scrollIntoView({
    behavior: prefersReducedMotion ? "auto" : "smooth",
    block: "start",
  });
}
