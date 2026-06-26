import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GroupPlanDetailCommands } from "@/features/group-plan-detail/api/group-plan-detail-commands";
import type { GroupPlanViewerRelationship } from "@/features/group-plan-detail/lib/group-plan-access";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import {
  getOptimisticJoinRelationship,
  updateOptimisticViewerRelationship,
} from "@/features/group-plan-detail/lib/group-plan-optimistic-relationship";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";
import { trackMutationOutcome } from "@/shared/lib/telemetry";
import {
  type TrackedMutationName,
  trackedMutationNames,
} from "@/shared/lib/telemetry-contract";

interface GroupPlanDetailMutationContext {
  previousDetail: GroupPlanDetail | undefined;
}

export function useGroupPlanDetailActions(groupId: string) {
  const queryClient = useQueryClient();
  const detailQueryKey = APP_QUERY_KEYS.groupPlanDetail.byId(groupId);
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();

  function guardGroupAction(id: string, description: string) {
    return guardOfflineAction({ id, description });
  }

  async function optimisticallySetRelationship(
    relationship: GroupPlanViewerRelationship,
  ) {
    await queryClient.cancelQueries({ queryKey: detailQueryKey });

    const previousDetail =
      queryClient.getQueryData<GroupPlanDetail>(detailQueryKey);

    queryClient.setQueryData<GroupPlanDetail>(detailQueryKey, (current) =>
      current
        ? updateOptimisticViewerRelationship(current, relationship)
        : current,
    );

    return { previousDetail } satisfies GroupPlanDetailMutationContext;
  }

  function restoreDetail(context: GroupPlanDetailMutationContext | undefined) {
    queryClient.setQueryData(detailQueryKey, context?.previousDetail);
  }

  function runGuardedGroupAction(
    id: string,
    description: string,
    action: () => void,
  ) {
    if (guardGroupAction(id, description)) {
      return;
    }

    action();
  }

  function trackGroupPlanMutationSuccess(
    mutationName: TrackedMutationName,
    requestId: string | null | undefined,
  ) {
    trackMutationOutcome(mutationName, "success", { groupId, requestId });
  }

  function trackGroupPlanMutationError(mutationName: TrackedMutationName) {
    trackMutationOutcome(mutationName, "error", { groupId });
  }

  const joinMutation = useMutation({
    meta: {
      errorToastMessage: "We couldn't join that group right now.",
      telemetryName: trackedMutationNames.exploreJoinGroup,
    },
    mutationKey: ["group-plan-detail", "join", groupId],
    mutationFn: () => GroupPlanDetailCommands.joinGroup(groupId),
    onMutate: async () => {
      const detail = queryClient.getQueryData<GroupPlanDetail>(detailQueryKey);
      return optimisticallySetRelationship(
        getOptimisticJoinRelationship(detail),
      );
    },
    onSuccess: (result) => {
      trackMutationOutcome(trackedMutationNames.exploreJoinGroup, "success", {
        requestId: result.requestId,
        joinStatus: result.data.status,
      });
    },
    onError: (_error, _variables, context) => {
      restoreDetail(context);
      trackGroupPlanMutationError(trackedMutationNames.exploreJoinGroup);
    },
  });

  const cancelRequestMutation = useMutation({
    meta: {
      errorToastMessage: "We couldn't cancel that request right now.",
      telemetryName: trackedMutationNames.groupPlanCancelJoinRequest,
    },
    mutationKey: ["group-plan-detail", "cancel-request", groupId],
    mutationFn: () => GroupPlanDetailCommands.cancelJoinRequest(groupId),
    onMutate: () => optimisticallySetRelationship("NOT_MEMBER"),
    onSuccess: (result) => {
      trackGroupPlanMutationSuccess(
        trackedMutationNames.groupPlanCancelJoinRequest,
        result.requestId,
      );
    },
    onError: (_error, _variables, context) => {
      restoreDetail(context);
      trackGroupPlanMutationError(
        trackedMutationNames.groupPlanCancelJoinRequest,
      );
    },
  });

  const acceptInviteMutation = useMutation({
    meta: {
      errorToastMessage: "We couldn't accept that invite right now.",
      telemetryName: trackedMutationNames.groupPlanAcceptInvite,
    },
    mutationKey: ["group-plan-detail", "accept-invite", groupId],
    mutationFn: (inviteId: string) =>
      GroupPlanDetailCommands.acceptInvite(groupId, inviteId),
    onMutate: () => optimisticallySetRelationship("MEMBER"),
    onSuccess: (result) => {
      trackGroupPlanMutationSuccess(
        trackedMutationNames.groupPlanAcceptInvite,
        result.requestId,
      );
    },
    onError: (_error, _variables, context) => {
      restoreDetail(context);
      trackGroupPlanMutationError(trackedMutationNames.groupPlanAcceptInvite);
    },
  });

  const declineInviteMutation = useMutation({
    meta: {
      errorToastMessage: "We couldn't decline that invite right now.",
      telemetryName: trackedMutationNames.groupPlanDeclineInvite,
    },
    mutationKey: ["group-plan-detail", "decline-invite", groupId],
    mutationFn: (inviteId: string) =>
      GroupPlanDetailCommands.declineInvite(groupId, inviteId),
    onMutate: () => optimisticallySetRelationship("NOT_MEMBER"),
    onSuccess: (result) => {
      trackGroupPlanMutationSuccess(
        trackedMutationNames.groupPlanDeclineInvite,
        result.requestId,
      );
    },
    onError: (_error, _variables, context) => {
      restoreDetail(context);
      trackGroupPlanMutationError(trackedMutationNames.groupPlanDeclineInvite);
    },
  });

  const leaveMutation = useMutation({
    meta: {
      errorToastMessage: "We couldn't leave that group right now.",
      telemetryName: trackedMutationNames.activityGroupLeave,
    },
    mutationKey: ["group-plan-detail", "leave", groupId],
    mutationFn: () => GroupPlanDetailCommands.leaveGroup(groupId),
    onMutate: () => optimisticallySetRelationship("FORMER_MEMBER"),
    onSuccess: (result) => {
      trackGroupPlanMutationSuccess(
        trackedMutationNames.activityGroupLeave,
        result.requestId,
      );
    },
    onError: (_error, _variables, context) => {
      restoreDetail(context);
      trackGroupPlanMutationError(trackedMutationNames.activityGroupLeave);
    },
  });

  return {
    acceptInvite: (inviteId: string) => {
      runGuardedGroupAction(
        "group-plan-accept-invite-offline",
        "Reconnect before accepting this invite.",
        () => acceptInviteMutation.mutate(inviteId),
      );
    },
    cancelRequest: () => {
      runGuardedGroupAction(
        "group-plan-cancel-request-offline",
        "Reconnect before changing your join request.",
        () => cancelRequestMutation.mutate(),
      );
    },
    declineInvite: (inviteId: string) => {
      runGuardedGroupAction(
        "group-plan-decline-invite-offline",
        "Reconnect before declining this invite.",
        () => declineInviteMutation.mutate(inviteId),
      );
    },
    isAcceptingInvite: acceptInviteMutation.isPending,
    isCancellingRequest: cancelRequestMutation.isPending,
    isDecliningInvite: declineInviteMutation.isPending,
    isJoining: joinMutation.isPending,
    isLeaving: leaveMutation.isPending,
    isOnline,
    joinGroup: () => {
      runGuardedGroupAction(
        "group-plan-join-offline",
        "Reconnect before joining or requesting to join this group.",
        () => joinMutation.mutate(),
      );
    },
    joinResult: joinMutation.data?.data,
    leaveGroup: () => {
      runGuardedGroupAction(
        "group-plan-leave-offline",
        "Reconnect before leaving this group.",
        () => leaveMutation.mutate(),
      );
    },
  };
}
