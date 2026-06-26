import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ActivityCommands } from "@/features/activity/api/activity-commands";
import type {
  Group,
  Plan,
  PlanHistoryItem,
} from "@/features/activity/lib/activity-contract";
import { currentUserQueryOptions } from "@/shared/api/current-user-query";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";
import {
  ACTIVITY_GROUP_ACTION_GUARDS,
  type ActivityGroupMembershipAction,
  type ActivityGroupPlanAction,
  buildCreateHistoryTemplatePayload,
  buildCreateNextPlanPayload,
  getMembershipMutationName,
  optimisticallyUpdateSelectedGroup,
  type PendingActivityGroupAction,
  removeMemberFromGroup,
  restoreGroupSelection,
  trackActivityGroupMutation,
  updateGroupPlanStatus,
} from "./activity-group-action-state";
import { useClearActivityRouteSelection } from "./use-clear-activity-route-selection";

export function useActivityGroupActions(groupId: string) {
  const queryClient = useQueryClient();
  const currentUserQuery = useQuery(currentUserQueryOptions());
  const [pendingAction, setPendingAction] =
    useState<PendingActivityGroupAction>(null);
  const [invitingMemberId, setInvitingMemberId] = useState<string | null>(null);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const clearRouteSelection = useClearActivityRouteSelection();
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();

  function guardGroupAction(guard: Parameters<typeof guardOfflineAction>[0]) {
    return guardOfflineAction(guard);
  }

  async function leaveGroup() {
    await runMembershipAction(
      "leave",
      currentUserQuery.data?.id ?? null,
      (currentUserId) => ActivityCommands.leaveGroup(groupId, currentUserId),
    );
  }

  async function disbandGroup() {
    await runMembershipAction(
      "disband",
      currentUserQuery.data?.id ?? null,
      (currentUserId) => ActivityCommands.disbandGroup(groupId, currentUserId),
    );
  }

  async function removeMember(memberId: string) {
    if (!currentUserQuery.data) {
      return;
    }

    if (guardGroupAction(ACTIVITY_GROUP_ACTION_GUARDS.removeMember)) {
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
      trackActivityGroupMutation(
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
      trackActivityGroupMutation(
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

  async function runMembershipAction(
    action: ActivityGroupMembershipAction,
    currentUserId: string | null,
    execute: (currentUserId: string) => Promise<{ requestId?: string | null }>,
  ) {
    if (currentUserId === null) {
      return;
    }

    if (guardGroupAction(ACTIVITY_GROUP_ACTION_GUARDS[action])) {
      return;
    }

    const mutationName = getMembershipMutationName(action);
    setPendingAction(action);

    try {
      const result = await execute(currentUserId);
      await clearRouteSelection();
      trackActivityGroupMutation(mutationName, "success", {
        groupId,
        requestId: result.requestId,
      });
      setPendingAction(null);
    } catch (error) {
      trackActivityGroupMutation(mutationName, "error", { groupId });
      setPendingAction(null);
      throw error;
    }
  }

  async function runPlanAction(
    action: ActivityGroupPlanAction,
    execute: () => Promise<unknown>,
    optimisticUpdate?: (group: Group) => Group,
  ) {
    if (guardGroupAction(ACTIVITY_GROUP_ACTION_GUARDS.plan)) {
      return;
    }

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
    if (guardGroupAction(ACTIVITY_GROUP_ACTION_GUARDS.inviteMember)) {
      return;
    }

    setInvitingMemberId(inviteeId);

    try {
      const result = await ActivityCommands.sendGroupInvite(groupId, inviteeId);
      trackActivityGroupMutation(
        trackedMutationNames.activityGroupInvite,
        "success",
        {
          groupId,
          requestId: result.requestId,
        },
      );
      setInvitingMemberId(null);
    } catch (error) {
      trackActivityGroupMutation(
        trackedMutationNames.activityGroupInvite,
        "error",
        {
          groupId,
        },
      );
      setInvitingMemberId(null);
      throw error;
    }
  }

  return {
    currentUserId: currentUserQuery.data?.id ?? null,
    isOnline,
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
