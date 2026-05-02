import type {
  FriendshipApi,
  GroupApi,
  PlanProposal,
  PlanUpdateKind,
} from "@/shared/schemas";

import type { Group, Plan } from "@/features/activity/lib/activity-contract";

export function getGroupVersion(
  group:
    | Pick<GroupApi, "updatedAt" | "version">
    | Pick<Group, "updatedAt" | "version">,
) {
  return group.version ?? new Date(group.updatedAt).getTime();
}

export function getFriendshipVersion(friendship: FriendshipApi) {
  return friendship.version ?? new Date(friendship.updatedAt).getTime();
}

export function getPlanVersion(
  plan: Pick<Plan, "createdAt" | "updatedAt" | "version">,
) {
  return plan.version ?? new Date(plan.updatedAt ?? plan.createdAt).getTime();
}

export function getProposalVersion(
  proposal: Pick<PlanProposal, "createdAt" | "updatedAt" | "version">,
) {
  return (
    proposal.version ??
    new Date(proposal.updatedAt ?? proposal.createdAt).getTime()
  );
}

export function isSameFriendshipPair(
  requesterId: string,
  receiverId: string,
  friendship: Pick<FriendshipApi, "requesterId" | "receiverId">,
) {
  return (
    (requesterId === friendship.requesterId &&
      receiverId === friendship.receiverId) ||
    (requesterId === friendship.receiverId &&
      receiverId === friendship.requesterId)
  );
}

export function mergeProposalIntoList(
  currentProposals: PlanProposal[],
  proposal: PlanProposal,
  kind: PlanUpdateKind,
) {
  const existingProposal = currentProposals.find(
    (item) => item.id === proposal.id,
  );
  const nextProposal =
    existingProposal &&
    getProposalVersion(existingProposal) > getProposalVersion(proposal)
      ? existingProposal
      : proposal;
  const withoutExisting = currentProposals.filter(
    (item) => item.id !== proposal.id,
  );

  if (kind === "proposal_created") {
    return [nextProposal, ...withoutExisting];
  }

  return [nextProposal, ...withoutExisting].sort(
    (left, right) => getProposalVersion(right) - getProposalVersion(left),
  );
}

export function mergeFriendshipList(
  current: FriendshipApi[] | undefined,
  incoming: FriendshipApi,
) {
  const existing = current?.find((item) =>
    isSameFriendshipPair(item.requesterId, item.receiverId, incoming),
  );
  const nextFriendship =
    existing && getFriendshipVersion(existing) > getFriendshipVersion(incoming)
      ? existing
      : incoming;
  const withoutExisting =
    current?.filter(
      (item) =>
        !isSameFriendshipPair(item.requesterId, item.receiverId, incoming),
    ) ?? [];

  return [nextFriendship, ...withoutExisting].sort(
    (left, right) => getFriendshipVersion(right) - getFriendshipVersion(left),
  );
}
