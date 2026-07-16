import type { UserBlockApi } from "@/shared/schemas";

export interface BlockedUsersSectionProps {
  blockedUsers: UserBlockApi[];
  errorMessage: string | null;
  isOnline: boolean;
  isLoading: boolean;
  unblockingUserId: string | null;
  onUnblockUser: (userId: string) => Promise<unknown>;
}
