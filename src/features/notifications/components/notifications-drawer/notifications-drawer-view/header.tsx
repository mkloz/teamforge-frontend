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
        "relative z-20 flex shrink-0 items-center justify-between gap-3 bg-canvas/92 px-5 pt-4 backdrop-blur-md",
        headerState.containerClassName,
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="font-bold text-ink text-xl leading-tight tracking-tight">
          Notifications
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-slate-muted text-xs">
          {count > 0 && !selectedNotification ? (
            <span
              className="size-1.5 rounded-full bg-brand-teal"
              aria-hidden="true"
            />
          ) : null}
          {headerState.countLabel}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
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
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close notifications"
          className="size-10 rounded-full p-0 text-slate-muted hover:text-ink [@media(pointer:fine)]:size-9"
        >
          <X className="size-4.5 shrink-0" strokeWidth={2} aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
