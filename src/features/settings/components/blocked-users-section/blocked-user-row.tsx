import { Link } from "@tanstack/react-router";
import { Loader2, ShieldOff } from "lucide-react";
import { Avatar } from "@/shared/components/common/avatar";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";
import { buildProfileNavigation } from "@/shared/navigation/profile-navigation";
import type { FriendshipApi } from "@/shared/schemas";
import { formatBlockedDate } from "./blocked-users-formatters";

interface BlockedUserRowProps {
  friendship: FriendshipApi;
  isOnline: boolean;
  isUnblocking: boolean;
  onUnblockUser: (userId: string) => Promise<unknown>;
}

export function BlockedUserRow({
  friendship,
  isOnline,
  isUnblocking,
  onUnblockUser,
}: BlockedUserRowProps) {
  const user = friendship.counterpart;
  const isDisabled = !isOnline || isUnblocking;
  const unblockLabel = getUnblockLabel(isUnblocking);

  return (
    <div className="flex flex-col gap-4 border-border border-b py-4 md:flex-row md:items-center md:justify-between">
      <Link
        {...buildProfileNavigation(user.id)}
        aria-label={`View ${user.name}'s profile`}
        className="group flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Avatar
          src={user.avatar}
          name={user.name}
          className="size-11 border border-border bg-card text-sm transition-transform group-hover:scale-105"
        />

        <div className="min-w-0">
          <p className="truncate font-semibold text-ink text-sm transition-colors group-hover:text-primary">
            {user.name}
          </p>
          <BlockedUserMetadata friendship={friendship} />
        </div>
      </Link>

      <ActionDialog
        cancelLabel="Keep blocked"
        confirmLabel={unblockLabel}
        description={`${user.name} will leave your blocked people list and can contact you again.`}
        details={["You can block them again from their profile panel."]}
        disabled={isDisabled}
        loading={isUnblocking}
        onConfirm={() => onUnblockUser(user.id)}
        title="Unblock this user?"
        tone="info"
        trigger={
          <Button
            type="button"
            variant="outline"
            disabled={isDisabled}
            className="w-full md:w-auto"
          >
            <UnblockButtonIcon isUnblocking={isUnblocking} />
            {unblockLabel}
          </Button>
        }
      />
    </div>
  );
}

function BlockedUserMetadata({ friendship }: { friendship: FriendshipApi }) {
  const user = friendship.counterpart;

  return (
    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-slate-muted text-xs">
      <span>Blocked {formatBlockedDate(friendship.updatedAt)}</span>
      <OptionalBlockedUserMeta value={user.city} />
      <OptionalBlockedUserMeta value={user.personalityType} />
    </div>
  );
}

function OptionalBlockedUserMeta({ value }: { value?: string | null }) {
  if (!value) {
    return null;
  }

  return <span>{value}</span>;
}

function UnblockButtonIcon({ isUnblocking }: { isUnblocking: boolean }) {
  if (isUnblocking) {
    return <Loader2 size={14} className="animate-spin" />;
  }

  return <ShieldOff size={14} />;
}

function getUnblockLabel(isUnblocking: boolean) {
  return isUnblocking ? "Unblocking..." : "Unblock";
}
