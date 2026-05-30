import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GroupPlanDetailCommands } from "@/features/group-plan-detail/api/group-plan-detail-commands";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import { trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";

type ViewerRelationship = GroupPlanDetail["viewer"]["relationship"];
type ViewerJoinState = Pick<
  GroupPlanDetail["viewer"],
  "canCancelRequest" | "canJoin" | "canRequestToJoin" | "joinDisabledReason"
>;

interface GroupPlanDetailMutationContext {
  previousDetail: GroupPlanDetail | undefined;
}

function getJoinableViewerState(detail: GroupPlanDetail): ViewerJoinState {
  const canJoin = detail.group.access === "OPEN";
  const canRequestToJoin = detail.group.access === "BY_REQUEST";

  return {
    canCancelRequest: false,
    canJoin,
    canRequestToJoin,
    joinDisabledReason: canJoin || canRequestToJoin ? null : "PRIVATE",
  };
}

function updateViewerRelationship(
  detail: GroupPlanDetail,
  relationship: ViewerRelationship,
) {
  const isMember =
    relationship === "ADMIN" ||
    relationship === "MODERATOR" ||
    relationship === "MEMBER";
  const isRequested = relationship === "REQUESTED";
  const isInvited = relationship === "INVITED";
  const lockedViewerState: ViewerJoinState = {
    canCancelRequest: isRequested,
    canJoin: false,
    canRequestToJoin: false,
    joinDisabledReason: isRequested ? "REQUEST_PENDING" : null,
  };
  const joinableState: ViewerJoinState =
    relationship === "NOT_MEMBER" || relationship === "FORMER_MEMBER"
      ? getJoinableViewerState(detail)
      : lockedViewerState;

  return {
    ...detail,
    group: {
      ...detail.group,
      activeMembersCount: isMember
        ? detail.group.maxMembers > 0
          ? Math.min(
              detail.group.maxMembers,
              detail.group.activeMembersCount + 1,
            )
          : detail.group.activeMembersCount + 1
        : relationship === "FORMER_MEMBER"
          ? Math.max(0, detail.group.activeMembersCount - 1)
          : detail.group.activeMembersCount,
    },
    viewer: {
      ...detail.viewer,
      ...joinableState,
      relationship,
      canLeaveGroup: isMember,
      canOpenActivity: isMember,
      pendingInviteId: isInvited ? detail.viewer.pendingInviteId : null,
      role: isMember ? (detail.viewer.role ?? "MEMBER") : null,
    },
  } satisfies GroupPlanDetail;
}

export function useGroupPlanDetailActions(groupId: string) {
  const queryClient = useQueryClient();
  const detailQueryKey = APP_QUERY_KEYS.groupPlanDetail.byId(groupId);

  async function optimisticallySetRelationship(
    relationship: ViewerRelationship,
  ) {
    await queryClient.cancelQueries({ queryKey: detailQueryKey });

    const previousDetail =
      queryClient.getQueryData<GroupPlanDetail>(detailQueryKey);

    queryClient.setQueryData<GroupPlanDetail>(detailQueryKey, (current) =>
      current ? updateViewerRelationship(current, relationship) : current,
    );

    return { previousDetail } satisfies GroupPlanDetailMutationContext;
  }

  function restoreDetail(context: GroupPlanDetailMutationContext | undefined) {
    queryClient.setQueryData(detailQueryKey, context?.previousDetail);
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
        detail?.viewer.canRequestToJoin ? "REQUESTED" : "MEMBER",
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
    onMutate: () => optimisticallySetRelationship("NOT_MEMBER"),
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
    onError: (_error, _variables, context) => {
      restoreDetail(context);
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
    onMutate: () => optimisticallySetRelationship("MEMBER"),
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
    onError: (_error, _variables, context) => {
      restoreDetail(context);
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
    onMutate: () => optimisticallySetRelationship("NOT_MEMBER"),
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
    onError: (_error, _variables, context) => {
      restoreDetail(context);
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
    onMutate: () => optimisticallySetRelationship("FORMER_MEMBER"),
    onSuccess: (result) => {
      trackMutationOutcome(trackedMutationNames.activityGroupLeave, "success", {
        groupId,
        requestId: result.requestId,
      });
    },
    onError: (_error, _variables, context) => {
      restoreDetail(context);
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
