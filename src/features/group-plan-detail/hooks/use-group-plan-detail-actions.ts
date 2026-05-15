import { useMutation } from "@tanstack/react-query";
import { GroupPlanDetailCommands } from "@/features/group-plan-detail/api/group-plan-detail-commands";
import { trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";

export function useGroupPlanDetailActions(groupId: string) {
  const joinMutation = useMutation({
    meta: {
      errorToastMessage: "We couldn't join that group right now.",
      telemetryName: trackedMutationNames.exploreJoinGroup,
    },
    mutationKey: ["group-plan-detail", "join", groupId],
    mutationFn: () => GroupPlanDetailCommands.joinGroup(groupId),
    onSuccess: (result) => {
      trackMutationOutcome(trackedMutationNames.exploreJoinGroup, "success", {
        requestId: result.requestId,
        joinStatus: result.data.status,
      });
    },
    onError: (_error) => {
      trackMutationOutcome(trackedMutationNames.exploreJoinGroup, "error", {
        groupId,
      });
    },
  });

  const cancelRequestMutation = useMutation({
    meta: {
      errorToastMessage: "We couldn't cancel that request right now.",
      telemetryName: trackedMutationNames.groupPlanCancelJoinRequest,
    },
    mutationKey: ["group-plan-detail", "cancel-request", groupId],
    mutationFn: () => GroupPlanDetailCommands.cancelJoinRequest(groupId),
    onSuccess: (result) => {
      trackMutationOutcome(
        trackedMutationNames.groupPlanCancelJoinRequest,
        "success",
        {
          groupId,
          requestId: result.requestId,
        },
      );
    },
    onError: (_error) => {
      trackMutationOutcome(
        trackedMutationNames.groupPlanCancelJoinRequest,
        "error",
        {
          groupId,
        },
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
    onSuccess: (result) => {
      trackMutationOutcome(
        trackedMutationNames.groupPlanAcceptInvite,
        "success",
        {
          groupId,
          requestId: result.requestId,
        },
      );
    },
    onError: (_error) => {
      trackMutationOutcome(
        trackedMutationNames.groupPlanAcceptInvite,
        "error",
        {
          groupId,
        },
      );
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
    onSuccess: (result) => {
      trackMutationOutcome(
        trackedMutationNames.groupPlanDeclineInvite,
        "success",
        {
          groupId,
          requestId: result.requestId,
        },
      );
    },
    onError: (_error) => {
      trackMutationOutcome(
        trackedMutationNames.groupPlanDeclineInvite,
        "error",
        {
          groupId,
        },
      );
    },
  });

  const leaveMutation = useMutation({
    meta: {
      errorToastMessage: "We couldn't leave that group right now.",
      telemetryName: trackedMutationNames.activityGroupLeave,
    },
    mutationKey: ["group-plan-detail", "leave", groupId],
    mutationFn: () => GroupPlanDetailCommands.leaveGroup(groupId),
    onSuccess: (result) => {
      trackMutationOutcome(trackedMutationNames.activityGroupLeave, "success", {
        groupId,
        requestId: result.requestId,
      });
    },
    onError: (_error) => {
      trackMutationOutcome(trackedMutationNames.activityGroupLeave, "error", {
        groupId,
      });
    },
  });

  return {
    acceptInvite: acceptInviteMutation.mutate,
    cancelRequest: cancelRequestMutation.mutate,
    declineInvite: declineInviteMutation.mutate,
    isAcceptingInvite: acceptInviteMutation.isPending,
    isCancellingRequest: cancelRequestMutation.isPending,
    isDecliningInvite: declineInviteMutation.isPending,
    isJoining: joinMutation.isPending,
    isLeaving: leaveMutation.isPending,
    joinGroup: joinMutation.mutate,
    joinResult: joinMutation.data?.data,
    leaveGroup: leaveMutation.mutate,
  };
}
