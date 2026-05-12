import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";

export function resolveGroupImage(detail: GroupPlanDetail): string | null {
  return (
    detail.group.avatar ??
    detail.members.find((member) => member.avatar)?.avatar ??
    null
  );
}

export function getGroupFallbackDescription(detail: GroupPlanDetail): string {
  return `A group forming around ${detail.activity.title}${
    detail.activity.city ? ` in ${detail.activity.city}` : ""
  }.`;
}

export function formatGroupVisibility(
  visibility: GroupPlanDetail["group"]["visibility"],
): string {
  switch (visibility) {
    case "PUBLIC":
      return "Visible to everyone";
    case "FRIENDS_ONLY":
      return "Friends only";
    case "INVITE_ONLY":
      return "Invite only";
    default:
      return "Public";
  }
}
