import { X } from "lucide-react";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { NotificationsListHeaderActions } from "./header-actions";
import { getNotificationsDrawerHeaderState } from "./header-state";
import type { NotificationsDrawerHeaderProps } from "./types";

export function NotificationsDrawerHeader({
  count,
  isMarkingAllRead,
  isOnline,
  isRefreshing,
  markAllReadDialogOpen,
  selectedNotification,
  onClose,
  onMarkAllRead,
  onMarkAllReadDialogOpenChange,
  onRefresh,
}: NotificationsDrawerHeaderProps) {
  const headerState = getNotificationsDrawerHeaderState({
    count,
    selectedNotification,
  });

  return (
    <div
      className={cn(
        "flex shrink-0 flex-wrap items-center justify-between gap-3 px-5 pt-4",
        headerState.containerClassName,
      )}
    >
      <div className="min-w-0 flex-1">
        <h2 className="font-bold text-ink text-lg leading-tight tracking-tight">
          Notifications
        </h2>
        <p className="mt-1 text-slate-muted text-xs">
          {headerState.countLabel}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {headerState.showListActions ? (
          <NotificationsListHeaderActions
            count={count}
            isMarkingAllRead={isMarkingAllRead}
            isOnline={isOnline}
            isRefreshing={isRefreshing}
            onMarkAllReadDialogOpen={() => onMarkAllReadDialogOpenChange(true)}
            onRefresh={onRefresh}
          />
        ) : null}
        <ActionDialog
          cancelLabel="Not now"
          confirmLabel={isMarkingAllRead ? "Marking..." : "Mark all as read"}
          description="Notifications stay in your history; future notifications remain unread."
          loading={isMarkingAllRead}
          disabled={!isOnline || count === 0}
          onConfirm={onMarkAllRead}
          onOpenChange={onMarkAllReadDialogOpenChange}
          open={markAllReadDialogOpen}
          title="Mark every notification as read?"
          tone="info"
        />
        <Button
          variant="accentGhost"
          size="icon"
          onClick={onClose}
          aria-label="Close notifications"
          className="size-11 p-0 [@media(pointer:fine)]:size-10"
        >
          <X className="size-5 shrink-0" strokeWidth={2} aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
