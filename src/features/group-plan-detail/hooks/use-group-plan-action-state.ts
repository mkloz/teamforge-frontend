import { useGroupPlanDetailActions } from "@/features/group-plan-detail/hooks/use-group-plan-detail-actions";
import {
  buildGroupPlanActionViewState,
  type GroupPlanActionDescriptor,
  type GroupPlanActionViewState,
  type GroupPlanViewerMode,
} from "@/features/group-plan-detail/lib/group-plan-action-state";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";

export type { GroupPlanViewerMode };

export interface GroupPlanActionState extends GroupPlanActionViewState {
  primary: GroupPlanActionDescriptor;
  secondary: GroupPlanActionDescriptor | null;
  actions: ReturnType<typeof useGroupPlanDetailActions>;
}

export function useGroupPlanActionState(
  detail: GroupPlanDetail,
): GroupPlanActionState {
  const actions = useGroupPlanDetailActions(detail.group.id);
  const viewState = buildGroupPlanActionViewState({
    detail,
    joinResult: actions.joinResult,
    controls: {
      acceptInvite: (inviteId) => actions.acceptInvite(inviteId),
      cancelRequest: () => actions.cancelRequest(),
      declineInvite: (inviteId) => actions.declineInvite(inviteId),
      isAcceptingInvite: actions.isAcceptingInvite,
      isCancellingRequest: actions.isCancellingRequest,
      isDecliningInvite: actions.isDecliningInvite,
      isJoining: actions.isJoining,
      isLeaving: actions.isLeaving,
      isOnline: actions.isOnline,
      joinGroup: () => actions.joinGroup(),
      leaveGroup: () => actions.leaveGroup(),
    },
  });

  return {
    ...viewState,
    actions,
  };
}
