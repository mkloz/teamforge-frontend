import type { useExploreFriendRequests } from "@/features/explore/hooks/use-explore-friend-requests";
import type { useHomeData } from "@/features/home/hooks/use-home-data";

export type AttentionQueueInvitation = ReturnType<
  typeof useHomeData
>["invitations"][number];

export type AttentionQueuePlan = ReturnType<
  typeof useHomeData
>["plans"][number];

export type AttentionQueueFriendRequest = ReturnType<
  typeof useExploreFriendRequests
>["requests"][number];
