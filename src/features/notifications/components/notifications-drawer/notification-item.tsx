import { Loader2, type LucideIcon } from "lucide-react";
import { Avatar } from "@/shared/components/common/avatar";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import type { Notification } from "@/shared/schemas";
import { getTypeConfig, relativeTime } from "./notification-display";

interface NotificationItemProps {
  item: Notification;
  onSelect: (item: Notification) => void;
  isPending?: boolean;
}

export function NotificationItem({
  item,
  onSelect,
  isPending = false,
}: NotificationItemProps) {
  const config = getTypeConfig(item.type);
  const Icon = config.icon;

  return (
    <Button
      variant="ghost"
      onClick={() => onSelect(item)}
      disabled={isPending}
      aria-label={`Open notification details. ${item.isRead ? "Read" : "Unread"} notification. ${item.title}. ${item.message}`}
      className={cn(
        "h-auto w-full justify-start rounded-none border-none p-0 text-left hover:bg-muted/35 focus-visible:ring-inset",
        !item.isRead && "bg-forge-teal/8 hover:bg-forge-teal/10",
      )}
    >
      <span className="flex w-full min-w-0 items-start gap-3 px-5 py-4 text-left transition-colors duration-200">
        <NotificationSource
          icon={Icon}
          iconClassName={config.iconClassName}
          item={item}
        />

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex min-w-0 items-start gap-2">
            <p
              className={cn(
                "min-w-0 flex-1 truncate text-sm leading-tight",
                item.isRead
                  ? "font-semibold text-ink/80"
                  : "font-bold text-ink",
              )}
            >
              {item.title}
            </p>
            {!item.isRead && (
              <span
                className="mt-1.5 size-2 shrink-0 rounded-full bg-forge-teal"
                aria-hidden="true"
              />
            )}
            <time
              dateTime={item.createdAt}
              className="mt-0.5 shrink-0 font-medium text-slate-muted/70 text-xs"
            >
              {relativeTime(item.createdAt)}
            </time>
          </div>
          <p className="min-w-0 truncate font-normal text-slate-muted text-sm leading-snug">
            {item.message}
          </p>
          {isPending && (
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="inline-flex items-center gap-1 font-semibold text-forge-teal text-xs">
                <Loader2
                  className="size-3 shrink-0 animate-spin"
                  aria-hidden="true"
                />
                Opening
              </span>
            </div>
          )}
        </div>
      </span>
    </Button>
  );
}

interface NotificationSourceProps {
  icon: LucideIcon;
  iconClassName: string;
  item: Notification;
}

function NotificationSource({
  icon: Icon,
  iconClassName,
  item,
}: NotificationSourceProps) {
  if (item.avatarUrl) {
    return (
      <span className="relative mt-0.5 shrink-0" aria-hidden="true">
        <Avatar
          src={item.avatarUrl}
          name={item.title}
          className="size-10 border border-border/70 bg-canvas"
        />
        <span
          className={cn(
            "absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full border border-canvas",
            iconClassName,
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
        "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl",
        iconClassName,
      )}
      aria-hidden="true"
    >
      <Icon className="size-4 shrink-0" strokeWidth={2} />
    </span>
  );
}
