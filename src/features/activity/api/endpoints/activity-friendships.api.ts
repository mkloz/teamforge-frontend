import { DEFAULT_ACTIVITY_API_LIMIT } from "@/features/activity/api/activity-api-contracts";
import {
  blockUser as sharedBlockUser,
  getFriends as sharedGetFriends,
  unblockUser as sharedUnblockUser,
} from "@/shared/api/friendship-membership-api";

export async function getFriendships() {
  const friends = await sharedGetFriends(DEFAULT_ACTIVITY_API_LIMIT);

  return friends.sort((left, right) => right.version - left.version);
}

export async function blockActivityUser(userId: string) {
  return sharedBlockUser(userId);
}

export async function unblockActivityUser(userId: string) {
  return sharedUnblockUser(userId);
}
