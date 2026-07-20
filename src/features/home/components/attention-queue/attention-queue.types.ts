import type { useHomeData } from "@/features/home/hooks/use-home-data";
import type { HomeGroup } from "@/features/home/schemas/home-group.schema";
import type { useProfileFriendRequests } from "@/features/profile/public/profile-friend-requests";

export type AttentionQueueInvitation = ReturnType<
  typeof useHomeData
>["invitations"][number];

export type AttentionQueuePlan = ReturnType<
  typeof useHomeData
>["plans"][number];

export type AttentionQueueFriendRequest = NonNullable<
  ReturnType<typeof useProfileFriendRequests>["requests"]
>[number];

export type AttentionQueueParticipation = HomeGroup & {
  pendingParticipationPlan: NonNullable<HomeGroup["pendingParticipationPlan"]>;
};

export type AttentionQueueContinuation = HomeGroup & {
  continuationCheckIn: NonNullable<HomeGroup["continuationCheckIn"]>;
};
