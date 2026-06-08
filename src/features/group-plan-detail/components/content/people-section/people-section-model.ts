import type {
  GroupPlanDetail,
  GroupPlanDetailMember,
} from "@/features/group-plan-detail/lib/group-plan-detail-contract";

export const COMPACT_MEMBER_LIMIT = 6;

export type VisiblePeopleSectionMember = GroupPlanDetailMember & {
  variant: "host" | "regular";
};

export function getPeopleSectionModel({
  detail,
  expanded,
}: {
  detail: GroupPlanDetail;
  expanded: boolean;
}) {
  const hosts = detail.members.filter(isHostMember);
  const regulars = detail.members.filter((member) => member.role === "MEMBER");
  const visibleRegulars = expanded
    ? regulars
    : regulars.slice(0, COMPACT_MEMBER_LIMIT);

  return {
    hasMoreRegulars: regulars.length > COMPACT_MEMBER_LIMIT,
    isViewerMember: isViewerMember(detail),
    regularCount: regulars.length,
    visibleMembers: [
      ...hosts.map(withHostVariant),
      ...visibleRegulars.map(withRegularVariant),
    ],
  };
}

function isViewerMember(detail: GroupPlanDetail) {
  const rel = detail.viewer.relationship;
  return rel === "ADMIN" || rel === "MODERATOR" || rel === "MEMBER";
}

function isHostMember(member: GroupPlanDetailMember) {
  return member.role === "ADMIN" || member.role === "MODERATOR";
}

function withHostVariant(
  member: GroupPlanDetailMember,
): VisiblePeopleSectionMember {
  return {
    ...member,
    variant: "host",
  };
}

function withRegularVariant(
  member: GroupPlanDetailMember,
): VisiblePeopleSectionMember {
  return {
    ...member,
    variant: "regular",
  };
}
