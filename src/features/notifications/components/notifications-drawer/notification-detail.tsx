import { ArrowLeft, Check, ExternalLink, type LucideIcon } from "lucide-react";
import { Avatar } from "@/shared/components/common/avatar";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import type { Notification } from "@/shared/schemas";
import {
  formatNotificationDate,
  getTypeConfig,
  relativeTime,
} from "./notification-display";

interface NotificationDetailProps {
  item: Notification;
  isMarkingRead: boolean;
  isOpening: boolean;
  onBack: () => void;
  onMarkRead: (item: Notification) => void;
  onOpen: (item: Notification) => void;
}

export function NotificationDetail({
  item,
  isMarkingRead,
  isOpening,
  onBack,
  onMarkRead,
  onOpen,
}: NotificationDetailProps) {
  const config = getTypeConfig(item.type);
  const Icon = config.icon;
  const isBusy = isMarkingRead || isOpening;

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
            avatarIconClassName={config.avatarIconClassName}
            icon={Icon}
            iconClassName={config.iconClassName}
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
            <dt className="font-bold text-nano text-slate-muted uppercase leading-tight tracking-widest">
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
          {!item.isRead && (
            <Button
              variant="accentGhost"
              size="sm"
              onClick={() => onMarkRead(item)}
              disabled={isBusy}
              loading={isMarkingRead}
              className="min-w-0 flex-1"
              contentClassName="gap-1.5"
            >
              <Check className="size-4 shrink-0" aria-hidden="true" />
              Mark read
            </Button>
          )}
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
  avatarIconClassName: string;
  icon: LucideIcon;
  iconClassName: string;
  item: Notification;
}

function NotificationDetailSource({
  avatarIconClassName,
  icon: Icon,
  iconClassName,
  item,
}: NotificationDetailSourceProps) {
  if (item.avatarUrl) {
    return (
      <span className="relative shrink-0" aria-hidden="true">
        <Avatar
          src={item.avatarUrl}
          name={item.title}
          className="size-12 border border-border/70 bg-canvas"
        />
        <span
          className={cn(
            "absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full border-2 border-canvas",
            avatarIconClassName,
          )}
        >
          <Icon className="size-3 shrink-0" strokeWidth={2} />
        </span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "flex size-12 shrink-0 items-center justify-center rounded-md",
        iconClassName,
      )}
      aria-hidden="true"
    >
      <Icon className="size-5 shrink-0" strokeWidth={2} />
    </span>
  );
}
