import { SettingsBlockedUsersSkeleton } from "@/features/settings/components/settings-section-skeletons";
import { GroupedMenuList } from "@/shared/components/ui/grouped-menu";
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
  | "isOnline"
  | "isLoading"
  | "unblockingUserId"
  | "onUnblockUser"
>;

export function BlockedUsersList({
  blockedUsers,
  errorMessage,
  isOnline,
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
    <GroupedMenuList aria-label="Blocked people">
      {blockedUsers.map((block) => (
        <BlockedUserRow
          key={block.id}
          block={block}
          isOnline={isOnline}
          isUnblocking={unblockingUserId === block.id}
          onUnblockUser={onUnblockUser}
        />
      ))}
    </GroupedMenuList>
  );
}
