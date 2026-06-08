import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { getImageMediaVariant } from "@/shared/lib/image-media";

export function resolveGroupImage(detail: GroupPlanDetail): string | null {
  return (
    getImageMediaVariant(
      detail.group.avatarMedia,
      "avatar128",
      detail.group.avatar,
    ) ??
    getMemberGroupImage(detail) ??
    null
  );
}

function getMemberGroupImage(detail: GroupPlanDetail) {
  const member = detail.members.find(
    (candidate) => candidate.avatarMedia ?? candidate.avatar,
  );

  return getImageMediaVariant(member?.avatarMedia, "avatar128", member?.avatar);
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
