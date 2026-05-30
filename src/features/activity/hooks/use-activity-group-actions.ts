import {
  type QueryClient,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useState } from "react";
import type { CreateGroupPlanPayload } from "@/features/activity/api/activity.api";
import { ActivityCommands } from "@/features/activity/api/activity-commands";
import type { ActivityGroupSelectionData } from "@/features/activity/api/activity-query-data";
import type {
  Group,
  Plan,
  PlanHistoryItem,
} from "@/features/activity/lib/activity-contract";
import { currentUserQueryOptions } from "@/shared/api/current-user-query";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import { trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";
import { useClearActivityRouteSelection } from "./use-clear-activity-route-selection";

type PendingAction =
  | "cancel-plan"
  | "complete-plan"
  | "confirm-plan"
  | "create-next-plan"
  | "disband"
  | "leave"
  | null;

function trackGroupAction(
  mutation: string,
  status: "success" | "error",
  groupId: string,
  requestId?: string | null,
) {
  trackMutationOutcome(mutation, status, { groupId, requestId });
}

export function useActivityGroupActions(groupId: string) {
  const queryClient = useQueryClient();
  const currentUserQuery = useQuery(currentUserQueryOptions());
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [invitingMemberId, setInvitingMemberId] = useState<string | null>(null);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const clearRouteSelection = useClearActivityRouteSelection();

  async function leaveGroup() {
    if (!currentUserQuery.data) {
      return;
    }

    setPendingAction("leave");

    try {
      const result = await ActivityCommands.leaveGroup(
        groupId,
        currentUserQuery.data.id,
      );
      await clearRouteSelection();
      trackGroupAction(
        trackedMutationNames.activityGroupLeave,
        "success",
        groupId,
        result.requestId,
      );
      setPendingAction(null);
    } catch (error) {
      trackGroupAction(
        trackedMutationNames.activityGroupLeave,
        "error",
        groupId,
      );
      setPendingAction(null);
      throw error;
    }
  }

  async function disbandGroup() {
    if (!currentUserQuery.data) {
      return;
    }

    setPendingAction("disband");

    try {
      const result = await ActivityCommands.disbandGroup(
        groupId,
        currentUserQuery.data.id,
      );
      await clearRouteSelection();
      trackGroupAction(
        trackedMutationNames.activityGroupDisband,
        "success",
        groupId,
        result.requestId,
      );
      setPendingAction(null);
    } catch (error) {
      trackGroupAction(
        trackedMutationNames.activityGroupDisband,
        "error",
        groupId,
      );
      setPendingAction(null);
      throw error;
    }
  }

  async function removeMember(memberId: string) {
    if (!currentUserQuery.data) {
      return;
    }

    setRemovingMemberId(memberId);
    const snapshot = await optimisticallyUpdateSelectedGroup(
      queryClient,
      groupId,
      (group) => removeMemberFromGroup(group, memberId),
    );

    try {
      const result = await ActivityCommands.removeGroupMember(
        groupId,
        memberId,
        currentUserQuery.data.id,
      );
      trackMutationOutcome(
        trackedMutationNames.activityGroupRemoveMember,
        "success",
        {
          groupId,
          requestId: result.requestId,
        },
      );
      setRemovingMemberId(null);
    } catch (error) {
      restoreGroupSelection(queryClient, groupId, snapshot);
      trackMutationOutcome(
        trackedMutationNames.activityGroupRemoveMember,
        "error",
        {
          groupId,
        },
      );
      setRemovingMemberId(null);
      throw error;
    }
  }

  async function confirmPlan(planId: string) {
    await runPlanAction(
      "confirm-plan",
      () => ActivityCommands.confirmPlan(planId, groupId),
      (group) => updateGroupPlanStatus(group, planId, "CONFIRMED"),
    );
  }

  async function completePlan(planId: string) {
    await runPlanAction(
      "complete-plan",
      () => ActivityCommands.completePlan(planId, groupId),
      (group) => updateGroupPlanStatus(group, planId, "COMPLETED"),
    );
  }

  async function cancelPlan(planId: string) {
    await runPlanAction(
      "cancel-plan",
      () => ActivityCommands.cancelPlan(planId, groupId),
      (group) => updateGroupPlanStatus(group, planId, "CANCELLED"),
    );
  }

  async function createNextGroupPlan(plan: Plan) {
    await runPlanAction("create-next-plan", () =>
      ActivityCommands.createNextGroupPlan(
        groupId,
        buildCreateNextPlanPayload(plan),
      ),
    );
  }

  async function createPlanFromHistory(plan: PlanHistoryItem) {
    await runPlanAction("create-next-plan", () =>
      ActivityCommands.createNextGroupPlan(
        groupId,
        buildCreateHistoryTemplatePayload(plan),
      ),
    );
  }

  async function runPlanAction(
    action: Exclude<PendingAction, "disband" | "leave" | null>,
    execute: () => Promise<unknown>,
    optimisticUpdate?: (group: Group) => Group,
  ) {
    setPendingAction(action);
    const snapshot = optimisticUpdate
      ? await optimisticallyUpdateSelectedGroup(
          queryClient,
          groupId,
          optimisticUpdate,
        )
      : undefined;

    try {
      await execute();
      setPendingAction(null);
    } catch (error) {
      restoreGroupSelection(queryClient, groupId, snapshot);
      setPendingAction(null);
      throw error;
    }
  }

  async function inviteMember(inviteeId: string) {
    setInvitingMemberId(inviteeId);

    try {
      const result = await ActivityCommands.sendGroupInvite(groupId, inviteeId);
      trackMutationOutcome(
        trackedMutationNames.activityGroupInvite,
        "success",
        {
          groupId,
          requestId: result.requestId,
        },
      );
      setInvitingMemberId(null);
    } catch (error) {
      trackMutationOutcome(trackedMutationNames.activityGroupInvite, "error", {
        groupId,
      });
      setInvitingMemberId(null);
      throw error;
    }
  }

  return {
    currentUserId: currentUserQuery.data?.id ?? null,
    pendingPlanAction: pendingAction,
    isDisbanding: pendingAction === "disband",
    isLeaving: pendingAction === "leave",
    invitingMemberId,
    removingMemberId,
    cancelPlan,
    completePlan,
    confirmPlan,
    createNextGroupPlan,
    createPlanFromHistory,
    disbandGroup,
    inviteMember,
    leaveGroup,
    removeMember,
  };
}

type GroupSelectionSnapshot = ActivityGroupSelectionData | undefined;

async function optimisticallyUpdateSelectedGroup(
  queryClient: QueryClient,
  groupId: string,
  updateGroup: (group: Group) => Group,
): Promise<GroupSelectionSnapshot> {
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

function restoreGroupSelection(
  queryClient: QueryClient,
  groupId: string,
  snapshot: GroupSelectionSnapshot,
) {
  if (snapshot === undefined) {
    return;
  }

  queryClient.setQueryData(
    APP_QUERY_KEYS.activity.groupSelectionById(groupId),
    snapshot,
  );
}

function removeMemberFromGroup(group: Group, memberId: string): Group {
  return {
    ...touchGroup(group),
    members:
      group.members?.filter((member) => member.userId !== memberId) ??
      group.members,
  };
}

function updateGroupPlanStatus(
  group: Group,
  planId: string,
  status: Plan["status"],
): Group {
  if (!group.plan || group.plan.id !== planId) {
    return group;
  }

  const now = new Date().toISOString();

  return {
    ...touchGroup(group, now),
    plan: {
      ...group.plan,
      cancelledAt: status === "CANCELLED" ? now : group.plan.cancelledAt,
      completedAt: status === "COMPLETED" ? now : group.plan.completedAt,
      status,
      updatedAt: now,
      version: Date.parse(now),
    },
  };
}

function touchGroup(group: Group, now = new Date().toISOString()): Group {
  return {
    ...group,
    updatedAt: now,
    version: Date.parse(now),
  };
}

function buildCreateHistoryTemplatePayload(
  plan: PlanHistoryItem,
): CreateGroupPlanPayload {
  const location =
    plan.locationMode === "TBD" ? null : plan.location?.trim() || null;
  const payload: CreateGroupPlanPayload = {
    category: plan.category,
    coverImage: plan.coverImage,
    dateTime: null,
    location,
    locationLat:
      plan.locationMode === "IN_PERSON" && plan.locationLat !== null
        ? plan.locationLat
        : null,
    locationLng:
      plan.locationMode === "IN_PERSON" && plan.locationLng !== null
        ? plan.locationLng
        : null,
    locationMode: location ? plan.locationMode : "TBD",
    title: plan.title,
  };

  if (plan.cost === "FREE") {
    payload.cost = "FREE";
  }

  return payload;
}

function buildCreateNextPlanPayload(plan: Plan): CreateGroupPlanPayload {
  const hasPlace = Boolean(plan.location?.trim());
  const locationMode = hasPlace ? plan.locationMode : "TBD";

  return {
    category: plan.category,
    cost: plan.cost,
    costAmount: plan.cost === "PAID" ? plan.costAmount : null,
    costDetails: plan.costDetails,
    coverImage: plan.coverImage,
    dateTime: null,
    description: plan.description,
    location: locationMode === "TBD" ? null : plan.location,
    locationLat:
      locationMode === "IN_PERSON" && plan.locationLat !== null
        ? plan.locationLat
        : null,
    locationLng:
      locationMode === "IN_PERSON" && plan.locationLng !== null
        ? plan.locationLng
        : null,
    locationMode,
    title: plan.title,
  };
}
