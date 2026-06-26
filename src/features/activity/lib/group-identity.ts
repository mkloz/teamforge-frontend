import type { Group } from "@/features/activity/lib/activity-contract";
import { getImageMediaVariant } from "@/shared/lib/image-media";

export function getGroupAvatarUrl(group?: Group | null) {
  const avatarUrl = getGroupAvatarSource(group);

  if (!avatarUrl || isGroupAvatarDuplicateCover(group)) {
    return null;
  }

  return avatarUrl;
}

export function getGroupCoverImage(group?: Group | null) {
  return getImageMediaVariant(
    group?.plan?.coverImageMedia,
    "cover800",
    group?.plan?.coverImage,
  );
}

function getGroupAvatarSource(group?: Group | null) {
  return getImageMediaVariant(group?.avatarMedia, "avatar128", group?.avatar);
}

function isGroupAvatarDuplicateCover(group: Group | null | undefined) {
  return group?.avatar === group?.plan?.coverImage;
}
