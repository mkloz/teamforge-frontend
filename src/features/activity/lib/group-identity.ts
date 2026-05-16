import type { Group } from "@/features/activity/lib/activity-contract";

export function getGroupAvatarUrl(group?: Group | null) {
  if (!group?.avatar) {
    return null;
  }

  return group.avatar === group.plan?.coverImage ? null : group.avatar;
}

export function getGroupCoverImage(group?: Group | null) {
  return group?.plan?.coverImage ?? null;
}
