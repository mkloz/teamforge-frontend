import type {
  AttentionQueueContinuation,
  AttentionQueueFriendRequest,
  AttentionQueueInvitation,
  AttentionQueueParticipation,
  AttentionQueuePlan,
} from "./attention-queue.types";
import { formatQueueCount } from "./attention-queue-formatters";

const COLLAPSED_QUEUE_ITEM_LIMIT = 2;

interface AttentionQueueRenderStateInput {
  continuationCheckIns: AttentionQueueContinuation[];
  pendingParticipations: AttentionQueueParticipation[];
  proposedPlans: AttentionQueuePlan[];
  queueSize: number;
  shouldShowSkeleton: boolean;
  visibleInvitations: AttentionQueueInvitation[];
  visibleRequests: AttentionQueueFriendRequest[];
  maxVisibleItems?: number;
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
      group: AttentionQueueContinuation;
      kind: "continuation";
    }
  | {
      hiddenItemCount: number;
      kind: "see-rest";
    };

export function getAttentionQueueRenderState({
  continuationCheckIns,
  pendingParticipations,
  proposedPlans,
  queueSize,
  shouldShowSkeleton,
  visibleInvitations,
  visibleRequests,
  maxVisibleItems,
}: AttentionQueueRenderStateInput) {
  const renderedInvitations = getCollapsedQueueItems(visibleInvitations);
  const renderedRequests = getCollapsedQueueItems(visibleRequests);
  const renderedParticipations = getCollapsedQueueItems(pendingParticipations);
  const renderedContinuationCheckIns =
    getCollapsedQueueItems(continuationCheckIns);
  const renderedPlans = getCollapsedQueueItems(proposedPlans);
  const collapsedQueueSize = getCollapsedQueueSize({
    continuationCheckIns,
    pendingParticipations,
    proposedPlans,
    visibleInvitations,
    visibleRequests,
  });
  const hiddenItemCount = getHiddenItemCount(queueSize, collapsedQueueSize);

  const queueItems = shouldShowSkeleton
    ? []
    : getQueueItems({
        hiddenItemCount,
        renderedContinuationCheckIns,
        renderedInvitations,
        renderedParticipations,
        renderedPlans,
        renderedRequests,
      });

  return {
    queueItems: limitQueueItems(queueItems, queueSize, maxVisibleItems),
    queueSummary: getQueueSummary({
      continuationCheckIns,
      pendingParticipations,
      proposedPlans,
      visibleInvitations,
      visibleRequests,
    }),
    shouldShowEmptyQueue: !shouldShowSkeleton && queueSize === 0,
  };
}

function limitQueueItems(
  items: AttentionQueueRenderItem[],
  queueSize: number,
  maxVisibleItems?: number,
) {
  if (!maxVisibleItems || maxVisibleItems < 1) {
    return items;
  }

  const queueItems = items.filter((item) => item.kind !== "see-rest");
  const visibleItems = getVariedQueueItems(queueItems, maxVisibleItems);
  const hiddenItemCount = Math.max(queueSize - visibleItems.length, 0);

  return hiddenItemCount > 0
    ? [
        ...visibleItems,
        {
          hiddenItemCount,
          kind: "see-rest" as const,
        },
      ]
    : visibleItems;
}

function getVariedQueueItems(
  items: AttentionQueueRenderItem[],
  maxVisibleItems: number,
) {
  const visibleItems: AttentionQueueRenderItem[] = [];
  const representedKinds = new Set<AttentionQueueRenderItem["kind"]>();

  for (const item of items) {
    if (representedKinds.has(item.kind)) {
      continue;
    }

    visibleItems.push(item);
    representedKinds.add(item.kind);

    if (visibleItems.length === maxVisibleItems) {
      return visibleItems;
    }
  }

  for (const item of items) {
    if (visibleItems.includes(item)) {
      continue;
    }

    visibleItems.push(item);

    if (visibleItems.length === maxVisibleItems) {
      break;
    }
  }

  return visibleItems;
}

function getCollapsedQueueItems<Item>(items: Item[]) {
  return items.slice(0, COLLAPSED_QUEUE_ITEM_LIMIT);
}

function getCollapsedQueueSize({
  continuationCheckIns,
  pendingParticipations,
  proposedPlans,
  visibleInvitations,
  visibleRequests,
}: Omit<AttentionQueueRenderStateInput, "queueSize" | "shouldShowSkeleton">) {
  return (
    getCollapsedItemCount(visibleInvitations) +
    getCollapsedItemCount(visibleRequests) +
    getCollapsedItemCount(pendingParticipations) +
    getCollapsedItemCount(continuationCheckIns) +
    getCollapsedItemCount(proposedPlans)
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
  renderedContinuationCheckIns,
  renderedInvitations,
  renderedParticipations,
  renderedPlans,
  renderedRequests,
}: {
  hiddenItemCount: number;
  renderedContinuationCheckIns: AttentionQueueContinuation[];
  renderedInvitations: AttentionQueueInvitation[];
  renderedParticipations: AttentionQueueParticipation[];
  renderedPlans: AttentionQueuePlan[];
  renderedRequests: AttentionQueueFriendRequest[];
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
    ...renderedContinuationCheckIns.map((group) => ({
      group,
      kind: "continuation" as const,
    })),
    ...renderedPlans.map((group) => ({
      group,
      kind: "plan" as const,
    })),
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
  continuationCheckIns,
  pendingParticipations,
  proposedPlans,
  visibleInvitations,
  visibleRequests,
}: Omit<AttentionQueueRenderStateInput, "queueSize" | "shouldShowSkeleton">) {
  return [
    formatQueueCount(visibleInvitations.length, "invite"),
    formatQueueCount(visibleRequests.length, "request"),
    formatQueueCount(
      pendingParticipations.length + continuationCheckIns.length,
      "check-in",
    ),
    formatQueueCount(proposedPlans.length, "plan"),
  ].filter(isQueueSummaryItem);
}

function isQueueSummaryItem(item: string | null): item is string {
  return item !== null;
}
