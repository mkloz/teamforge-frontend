import {
  ArrowLeft,
  Check,
  ExternalLink,
  type LucideIcon,
  Mail,
} from "lucide-react";
import {
  type AvatarBadgeTone,
  AvatarWithBadge,
} from "@/shared/components/common/avatar-with-badge";
import { Button } from "@/shared/components/ui/button";
import { IconTile, type IconTileTone } from "@/shared/components/ui/icon-tile";
import type { Notification } from "@/shared/schemas";
import {
  formatNotificationDate,
  getTypeConfig,
  relativeTime,
} from "./notification-display";

interface NotificationDetailProps {
  item: Notification;
  isTogglingRead: boolean;
  isOpening: boolean;
  isReadActionDisabled?: boolean;
  onBack: () => void;
  onToggleRead: (item: Notification) => void;
  onOpen: (item: Notification) => void;
}

interface NotificationDetailReadActionState {
  icon: LucideIcon;
  label: string;
  title: string | undefined;
}

export function NotificationDetail({
  item,
  isTogglingRead,
  isOpening,
  isReadActionDisabled = false,
  onBack,
  onToggleRead,
  onOpen,
}: NotificationDetailProps) {
  const config = getTypeConfig(item.type);
  const Icon = config.icon;
  const isBusy = isNotificationDetailBusy({ isOpening, isTogglingRead });
  const readAction = getNotificationDetailReadActionState({
    isRead: item.isRead,
    isReadActionDisabled,
  });
  const ReadStateIcon = readAction.icon;

  return (
    <article className="flex min-h-full flex-col">
      <div className="sticky top-0 z-10 bg-canvas/92 px-5 pt-3 pb-1 backdrop-blur-md">
        <Button
          variant="accentGhost"
          size="sm"
          onClick={onBack}
          disabled={isBusy}
          className="-ml-2 px-2"
          contentClassName="gap-1.5"
        >
          <ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
          Back
        </Button>
      </div>

      <div className="flex flex-1 flex-col px-5 pt-5 pb-28">
        <div className="flex min-h-16 min-w-0 items-start gap-4">
          <NotificationDetailSource
            avatarBadgeTone={config.avatarBadgeTone}
            icon={Icon}
            iconTone={config.iconTone}
            item={item}
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <time
                dateTime={item.createdAt}
                className="font-semibold text-slate-muted text-xs leading-4"
              >
                {relativeTime(item.createdAt)}
              </time>
              <NotificationDetailUnreadMarker isRead={item.isRead} />
            </div>
            <h3 className="mt-1 line-clamp-2 text-balance font-bold text-ink text-lg leading-5 tracking-tight">
              {item.title}
            </h3>
          </div>
        </div>

        <p className="mt-6 max-w-md whitespace-pre-wrap text-base text-ink/85 leading-7">
          {item.message}
        </p>

        <p className="mt-8 border-border/60 border-t pt-4 font-medium text-slate-muted text-xs">
          Received {formatNotificationDate(item.createdAt)}
        </p>
      </div>

      <div className="sticky bottom-0 border-border/60 border-t bg-canvas/92 px-5 pt-3 pb-5 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Button
            variant="accentGhost"
            size="sm"
            onClick={() => onToggleRead(item)}
            disabled={isBusy || isReadActionDisabled}
            loading={isTogglingRead}
            title={readAction.title}
            className="min-w-0 flex-1"
            contentClassName="gap-1.5"
          >
            <ReadStateIcon className="size-4 shrink-0" aria-hidden="true" />
            {readAction.label}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onOpen(item)}
            disabled={isBusy}
            loading={isOpening}
            className="min-w-0 flex-1"
            contentClassName="gap-1.5"
          >
            <ExternalLink className="size-4 shrink-0" aria-hidden="true" />
            Open
          </Button>
        </div>
      </div>
    </article>
  );
}

function isNotificationDetailBusy({
  isOpening,
  isTogglingRead,
}: {
  isOpening: boolean;
  isTogglingRead: boolean;
}) {
  return isTogglingRead || isOpening;
}

function getNotificationDetailReadActionState({
  isRead,
  isReadActionDisabled,
}: {
  isRead: boolean;
  isReadActionDisabled: boolean;
}): NotificationDetailReadActionState {
  if (isRead) {
    return {
      icon: Mail,
      label: "Mark unread",
      title: getNotificationDetailReadActionTitle(isReadActionDisabled),
    };
  }

  return {
    icon: Check,
    label: "Mark read",
    title: getNotificationDetailReadActionTitle(isReadActionDisabled),
  };
}

function getNotificationDetailReadActionTitle(isReadActionDisabled: boolean) {
  return isReadActionDisabled
    ? "Reconnect to mark this notification as read or unread."
    : undefined;
}

function NotificationDetailUnreadMarker({ isRead }: { isRead: boolean }) {
  if (isRead) {
    return null;
  }

  return (
    <>
      <span className="size-2 rounded-full bg-forge-teal" aria-hidden="true" />
      <span className="sr-only">Unread notification</span>
    </>
  );
}

interface NotificationDetailSourceProps {
  avatarBadgeTone: AvatarBadgeTone;
  icon: LucideIcon;
  iconTone: IconTileTone;
  item: Notification;
}

function NotificationDetailSource({
  avatarBadgeTone,
  icon: Icon,
  iconTone,
  item,
}: NotificationDetailSourceProps) {
  if (item.avatarUrl) {
    return (
      <AvatarWithBadge
        src={item.avatarUrl}
        name={item.title}
        icon={Icon}
        badgeTone={avatarBadgeTone}
        avatarClassName="size-16"
      />
    );
  }

  return (
    <IconTile
      icon={Icon}
      tone={iconTone}
      size="xl"
      shape="square"
      className="size-16 rounded-xl"
      iconClassName="size-6"
    />
  );
}
