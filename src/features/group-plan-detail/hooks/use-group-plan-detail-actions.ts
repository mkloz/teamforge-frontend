import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { GroupPlanDetailCommands } from "@/features/group-plan-detail/api/group-plan-detail-commands";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";

export function useGroupPlanDetailActions(groupId: string) {
  const joinMutation = useMutation({
    meta: {
      telemetryName: trackedMutationNames.exploreJoinGroup,
    },
    mutationKey: ["group-plan-detail", "join", groupId],
    mutationFn: () => GroupPlanDetailCommands.joinGroup(groupId),
    onSuccess: (result) => {
      trackMutationOutcome(trackedMutationNames.exploreJoinGroup, "success", {
        requestId: result.requestId,
        joinStatus: result.data.status,
      });
      toast.success(
        result.data.status === "REQUESTED"
          ? "Join request sent."
          : "You joined the group.",
      );
    },
    onError: (error) => {
      trackMutationOutcome(trackedMutationNames.exploreJoinGroup, "error", {
        groupId,
      });
      toast.error(
        getApiErrorMessage(error, "We couldn't join that group right now."),
      );
    },
  });

  const cancelRequestMutation = useMutation({
    meta: {
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
      toast.success("Join request cancelled.");
    },
    onError: (error) => {
      trackMutationOutcome(
        trackedMutationNames.groupPlanCancelJoinRequest,
        "error",
        {
          groupId,
        },
      );
      toast.error(
        getApiErrorMessage(error, "We couldn't cancel that request right now."),
      );
    },
  });

  const acceptInviteMutation = useMutation({
    meta: {
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
      toast.success("Invite accepted. You're in.");
    },
    onError: (error) => {
      trackMutationOutcome(
        trackedMutationNames.groupPlanAcceptInvite,
        "error",
        {
          groupId,
        },
      );
      toast.error(
        getApiErrorMessage(error, "We couldn't accept that invite right now."),
      );
    },
  });

  const declineInviteMutation = useMutation({
    meta: {
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
      toast.success("Invite declined.");
    },
    onError: (error) => {
      trackMutationOutcome(
        trackedMutationNames.groupPlanDeclineInvite,
        "error",
        {
          groupId,
        },
      );
      toast.error(
        getApiErrorMessage(error, "We couldn't decline that invite right now."),
      );
    },
  });

  const leaveMutation = useMutation({
    meta: {
      telemetryName: trackedMutationNames.activityGroupLeave,
    },
    mutationKey: ["group-plan-detail", "leave", groupId],
    mutationFn: () => GroupPlanDetailCommands.leaveGroup(groupId),
    onSuccess: (result) => {
      trackMutationOutcome(trackedMutationNames.activityGroupLeave, "success", {
        groupId,
        requestId: result.requestId,
      });
      toast.success("You left the group.");
    },
    onError: (error) => {
      trackMutationOutcome(trackedMutationNames.activityGroupLeave, "error", {
        groupId,
      });
      toast.error(
        getApiErrorMessage(error, "We couldn't leave that group right now."),
      );
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
