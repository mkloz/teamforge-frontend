import { useEffect, useRef, useState } from "react";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { getBrowserMediaQuery } from "@/shared/lib/browser-environment";
import {
  cancelDelay,
  cancelScheduledAnimationFrame,
  type ScheduledAnimationFrameHandle,
  type ScheduledDelayHandle,
  scheduleAnimationFrame,
  scheduleDelay,
} from "@/shared/lib/browser-scheduling";

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
    let frameId: ScheduledAnimationFrameHandle | null = null;
    let timeoutId: ScheduledDelayHandle | null = null;

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
      frameId = scheduleAnimationFrame(() => {
        scrollLandingFocusTarget(focusRequest.element);
      });
      timeoutId = scheduleDelay(() => {
        setHighlightedTarget(null);
        setHighlightedProposalId(null);
      }, 3600);
    } else {
      setHighlightedTarget(null);
      setHighlightedProposalId(null);
    }

    return () => {
      if (frameId !== null) {
        cancelScheduledAnimationFrame(frameId);
      }

      if (timeoutId !== null) {
        cancelDelay(timeoutId);
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
  const prefersReducedMotion =
    getBrowserMediaQuery("(prefers-reduced-motion: reduce)")?.matches ?? false;

  target?.scrollIntoView({
    behavior: prefersReducedMotion ? "auto" : "smooth",
    block: "start",
  });
}
