import type { useProfileOutgoingFriendRequests } from "@/features/profile/hooks/use-profile-outgoing-friend-requests";
import type { useProfileFriendRequests } from "@/features/profile/public/profile-friend-requests";

export type IncomingFriendRequest = ReturnType<
  typeof useProfileFriendRequests
>["requests"][number];

export type OutgoingFriendRequest = ReturnType<
  typeof useProfileOutgoingFriendRequests
>["requests"][number];
