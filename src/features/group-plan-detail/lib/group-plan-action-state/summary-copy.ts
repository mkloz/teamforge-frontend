import type {
  GroupPlanViewerMode,
  JoinDisabledReason,
} from "@/features/group-plan-detail/lib/group-plan-action-state/types";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";

const MEMBER_SUMMARY =
  "You're in. Open the group workspace to continue planning.";

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
  ARCHIVED: "This group is archived and read-only.",
  FULL: "The group is full right now.",
};

const JOIN_AVAILABLE_SUMMARIES = [
  {
    isAvailable: (detail: GroupPlanDetail) => detail.viewer.canJoin,
    summary: "This group is open, so you can join directly.",
  },
  {
    isAvailable: (detail: GroupPlanDetail) => detail.viewer.canRequestToJoin,
    summary: "Send a request for the group managers to review.",
  },
] as const;

const DEFAULT_JOIN_UNAVAILABLE_SUMMARY =
  "This group is not taking new people right now.";

export function getSummary({
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
