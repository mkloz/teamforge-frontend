import { CheckCheck, RefreshCw, X } from "lucide-react";
import { EmptyNotificationsVisual } from "@/features/notifications/assets/empty-notifications";
import type { useNotifications } from "@/features/notifications/hooks/use-notifications";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";
import type { Notification } from "@/shared/schemas";
import { NotificationDetail } from "./notification-detail";
import { NotificationsDrawerSkeleton } from "./notifications-drawer-skeleton";
import { NotificationsSection } from "./notifications-section";

type NotificationGroup = ReturnType<
  typeof useNotifications
>["notificationGroups"][number];

type PendingDetailAction = "mark-read" | "mark-unread" | "open" | null;
type ReadToggleDetailAction = Extract<
  PendingDetailAction,
  "mark-read" | "mark-unread"
>;

const READ_TOGGLE_DETAIL_ACTIONS = new Set<PendingDetailAction>([
  "mark-read",
  "mark-unread",
]);

interface NotificationsDrawerHeaderProps {
  count: number;
  isMarkingAllRead: boolean;
  isOnline: boolean;
  isRefreshing: boolean;
  markAllReadDialogOpen: boolean;
  selectedNotification: Notification | null;
  onClose: () => void;
  onMarkAllRead: () => unknown;
  onMarkAllReadDialogOpenChange: (open: boolean) => void;
  onRefresh: () => void;
}

interface NotificationsDrawerBodyProps {
  isLoading: boolean;
  isOnline: boolean;
  items: Notification[];
  notificationGroups: NotificationGroup[];
  pendingDetailAction: PendingDetailAction;
  pendingNotificationId: string | null;
  pendingReadToggleNotificationId: string | null;
  selectedNotification: Notification | null;
  onBackToList: () => void;
  onOpenNotification: (notification: Notification) => void;
  onSelectNotification: (notification: Notification) => void;
  onToggleNotificationRead: (notification: Notification) => void;
  onToggleSelectedNotificationRead: (notification: Notification) => void;
}

function getNotificationsDrawerHeaderState({
  count,
  selectedNotification,
}: Pick<NotificationsDrawerHeaderProps, "count" | "selectedNotification">) {
  return {
    containerClassName: selectedNotification
      ? "min-h-16 pb-2"
      : "min-h-18 border-border border-b pb-4",
    countLabel: getUnreadCountLabel(count),
    showListActions: !selectedNotification,
  };
}

function getUnreadCountLabel(count: number) {
  if (count === 0) {
    return "All caught up";
  }

  return `${count} unread ${count === 1 ? "update" : "updates"}`;
}

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
          description="This clears the unread badges from every notification in the drawer."
          details={[
            "The notifications stay in your history.",
            "New updates will still appear as unread.",
          ]}
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
          className="size-10 p-0"
        >
          <X className="size-5 shrink-0" strokeWidth={2} aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

function NotificationsListHeaderActions({
  count,
  isMarkingAllRead,
  isOnline,
  isRefreshing,
  onMarkAllReadDialogOpen,
  onRefresh,
}: {
  count: number;
  isMarkingAllRead: boolean;
  isOnline: boolean;
  isRefreshing: boolean;
  onMarkAllReadDialogOpen: () => void;
  onRefresh: () => void;
}) {
  const labels = getNotificationsListHeaderActionLabels(isOnline);

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="subtle"
            size="icon"
            onClick={onMarkAllReadDialogOpen}
            disabled={!isOnline || count === 0 || isMarkingAllRead}
            loading={isMarkingAllRead}
            aria-label="Mark all notifications as read"
            className="size-10 p-0"
          >
            <CheckCheck className="size-4 shrink-0" aria-hidden="true" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">{labels.markAllRead}</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="accentGhost"
            size="icon"
            onClick={onRefresh}
            disabled={!isOnline || isRefreshing}
            loading={isRefreshing}
            aria-label="Refresh notifications"
            className="size-10 p-0"
          >
            <RefreshCw className="size-4 shrink-0" aria-hidden="true" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">{labels.refresh}</TooltipContent>
      </Tooltip>
    </>
  );
}

function getNotificationsListHeaderActionLabels(isOnline: boolean) {
  if (!isOnline) {
    return {
      markAllRead: "Reconnect to update read state",
      refresh: "Reconnect to refresh",
    };
  }

  return {
    markAllRead: "Mark all notifications as read",
    refresh: "Refresh notifications",
  };
}

export function NotificationsDrawerBody({
  isLoading,
  isOnline,
  items,
  notificationGroups,
  pendingDetailAction,
  pendingNotificationId,
  pendingReadToggleNotificationId,
  selectedNotification,
  onBackToList,
  onOpenNotification,
  onSelectNotification,
  onToggleNotificationRead,
  onToggleSelectedNotificationRead,
}: NotificationsDrawerBodyProps) {
  if (isLoading) {
    return <NotificationsDrawerSkeleton />;
  }

  if (items.length === 0) {
    return <NotificationsEmptyState />;
  }

  if (selectedNotification) {
    return (
      <NotificationDetail
        item={selectedNotification}
        isTogglingRead={isSelectedNotificationReadTogglePending({
          pendingDetailAction,
          pendingNotificationId,
          selectedNotification,
        })}
        isOpening={isSelectedNotificationOpenPending({
          pendingDetailAction,
          pendingNotificationId,
          selectedNotification,
        })}
        isReadActionDisabled={!isOnline}
        onBack={onBackToList}
        onToggleRead={onToggleSelectedNotificationRead}
        onOpen={onOpenNotification}
      />
    );
  }

  return (
    <>
      {notificationGroups.map((group) => (
        <NotificationsSection
          key={group.key}
          label={group.label}
          items={group.items}
          pendingNotificationId={getListPendingNotificationId({
            pendingDetailAction,
            pendingNotificationId,
          })}
          pendingReadToggleNotificationId={pendingReadToggleNotificationId}
          isReadActionDisabled={!isOnline}
          onSelect={onSelectNotification}
          onToggleRead={onToggleNotificationRead}
        />
      ))}
    </>
  );
}

function isSelectedNotificationReadTogglePending({
  pendingDetailAction,
  pendingNotificationId,
  selectedNotification,
}: {
  pendingDetailAction: PendingDetailAction;
  pendingNotificationId: string | null;
  selectedNotification: Notification;
}) {
  return (
    pendingNotificationId === selectedNotification.id &&
    isReadToggleDetailAction(pendingDetailAction)
  );
}

function isSelectedNotificationOpenPending({
  pendingDetailAction,
  pendingNotificationId,
  selectedNotification,
}: {
  pendingDetailAction: PendingDetailAction;
  pendingNotificationId: string | null;
  selectedNotification: Notification;
}) {
  return (
    pendingNotificationId === selectedNotification.id &&
    pendingDetailAction === "open"
  );
}

function isReadToggleDetailAction(
  pendingDetailAction: PendingDetailAction,
): pendingDetailAction is ReadToggleDetailAction {
  return READ_TOGGLE_DETAIL_ACTIONS.has(pendingDetailAction);
}

function getListPendingNotificationId({
  pendingDetailAction,
  pendingNotificationId,
}: {
  pendingDetailAction: PendingDetailAction;
  pendingNotificationId: string | null;
}) {
  return pendingDetailAction ? pendingNotificationId : null;
}

function NotificationsEmptyState() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-6 py-14 text-center sm:py-16">
      <EmptyNotificationsVisual className="h-30 w-auto text-foreground" />
      <div className="mt-6 max-w-68">
        <p className="font-bold text-base text-ink leading-tight">
          Nothing needs your attention
        </p>
        <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
          We'll keep this quiet until there's something useful to check.
        </p>
      </div>
    </div>
  );
}
