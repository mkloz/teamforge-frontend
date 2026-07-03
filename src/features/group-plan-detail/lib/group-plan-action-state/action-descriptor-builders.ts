import {
  ArrowRight,
  Check,
  CircleDashed,
  type LucideIcon,
  MessageCircle,
  Send,
  X,
} from "lucide-react";
import type {
  GroupPlanActionControls,
  GroupPlanActionDescriptor,
  JoinActionMode,
} from "@/features/group-plan-detail/lib/group-plan-action-state/types";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { formatStatusLabel } from "@/features/group-plan-detail/lib/group-plan-detail-formatters";
import { buildExploreNavigation } from "@/shared/navigation";
import { buildActivityGroupHubNavigation } from "@/shared/navigation/activity-navigation";

const JOIN_ACTION_COPY = {
  direct: {
    label: "Join group",
    loadingLabel: "Joining...",
    icon: ArrowRight,
  },
  request: {
    label: "Request to join",
    loadingLabel: "Sending request...",
    icon: Send,
  },
} satisfies Record<
  JoinActionMode,
  {
    label: string;
    loadingLabel: string;
    icon: LucideIcon;
  }
>;

export function buildLeaveGroupAction(
  controls: GroupPlanActionControls,
): GroupPlanActionDescriptor {
  return {
    kind: "leave",
    label: controls.isLeaving ? "Leaving..." : "Leave group",
    icon: X,
    onClick: controls.leaveGroup,
    loading: controls.isLeaving,
    disabled: !controls.isOnline || controls.isLeaving,
    title: getOfflineTitle(
      controls.isOnline,
      "Reconnect before leaving this group.",
    ),
    destructive: true,
  };
}

export function buildAcceptInviteAction({
  controls,
  pendingInviteId,
}: {
  controls: GroupPlanActionControls;
  pendingInviteId: string | null;
}): GroupPlanActionDescriptor {
  return {
    kind: "button",
    label: controls.isAcceptingInvite ? "Accepting..." : "Accept invite",
    icon: Check,
    onClick: runWithPendingInvite(pendingInviteId, controls.acceptInvite),
    loading: controls.isAcceptingInvite,
    disabled:
      !controls.isOnline || !pendingInviteId || controls.isAcceptingInvite,
    title: getOfflineTitle(
      controls.isOnline,
      "Reconnect before accepting this invite.",
    ),
  };
}

export function buildDeclineInviteAction({
  controls,
  pendingInviteId,
}: {
  controls: GroupPlanActionControls;
  pendingInviteId: string | null;
}): GroupPlanActionDescriptor {
  return {
    kind: "button",
    label: "Decline",
    icon: X,
    onClick: runWithPendingInvite(pendingInviteId, controls.declineInvite),
    loading: controls.isDecliningInvite,
    disabled:
      !controls.isOnline || !pendingInviteId || controls.isDecliningInvite,
    title: getOfflineTitle(
      controls.isOnline,
      "Reconnect before declining this invite.",
    ),
  };
}

export function buildCancelRequestAction(
  controls: GroupPlanActionControls,
): GroupPlanActionDescriptor {
  return {
    kind: "button",
    label: "Cancel request",
    icon: X,
    onClick: controls.cancelRequest,
    loading: controls.isCancellingRequest,
    disabled: !controls.isOnline || controls.isCancellingRequest,
    title: getOfflineTitle(
      controls.isOnline,
      "Reconnect before changing your join request.",
    ),
  };
}

export function buildJoinGroupAction({
  controls,
  mode,
}: {
  controls: GroupPlanActionControls;
  mode: JoinActionMode;
}): GroupPlanActionDescriptor {
  const copy = JOIN_ACTION_COPY[mode];

  return {
    kind: "button",
    label: controls.isJoining ? copy.loadingLabel : copy.label,
    icon: copy.icon,
    onClick: controls.joinGroup,
    loading: controls.isJoining,
    disabled: !controls.isOnline || controls.isJoining,
    title: getOfflineTitle(
      controls.isOnline,
      "Reconnect before joining or requesting to join this group.",
    ),
  };
}

function buildDisabledAction(
  label: string,
  icon: LucideIcon,
): GroupPlanActionDescriptor {
  return {
    kind: "button",
    label,
    icon,
    onClick: noopAction,
    disabled: true,
  };
}

export function buildRequestedDisabledAction(): GroupPlanActionDescriptor {
  return buildDisabledAction("Request sent", CircleDashed);
}

export function buildBlockedAction(detail: GroupPlanDetail) {
  return buildDisabledAction(getBlockedActionLabel(detail), X);
}

export function buildGroupChatAction(
  groupId: string,
): GroupPlanActionDescriptor {
  return {
    kind: "link",
    label: "Open group chat",
    icon: MessageCircle,
    href: buildActivityGroupHubNavigation(groupId),
  };
}

export function buildExploreAction(): GroupPlanActionDescriptor {
  return {
    kind: "link",
    label: "Keep exploring",
    icon: ArrowRight,
    href: buildExploreNavigation(),
  };
}

function getBlockedActionLabel(detail: GroupPlanDetail) {
  return detail.viewer.joinDisabledReason
    ? formatStatusLabel(detail.viewer.joinDisabledReason)
    : "Unavailable";
}

function getOfflineTitle(isOnline: boolean, offlineTitle: string) {
  return isOnline ? undefined : offlineTitle;
}

function runWithPendingInvite(
  pendingInviteId: string | null,
  action: (inviteId: string) => void,
) {
  return () => {
    if (pendingInviteId) {
      action(pendingInviteId);
    }
  };
}

function noopAction() {
  return undefined;
}
