import type { QueryClient } from "@tanstack/react-query";
import type { CreateGroupPlanPayload } from "@/features/activity/api/activity.api";
import type { ActivityGroupSelectionData } from "@/features/activity/api/activity-query-data";
import type {
  Group,
  Plan,
  PlanHistoryItem,
} from "@/features/activity/lib/activity-contract";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import { trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";

export type PendingActivityGroupAction =
  | "cancel-plan"
  | "complete-plan"
  | "confirm-plan"
  | "create-next-plan"
  | "disband"
  | "leave"
  | null;

export type ActivityGroupPlanAction = Exclude<
  PendingActivityGroupAction,
  "disband" | "leave" | null
>;

export type ActivityGroupMembershipAction = Extract<
  PendingActivityGroupAction,
  "disband" | "leave"
>;

interface ActivityGroupActionGuard {
  description: string;
  id: string;
}

export const ACTIVITY_GROUP_ACTION_GUARDS = {
  disband: {
    description: "Reconnect before disbanding this group.",
    id: "activity-group-disband-offline",
  },
  inviteMember: {
    description: "Reconnect before inviting someone to this group.",
    id: "activity-group-invite-offline",
  },
  leave: {
    description: "Reconnect before leaving this group.",
    id: "activity-group-leave-offline",
  },
  plan: {
    description: "Reconnect before changing this plan.",
    id: "activity-plan-action-offline",
  },
  removeMember: {
    description: "Reconnect before removing a group member.",
    id: "activity-group-remove-member-offline",
  },
} as const satisfies Record<string, ActivityGroupActionGuard>;

const MEMBERSHIP_MUTATION_NAMES = {
  disband: trackedMutationNames.activityGroupDisband,
  leave: trackedMutationNames.activityGroupLeave,
} as const satisfies Record<ActivityGroupMembershipAction, string>;

export function getMembershipMutationName(
  action: ActivityGroupMembershipAction,
) {
  return MEMBERSHIP_MUTATION_NAMES[action];
}

export async function optimisticallyUpdateSelectedGroup(
  queryClient: QueryClient,
  groupId: string,
  updateGroup: (group: Group) => Group,
): Promise<ActivityGroupSelectionData | undefined> {
  const queryKey = APP_QUERY_KEYS.activity.groupSelectionById(groupId);

  await queryClient.cancelQueries({ queryKey });

  const previousSelection =
    queryClient.getQueryData<ActivityGroupSelectionData>(queryKey);

  queryClient.setQueryData<ActivityGroupSelectionData>(queryKey, (current) =>
    current?.group
      ? {
          ...current,
          group: updateGroup(current.group),
        }
      : current,
  );

  return previousSelection;
}

export function restoreGroupSelection(
  queryClient: QueryClient,
  groupId: string,
  snapshot: ActivityGroupSelectionData | undefined,
) {
  if (snapshot === undefined) {
    return;
  }

  queryClient.setQueryData(
    APP_QUERY_KEYS.activity.groupSelectionById(groupId),
    snapshot,
  );
}

export function removeMemberFromGroup(group: Group, memberId: string): Group {
  return {
    ...touchGroup(group),
    members:
      group.members?.filter((member) => member.userId !== memberId) ??
      group.members,
  };
}

export function updateGroupPlanStatus(
  group: Group,
  planId: string,
  status: Plan["status"],
): Group {
  if (group.plan?.id !== planId) {
    return group;
  }

  const now = new Date().toISOString();

  return {
    ...touchGroup(group, now),
    plan: {
      ...group.plan,
      cancelledAt: resolvePlanCancelledAt(group.plan, status, now),
      completedAt: resolvePlanCompletedAt(group.plan, status, now),
      status,
      updatedAt: now,
      version: Date.parse(now),
    },
  };
}

export function trackActivityGroupMutation(
  mutationName: string,
  status: "error" | "success",
  payload: { groupId: string; requestId?: string | null },
) {
  trackMutationOutcome(mutationName, status, payload);
}

export function buildCreateHistoryTemplatePayload(
  plan: PlanHistoryItem,
): CreateGroupPlanPayload {
  const payload: CreateGroupPlanPayload = {
    category: plan.category,
    coverImage: plan.coverImage,
    dateTime: null,
    location: null,
    locationLat: null,
    locationLng: null,
    locationMode: "TBD",
    repeatMode: "SAME_GROUP",
    sourcePlanId: plan.id,
    title: plan.title,
  };

  return withHistoryTemplateCost(payload, plan.cost);
}

export function buildCreateNextPlanPayload(plan: Plan): CreateGroupPlanPayload {
  return {
    category: plan.category,
    cost: plan.cost,
    costAmount: resolvePaidCostAmount(plan),
    costDetails: plan.costDetails,
    coverImage: plan.coverImage,
    dateTime: null,
    description: plan.description,
    location: null,
    locationLat: null,
    locationLng: null,
    locationMode: "TBD",
    repeatMode: "SAME_GROUP",
    sourcePlanId: plan.id,
    title: plan.title,
  };
}

function resolvePlanCancelledAt(
  plan: Plan,
  status: Plan["status"],
  now: string,
) {
  return status === "CANCELLED" ? now : plan.cancelledAt;
}

function resolvePlanCompletedAt(
  plan: Plan,
  status: Plan["status"],
  now: string,
) {
  return status === "COMPLETED" ? now : plan.completedAt;
}

function withHistoryTemplateCost(
  payload: CreateGroupPlanPayload,
  cost: PlanHistoryItem["cost"],
) {
  return cost === "FREE" ? { ...payload, cost: "FREE" as const } : payload;
}

function resolvePaidCostAmount(plan: Plan) {
  return plan.cost === "PAID" ? plan.costAmount : null;
}

function touchGroup(group: Group, now = new Date().toISOString()): Group {
  return {
    ...group,
    updatedAt: now,
    version: Date.parse(now),
  };
}
