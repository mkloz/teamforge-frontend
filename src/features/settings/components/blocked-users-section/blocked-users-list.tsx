import { SettingsBlockedUsersSkeleton } from "@/features/settings/components/settings-section-skeletons";
import { BlockedUserRow } from "./blocked-user-row";
import {
  BlockedUsersEmptyState,
  BlockedUsersErrorState,
} from "./blocked-users-state";
import type { BlockedUsersSectionProps } from "./types";

type BlockedUsersListProps = Pick<
  BlockedUsersSectionProps,
  | "blockedUsers"
  | "errorMessage"
  | "isLoading"
  | "unblockingUserId"
  | "onUnblockUser"
>;

export function BlockedUsersList({
  blockedUsers,
  errorMessage,
  isLoading,
  unblockingUserId,
  onUnblockUser,
}: BlockedUsersListProps) {
  if (isLoading) {
    return <SettingsBlockedUsersSkeleton />;
  }

  if (errorMessage) {
    return <BlockedUsersErrorState message={errorMessage} />;
  }

  if (!blockedUsers.length) {
    return <BlockedUsersEmptyState />;
  }

  return (
    <>
      {blockedUsers.map((friendship) => (
        <BlockedUserRow
          key={`${friendship.requesterId}-${friendship.receiverId}`}
          friendship={friendship}
          isUnblocking={unblockingUserId === friendship.counterpart.id}
          onUnblockUser={onUnblockUser}
        />
      ))}
    </>
  );
}
