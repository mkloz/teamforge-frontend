import type { Group } from "@/features/activity/lib/activity-contract";
import { getImageMediaVariant } from "@/shared/lib/image-media";

export function getGroupAvatarUrl(group?: Group | null) {
  const avatarUrl = getImageMediaVariant(
    group?.avatarMedia,
    "avatar128",
    group?.avatar,
  );

  if (!avatarUrl) {
    return null;
  }

  return group?.avatar === group?.plan?.coverImage ? null : avatarUrl;
}

export function getGroupCoverImage(group?: Group | null) {
  return getImageMediaVariant(
    group?.plan?.coverImageMedia,
    "cover800",
    group?.plan?.coverImage,
  );
}
