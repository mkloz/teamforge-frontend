import { ShieldOff } from "lucide-react";
import { Avatar } from "@/shared/components/common/avatar";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";
import { GroupedMenuItem } from "@/shared/components/ui/grouped-menu";
import { Spinner } from "@/shared/components/ui/spinner";
import type { UserBlockApi } from "@/shared/schemas";
import { formatBlockedDate } from "./blocked-users-formatters";

interface BlockedUserRowProps {
  block: UserBlockApi;
  isOnline: boolean;
  isUnblocking: boolean;
  onUnblockUser: (userId: string) => Promise<unknown>;
}

export function BlockedUserRow({
  block,
  isOnline,
  isUnblocking,
  onUnblockUser,
}: BlockedUserRowProps) {
  const isDisabled = !isOnline || isUnblocking;
  const unblockLabel = getUnblockLabel(isUnblocking);

  return (
    <GroupedMenuItem>
      <div className="flex min-h-18 flex-wrap items-center gap-3 px-3 py-3 sm:flex-nowrap sm:px-5 sm:py-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Avatar
            src={block.avatar}
            name={block.name}
            className="size-11 border border-border bg-card text-sm"
          />

          <div className="min-w-0">
            <p className="truncate font-semibold text-ink text-sm">
              {block.name}
            </p>
            <p className="mt-1 text-slate-muted text-xs">
              Blocked {formatBlockedDate(block.blockedAt)}
            </p>
          </div>
        </div>

        <ActionDialog
          cancelLabel="Keep blocked"
          confirmLabel={unblockLabel}
          description={`Unblocking ${block.name} permits future contact only where your privacy and group settings allow it.`}
          details={[
            "This does not restore previous connections, chats, or groups.",
            "You can block them again later.",
          ]}
          disabled={isDisabled}
          loading={isUnblocking}
          onConfirm={() => onUnblockUser(block.id)}
          title="Unblock this user?"
          tone="info"
          trigger={
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isDisabled}
              className="w-full sm:w-auto"
            >
              <UnblockButtonIcon isUnblocking={isUnblocking} />
              {unblockLabel}
            </Button>
          }
        />
      </div>
    </GroupedMenuItem>
  );
}

function UnblockButtonIcon({ isUnblocking }: { isUnblocking: boolean }) {
  if (isUnblocking) {
    return <Spinner aria-hidden="true" className="size-3.5" />;
  }

  return <ShieldOff size={14} />;
}

function getUnblockLabel(isUnblocking: boolean) {
  return isUnblocking ? "Unblocking..." : "Unblock";
}
