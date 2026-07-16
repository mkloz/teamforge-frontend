import { Loader2, ShieldOff } from "lucide-react";
import { Avatar } from "@/shared/components/common/avatar";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";
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
    <div className="flex flex-col gap-4 border-border border-b py-4 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 items-center gap-3">
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

function UnblockButtonIcon({ isUnblocking }: { isUnblocking: boolean }) {
  if (isUnblocking) {
    return <Loader2 size={14} className="animate-spin" />;
  }

  return <ShieldOff size={14} />;
}

function getUnblockLabel(isUnblocking: boolean) {
  return isUnblocking ? "Unblocking..." : "Unblock";
}
