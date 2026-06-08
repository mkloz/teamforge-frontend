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
  const isBusy = isTogglingRead || isOpening;
  const ReadStateIcon = item.isRead ? Mail : Check;

  return (
    <article className="flex min-h-full flex-col">
      <div className="sticky top-0 z-10 bg-canvas/95 px-5 pt-3 pb-1 backdrop-blur">
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
        <div className="flex min-w-0 items-start gap-3">
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
                className="font-semibold text-slate-muted text-xs"
              >
                {relativeTime(item.createdAt)}
              </time>
              {!item.isRead && (
                <>
                  <span
                    className="size-2 rounded-full bg-forge-teal"
                    aria-hidden="true"
                  />
                  <span className="sr-only">Unread notification</span>
                </>
              )}
            </div>
            <h3 className="mt-1 text-balance font-bold text-ink text-xl leading-tight tracking-tight">
              {item.title}
            </h3>
          </div>
        </div>

        <p className="mt-6 max-w-sm whitespace-pre-wrap text-base text-ink/85 leading-7">
          {item.message}
        </p>

        <dl className="mt-8 grid gap-3">
          <div>
            <dt className="font-semibold text-slate-muted text-xs leading-tight">
              Received
            </dt>
            <dd className="mt-1 font-semibold text-ink/75 text-sm">
              {formatNotificationDate(item.createdAt)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="sticky bottom-0 bg-canvas/95 px-5 pt-3 pb-5 backdrop-blur">
        <div className="flex items-center gap-2">
          <Button
            variant="accentGhost"
            size="sm"
            onClick={() => onToggleRead(item)}
            disabled={isBusy || isReadActionDisabled}
            loading={isTogglingRead}
            title={
              isReadActionDisabled
                ? "Reconnect to update read state"
                : undefined
            }
            className="min-w-0 flex-1"
            contentClassName="gap-1.5"
          >
            <ReadStateIcon className="size-4 shrink-0" aria-hidden="true" />
            {item.isRead ? "Mark unread" : "Mark read"}
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
        avatarClassName="size-12"
      />
    );
  }

  return (
    <IconTile
      icon={Icon}
      tone={iconTone}
      size="xl"
      shape="square"
      iconClassName="size-5"
    />
  );
}
