import type { HomeViewer } from "@/features/home/lib/home-contract";
import type {
  AttentionQueueFriendRequest,
  AttentionQueueInvitation,
  AttentionQueueParticipation,
  AttentionQueuePlan,
} from "./attention-queue.types";
import { formatQueueCount } from "./attention-queue-formatters";

const COLLAPSED_QUEUE_ITEM_LIMIT = 2;

interface AttentionQueueRenderStateInput {
  pendingParticipations: AttentionQueueParticipation[];
  proposedPlans: AttentionQueuePlan[];
  queueSize: number;
  shouldShowSkeleton: boolean;
  viewer: HomeViewer;
  visibleInvitations: AttentionQueueInvitation[];
  visibleRequests: AttentionQueueFriendRequest[];
}

export type AttentionQueueRenderItem =
  | {
      invite: AttentionQueueInvitation;
      kind: "invitation";
    }
  | {
      kind: "request";
      request: AttentionQueueFriendRequest;
    }
  | {
      group: AttentionQueuePlan;
      kind: "plan";
    }
  | {
      group: AttentionQueueParticipation;
      kind: "participation";
    }
  | {
      kind: "profile";
      nextStep: NonNullable<HomeViewer["nextStep"]>;
    }
  | {
      hiddenItemCount: number;
      kind: "see-rest";
    };

export function getAttentionQueueRenderState({
  pendingParticipations,
  proposedPlans,
  queueSize,
  shouldShowSkeleton,
  viewer,
  visibleInvitations,
  visibleRequests,
}: AttentionQueueRenderStateInput) {
  const renderedInvitations = getCollapsedQueueItems(visibleInvitations);
  const renderedRequests = getCollapsedQueueItems(visibleRequests);
  const renderedParticipations = getCollapsedQueueItems(pendingParticipations);
  const renderedPlans = getCollapsedQueueItems(proposedPlans);
  const collapsedQueueSize = getCollapsedQueueSize({
    pendingParticipations,
    proposedPlans,
    viewer,
    visibleInvitations,
    visibleRequests,
  });
  const hiddenItemCount = getHiddenItemCount(queueSize, collapsedQueueSize);

  return {
    queueItems: shouldShowSkeleton
      ? []
      : getQueueItems({
          hiddenItemCount,
          renderedInvitations,
          renderedParticipations,
          renderedPlans,
          renderedRequests,
          viewer,
        }),
    queueSummary: getQueueSummary({
      pendingParticipations,
      proposedPlans,
      viewer,
      visibleInvitations,
      visibleRequests,
    }),
    shouldShowEmptyQueue: !shouldShowSkeleton && queueSize === 0,
  };
}

function getCollapsedQueueItems<Item>(items: Item[]) {
  return items.slice(0, COLLAPSED_QUEUE_ITEM_LIMIT);
}

function getCollapsedQueueSize({
  pendingParticipations,
  proposedPlans,
  viewer,
  visibleInvitations,
  visibleRequests,
}: Omit<AttentionQueueRenderStateInput, "queueSize" | "shouldShowSkeleton">) {
  return (
    getCollapsedItemCount(visibleInvitations) +
    getCollapsedItemCount(visibleRequests) +
    getCollapsedItemCount(pendingParticipations) +
    getCollapsedItemCount(proposedPlans) +
    (viewer.nextStep ? 1 : 0)
  );
}

function getCollapsedItemCount(items: readonly unknown[]) {
  return Math.min(items.length, COLLAPSED_QUEUE_ITEM_LIMIT);
}

function getHiddenItemCount(queueSize: number, collapsedQueueSize: number) {
  return Math.max(queueSize - collapsedQueueSize, 0);
}

function getQueueItems({
  hiddenItemCount,
  renderedInvitations,
  renderedParticipations,
  renderedPlans,
  renderedRequests,
  viewer,
}: {
  hiddenItemCount: number;
  renderedInvitations: AttentionQueueInvitation[];
  renderedParticipations: AttentionQueueParticipation[];
  renderedPlans: AttentionQueuePlan[];
  renderedRequests: AttentionQueueFriendRequest[];
  viewer: HomeViewer;
}): AttentionQueueRenderItem[] {
  return [
    ...renderedInvitations.map((invite) => ({
      invite,
      kind: "invitation" as const,
    })),
    ...renderedRequests.map((request) => ({
      kind: "request" as const,
      request,
    })),
    ...renderedParticipations.map((group) => ({
      group,
      kind: "participation" as const,
    })),
    ...renderedPlans.map((group) => ({
      group,
      kind: "plan" as const,
    })),
    ...(viewer.nextStep
      ? [
          {
            kind: "profile" as const,
            nextStep: viewer.nextStep,
          },
        ]
      : []),
    ...(hiddenItemCount > 0
      ? [
          {
            hiddenItemCount,
            kind: "see-rest" as const,
          },
        ]
      : []),
  ];
}

function getQueueSummary({
  pendingParticipations,
  proposedPlans,
  viewer,
  visibleInvitations,
  visibleRequests,
}: Omit<AttentionQueueRenderStateInput, "queueSize" | "shouldShowSkeleton">) {
  return [
    formatQueueCount(visibleInvitations.length, "invite"),
    formatQueueCount(visibleRequests.length, "request"),
    formatQueueCount(pendingParticipations.length, "check-in"),
    formatQueueCount(proposedPlans.length, "plan"),
    viewer.nextStep ? "1 setup" : null,
  ].filter(isQueueSummaryItem);
}

function isQueueSummaryItem(item: string | null): item is string {
  return item !== null;
}
