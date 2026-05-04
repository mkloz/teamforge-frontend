import type { FriendshipApi } from "@/shared/schemas";

export interface BlockedUsersSectionProps {
  blockedUsers: FriendshipApi[];
  errorMessage: string | null;
  isLoading: boolean;
  unblockingUserId: string | null;
  onUnblockUser: (userId: string) => Promise<unknown>;
}
