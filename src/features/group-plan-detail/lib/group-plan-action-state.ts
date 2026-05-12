import {
  ArrowRight,
  Check,
  type LucideIcon,
  MessageCircle,
  Send,
  X,
} from "lucide-react";
import { buildActivityGroupHubNavigation } from "@/features/activity/lib/activity-route";
import { buildExploreNavigation } from "@/features/explore/lib/explore-route";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { formatStatusLabel } from "@/features/group-plan-detail/lib/group-plan-detail-formatters";
import type { ExploreJoinResult } from "@/shared/schemas/explore";

type ActionHref =
  | ReturnType<typeof buildActivityGroupHubNavigation>
  | ReturnType<typeof buildExploreNavigation>;

export type GroupPlanViewerMode =
  | "member"
  | "invited"
  | "requested"
  | "joinable"
  | "blocked";

export interface GroupPlanActionDescriptor {
  kind: "link" | "button" | "leave";
  label: string;
  icon: LucideIcon;
  href?: ActionHref;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  destructive?: boolean;
}

export interface GroupPlanActionViewState {
  mode: GroupPlanViewerMode;
  isMember: boolean;
  primary: GroupPlanActionDescriptor;
  secondary: GroupPlanActionDescriptor | null;
  summary: string;
  joinedGroupId: string | null;
}

export interface GroupPlanActionControls {
  acceptInvite: (inviteId: string) => void;
  cancelRequest: () => void;
  declineInvite: (inviteId: string) => void;
  isAcceptingInvite: boolean;
  isCancellingRequest: boolean;
  isDecliningInvite: boolean;
  isJoining: boolean;
  isLeaving: boolean;
  joinGroup: () => void;
  leaveGroup: () => void;
}

interface GroupPlanViewerAccess {
  isInvited: boolean;
  isMember: boolean;
  isRequested: boolean;
  joinedGroupId: string | null;
  mode: GroupPlanViewerMode;
}

export function buildGroupPlanActionViewState({
  controls,
  detail,
  joinResult,
}: {
  controls: GroupPlanActionControls;
  detail: GroupPlanDetail;
  joinResult: ExploreJoinResult | null | undefined;
}): GroupPlanActionViewState {
  const access = getGroupPlanViewerAccess(detail, joinResult);
  const summary = getSummary({
    detail,
    isMember: access.isMember,
    mode: access.mode,
  });

  if (access.isMember) {
    return buildCurrentMemberState({ access, controls, detail, summary });
  }

  if (access.joinedGroupId) {
    return buildJoinedMemberState(access.joinedGroupId);
  }

  if (access.isInvited) {
    return buildInvitedState({ access, controls, detail, summary });
  }

  if (access.isRequested) {
    return buildRequestedState({ access, controls, summary });
  }

  if (access.mode === "joinable") {
    return buildJoinableState({ access, controls, detail, summary });
  }

  return buildBlockedState({ access, detail, summary });
}

export function getGroupPlanViewerAccess(
  detail: GroupPlanDetail,
  joinResult: ExploreJoinResult | null | undefined,
): GroupPlanViewerAccess {
  const joinedGroupId =
    joinResult?.status === "JOINED" ? joinResult.groupId : null;
  const isMember =
    detail.viewer.relationship === "ADMIN" ||
    detail.viewer.relationship === "MODERATOR" ||
    detail.viewer.relationship === "MEMBER";
  const isInvited = detail.viewer.relationship === "INVITED";
  const isRequested =
    detail.viewer.relationship === "REQUESTED" ||
    joinResult?.status === "REQUESTED";

  return {
    isInvited,
    isMember,
    isRequested,
    joinedGroupId,
    mode: isMember
      ? "member"
      : isInvited
        ? "invited"
        : isRequested
          ? "requested"
          : detail.viewer.canJoin || detail.viewer.canRequestToJoin
            ? "joinable"
            : "blocked",
  };
}

function buildCurrentMemberState({
  access,
  controls,
  detail,
  summary,
}: {
  access: GroupPlanViewerAccess;
  controls: GroupPlanActionControls;
  detail: GroupPlanDetail;
  summary: string;
}): GroupPlanActionViewState {
  return {
    mode: access.mode,
    isMember: access.isMember,
    primary: buildGroupChatAction(detail.group.id),
    secondary: detail.viewer.canLeaveGroup
      ? {
          kind: "leave",
          label: controls.isLeaving ? "Leaving..." : "Leave group",
          icon: X,
          onClick: controls.leaveGroup,
          loading: controls.isLeaving,
          destructive: true,
        }
      : null,
    summary,
    joinedGroupId: access.joinedGroupId,
  };
}

function buildJoinedMemberState(
  joinedGroupId: string,
): GroupPlanActionViewState {
  return {
    mode: "member",
    isMember: true,
    primary: buildGroupChatAction(joinedGroupId),
    secondary: null,
    summary: "You're in. Continue in the group workspace.",
    joinedGroupId,
  };
}

function buildInvitedState({
  access,
  controls,
  detail,
  summary,
}: {
  access: GroupPlanViewerAccess;
  controls: GroupPlanActionControls;
  detail: GroupPlanDetail;
  summary: string;
}): GroupPlanActionViewState {
  const pendingInviteId = detail.viewer.pendingInviteId;

  return {
    mode: access.mode,
    isMember: access.isMember,
    primary: {
      kind: "button",
      label: controls.isAcceptingInvite ? "Accepting..." : "Accept invite",
      icon: Check,
      onClick: () => {
        if (pendingInviteId) {
          controls.acceptInvite(pendingInviteId);
        }
      },
      loading: controls.isAcceptingInvite,
      disabled: !pendingInviteId || controls.isAcceptingInvite,
    },
    secondary: {
      kind: "button",
      label: "Decline",
      icon: X,
      onClick: () => {
        if (pendingInviteId) {
          controls.declineInvite(pendingInviteId);
        }
      },
      loading: controls.isDecliningInvite,
      disabled: !pendingInviteId || controls.isDecliningInvite,
    },
    summary,
    joinedGroupId: access.joinedGroupId,
  };
}

function buildRequestedState({
  access,
  controls,
  summary,
}: {
  access: GroupPlanViewerAccess;
  controls: GroupPlanActionControls;
  summary: string;
}): GroupPlanActionViewState {
  return {
    mode: access.mode,
    isMember: access.isMember,
    primary: {
      kind: "button",
      label: "Request sent",
      icon: Send,
      onClick: () => undefined,
      disabled: true,
    },
    secondary: {
      kind: "button",
      label: "Cancel request",
      icon: X,
      onClick: controls.cancelRequest,
      loading: controls.isCancellingRequest,
      disabled: controls.isCancellingRequest,
    },
    summary,
    joinedGroupId: access.joinedGroupId,
  };
}

function buildJoinableState({
  access,
  controls,
  detail,
  summary,
}: {
  access: GroupPlanViewerAccess;
  controls: GroupPlanActionControls;
  detail: GroupPlanDetail;
  summary: string;
}): GroupPlanActionViewState {
  const requesting = detail.viewer.canRequestToJoin;

  return {
    mode: access.mode,
    isMember: access.isMember,
    primary: {
      kind: "button",
      label: controls.isJoining
        ? requesting
          ? "Sending request..."
          : "Joining..."
        : requesting
          ? "Request to join"
          : "Join group",
      icon: requesting ? Send : ArrowRight,
      onClick: controls.joinGroup,
      loading: controls.isJoining,
    },
    secondary: buildExploreAction(),
    summary,
    joinedGroupId: access.joinedGroupId,
  };
}

function buildBlockedState({
  access,
  detail,
  summary,
}: {
  access: GroupPlanViewerAccess;
  detail: GroupPlanDetail;
  summary: string;
}): GroupPlanActionViewState {
  return {
    mode: access.mode,
    isMember: access.isMember,
    primary: {
      kind: "button",
      label: detail.viewer.joinDisabledReason
        ? formatStatusLabel(detail.viewer.joinDisabledReason)
        : "Unavailable",
      icon: X,
      onClick: () => undefined,
      disabled: true,
    },
    secondary: buildExploreAction(),
    summary,
    joinedGroupId: access.joinedGroupId,
  };
}

function buildGroupChatAction(groupId: string): GroupPlanActionDescriptor {
  return {
    kind: "link",
    label: "Open group chat",
    icon: MessageCircle,
    href: buildActivityGroupHubNavigation(groupId),
  };
}

function buildExploreAction(): GroupPlanActionDescriptor {
  return {
    kind: "link",
    label: "Keep exploring",
    icon: ArrowRight,
    href: buildExploreNavigation(),
  };
}

function getSummary({
  detail,
  mode,
  isMember,
}: {
  detail: GroupPlanDetail;
  mode: GroupPlanViewerMode;
  isMember: boolean;
}): string {
  if (isMember) {
    return "You're in. Open the group workspace to keep the plan moving.";
  }

  if (mode === "invited") {
    return "You have a pending invite to review.";
  }

  if (mode === "requested") {
    return "Your request is with the group managers.";
  }

  if (detail.viewer.canJoin) {
    return "This group is open, so you can join directly.";
  }

  if (detail.viewer.canRequestToJoin) {
    return "Send a request and the group can bring you in.";
  }

  if (detail.viewer.joinDisabledReason === "FULL") {
    return "The group is full right now.";
  }

  if (detail.viewer.joinDisabledReason === "ALREADY_MEMBER") {
    return "You are already part of this group.";
  }

  if (detail.viewer.joinDisabledReason === "DISBANDED") {
    return "This group has disbanded.";
  }

  if (detail.viewer.joinDisabledReason === "COMPLETED") {
    return "This plan has already wrapped.";
  }

  return "This group is not taking new people right now.";
}
