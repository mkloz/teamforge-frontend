import {
  ArrowRight,
  Check,
  CircleDashed,
  type LucideIcon,
  MessageCircle,
  Send,
  X,
} from "lucide-react";
import { buildExploreNavigation } from "@/features/explore/public/explore-navigation";
import {
  type GroupPlanAccessMode,
  type GroupPlanViewerAccess,
  getGroupPlanViewerAccess,
} from "@/features/group-plan-detail/lib/group-plan-access";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { formatStatusLabel } from "@/features/group-plan-detail/lib/group-plan-detail-formatters";
import { buildActivityGroupHubNavigation } from "@/shared/navigation/activity-navigation";
import type { ExploreJoinResult } from "@/shared/schemas/explore";

type ActionHref =
  | ReturnType<typeof buildActivityGroupHubNavigation>
  | ReturnType<typeof buildExploreNavigation>;

export type GroupPlanViewerMode = GroupPlanAccessMode;

export interface GroupPlanActionDescriptor {
  kind: "link" | "button" | "leave";
  label: string;
  icon: LucideIcon;
  href?: ActionHref;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  title?: string;
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
  isOnline: boolean;
  joinGroup: () => void;
  leaveGroup: () => void;
}

interface ActionStateBuilderContext {
  access: GroupPlanViewerAccess;
  controls: GroupPlanActionControls;
  detail: GroupPlanDetail;
  summary: string;
}

type ActionStateBuilder = (
  context: ActionStateBuilderContext,
) => GroupPlanActionViewState;
type JoinActionMode = "direct" | "request";

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
  const context = { access, controls, detail, summary };

  if (!access.isMember && access.joinedGroupId) {
    return buildJoinedMemberState(access.joinedGroupId);
  }

  return ACTION_STATE_BUILDERS[access.mode](context);
}

function buildActionViewState({
  access,
  primary,
  secondary,
  summary,
}: {
  access: GroupPlanViewerAccess;
  primary: GroupPlanActionDescriptor;
  secondary: GroupPlanActionDescriptor | null;
  summary: string;
}): GroupPlanActionViewState {
  return {
    mode: access.mode,
    isMember: access.isMember,
    primary,
    secondary,
    summary,
    joinedGroupId: access.joinedGroupId,
  };
}

function buildCurrentMemberState({
  access,
  controls,
  detail,
  summary,
}: ActionStateBuilderContext): GroupPlanActionViewState {
  return buildActionViewState({
    access,
    primary: buildGroupChatAction(detail.group.id),
    secondary: detail.viewer.canLeaveGroup
      ? buildLeaveGroupAction(controls)
      : null,
    summary,
  });
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
}: ActionStateBuilderContext): GroupPlanActionViewState {
  const pendingInviteId = detail.viewer.pendingInviteId;

  return buildActionViewState({
    access,
    primary: buildAcceptInviteAction({ controls, pendingInviteId }),
    secondary: buildDeclineInviteAction({ controls, pendingInviteId }),
    summary,
  });
}

function buildRequestedState({
  access,
  controls,
  summary,
}: ActionStateBuilderContext): GroupPlanActionViewState {
  return buildActionViewState({
    access,
    primary: buildDisabledAction("Request sent", CircleDashed),
    secondary: buildCancelRequestAction(controls),
    summary,
  });
}

function buildJoinableState({
  access,
  controls,
  detail,
  summary,
}: ActionStateBuilderContext): GroupPlanActionViewState {
  return buildActionViewState({
    access,
    primary: buildJoinGroupAction({
      controls,
      mode: detail.viewer.canRequestToJoin ? "request" : "direct",
    }),
    secondary: buildExploreAction(),
    summary,
  });
}

function buildBlockedState({
  access,
  detail,
  summary,
}: ActionStateBuilderContext): GroupPlanActionViewState {
  return buildActionViewState({
    access,
    primary: buildDisabledAction(getBlockedActionLabel(detail), X),
    secondary: buildExploreAction(),
    summary,
  });
}

const ACTION_STATE_BUILDERS = {
  blocked: buildBlockedState,
  invited: buildInvitedState,
  joinable: buildJoinableState,
  member: buildCurrentMemberState,
  requested: buildRequestedState,
} satisfies Record<GroupPlanViewerMode, ActionStateBuilder>;

function buildLeaveGroupAction(
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

function buildAcceptInviteAction({
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

function buildDeclineInviteAction({
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

function buildCancelRequestAction(
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

function buildJoinGroupAction({
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

type JoinDisabledReason = NonNullable<
  GroupPlanDetail["viewer"]["joinDisabledReason"]
>;

const MEMBER_SUMMARY =
  "You're in. Open the group workspace to keep the plan moving.";

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

const MODE_SUMMARIES: Partial<Record<GroupPlanViewerMode, string>> = {
  invited: "You have a pending invite to review.",
  requested: "Your request is with the group managers.",
};

const JOIN_DISABLED_REASON_SUMMARIES: Partial<
  Record<JoinDisabledReason, string>
> = {
  ALREADY_MEMBER: "You are already part of this group.",
  COMPLETED: "This plan has already wrapped.",
  DISBANDED: "This group has disbanded.",
  FULL: "The group is full right now.",
};

const JOIN_AVAILABLE_SUMMARIES = [
  {
    isAvailable: (detail: GroupPlanDetail) => detail.viewer.canJoin,
    summary: "This group is open, so you can join directly.",
  },
  {
    isAvailable: (detail: GroupPlanDetail) => detail.viewer.canRequestToJoin,
    summary: "Send a request and the group can bring you in.",
  },
] as const;

const DEFAULT_JOIN_UNAVAILABLE_SUMMARY =
  "This group is not taking new people right now.";

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
    return MEMBER_SUMMARY;
  }

  const modeSummary = MODE_SUMMARIES[mode];
  if (modeSummary) {
    return modeSummary;
  }

  return getJoinAvailabilitySummary(detail);
}

function getJoinAvailabilitySummary(detail: GroupPlanDetail) {
  const availability = JOIN_AVAILABLE_SUMMARIES.find(({ isAvailable }) =>
    isAvailable(detail),
  );

  return (
    availability?.summary ??
    getJoinDisabledReasonSummary(detail.viewer.joinDisabledReason)
  );
}

function getJoinDisabledReasonSummary(
  reason: GroupPlanDetail["viewer"]["joinDisabledReason"],
) {
  return reason
    ? (JOIN_DISABLED_REASON_SUMMARIES[reason] ??
        DEFAULT_JOIN_UNAVAILABLE_SUMMARY)
    : DEFAULT_JOIN_UNAVAILABLE_SUMMARY;
}
