import { Check, type LucideIcon, Mail } from "lucide-react";
import {
  type AvatarBadgeTone,
  AvatarWithBadge,
} from "@/shared/components/common/avatar-with-badge";
import { Button } from "@/shared/components/ui/button";
import { IconTile, type IconTileTone } from "@/shared/components/ui/icon-tile";
import { Spinner } from "@/shared/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { presentPlanReadinessSummary } from "@/shared/lib/lifecycle-presenters";
import { cn } from "@/shared/lib/utils";
import type { Notification } from "@/shared/schemas";
import { getTypeConfig, relativeTime } from "./notification-display";

interface NotificationItemProps {
  item: Notification;
  onSelect: (item: Notification) => void;
  onToggleRead: (item: Notification) => void;
  isPending?: boolean;
  isReadActionDisabled?: boolean;
  isTogglingRead?: boolean;
}

export function NotificationItem({
  item,
  onSelect,
  onToggleRead,
  isPending = false,
  isReadActionDisabled = false,
  isTogglingRead = false,
}: NotificationItemProps) {
  const config = getTypeConfig(item.type);
  const Icon = config.icon;
  const isBusy = isPending || isTogglingRead;

  return (
    <div
      className={cn(
        "group relative flex min-h-20 w-full transition-colors duration-200 focus-within:bg-foreground/4 hover:bg-foreground/4",
        !item.isRead &&
          "bg-(--grouped-menu-selected) focus-within:bg-primary-soft hover:bg-primary-soft",
      )}
    >
      {!item.isRead ? (
        <span
          className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-brand-teal"
          aria-hidden="true"
        />
      ) : null}
      <NotificationSource
        avatarBadgeTone={config.avatarBadgeTone}
        icon={Icon}
        iconTone={config.iconTone}
        item={item}
        isDisabled={isBusy || isReadActionDisabled}
        isReadActionDisabled={isReadActionDisabled}
        isTogglingRead={isTogglingRead}
        onToggleRead={() => onToggleRead(item)}
      />

      <Button
        variant="ghost"
        onClick={() => onSelect(item)}
        disabled={isBusy}
        aria-label={`View notification details: ${item.title}. Status: ${item.isRead ? "read" : "unread"}.`}
        className="h-auto min-w-0 flex-1 justify-start rounded-none border-none py-3.5 pr-4 pl-3 text-left focus-visible:ring-inset active:enabled:bg-transparent hover:enabled:bg-transparent"
      >
        <NotificationItemContent item={item} isPending={isPending} />
      </Button>
    </div>
  );
}

function NotificationItemContent({
  isPending,
  item,
}: {
  isPending: boolean;
  item: Notification;
}) {
  const readiness = item.operationalState
    ? presentPlanReadinessSummary({
        overall: item.operationalState.overall,
        requiredAction: item.operationalState.requiredAction,
      })
    : null;
  return (
    <span className="flex min-w-0 flex-1 flex-col gap-1.5">
      <NotificationTitleLine item={item} />
      <span className="line-clamp-2 min-w-0 whitespace-normal font-normal text-slate-muted text-sm leading-snug">
        {item.message}
      </span>
      {readiness ? (
        <span className="font-semibold text-foreground text-xs">
          {readiness.title}
        </span>
      ) : null}
      <NotificationPendingState isPending={isPending} />
    </span>
  );
}

function NotificationTitleLine({ item }: { item: Notification }) {
  return (
    <span className="flex min-w-0 items-start gap-2">
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-sm leading-tight",
          item.isRead ? "font-semibold text-ink/80" : "font-bold text-ink",
        )}
      >
        {item.title}
      </span>
      <time
        dateTime={item.createdAt}
        className="mt-px shrink-0 font-medium text-slate-muted/75 text-xs"
      >
        {relativeTime(item.createdAt)}
      </time>
    </span>
  );
}

function NotificationPendingState({ isPending }: { isPending: boolean }) {
  if (!isPending) {
    return null;
  }

  return (
    <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
      <span className="inline-flex items-center gap-1 font-semibold text-foreground text-xs">
        <Spinner className="size-3 shrink-0" aria-hidden="true" />
        Opening
      </span>
    </span>
  );
}

interface NotificationSourceProps {
  avatarBadgeTone: AvatarBadgeTone;
  icon: LucideIcon;
  iconTone: IconTileTone;
  isDisabled: boolean;
  isReadActionDisabled: boolean;
  isTogglingRead: boolean;
  item: Notification;
  onToggleRead: () => void;
}

function NotificationSource({
  avatarBadgeTone,
  icon: Icon,
  iconTone,
  isDisabled,
  isReadActionDisabled,
  isTogglingRead,
  item,
  onToggleRead,
}: NotificationSourceProps) {
  const ReadStateIcon = item.isRead ? Mail : Check;
  const actionLabel = item.isRead ? "Mark as unread" : "Mark as read";

  return (
    <span className="relative mt-3.5 mr-3 ml-4 size-11 shrink-0 [@media(pointer:fine)]:size-10">
      <span className="flex size-full items-center justify-center transition-opacity duration-150 lg:group-hover:opacity-0 lg:group-focus-within:opacity-0 [@media(pointer:coarse)]:opacity-0">
        <NotificationSourceVisual
          avatarBadgeTone={avatarBadgeTone}
          icon={Icon}
          iconTone={iconTone}
          item={item}
        />
      </span>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="accentGhost"
            size="icon-sm"
            onClick={onToggleRead}
            disabled={isDisabled}
            loading={isTogglingRead}
            aria-label={`${actionLabel}. ${item.title}`}
            title={
              isReadActionDisabled
                ? `Reconnect to ${actionLabel.toLowerCase()}.`
                : actionLabel
            }
            className="absolute inset-0 hidden size-11 rounded-md bg-canvas/95 p-0 opacity-0 shadow-sm transition-opacity duration-150 lg:inline-flex lg:group-hover:opacity-100 lg:group-focus-within:opacity-100 [@media(pointer:coarse)]:inline-flex [@media(pointer:coarse)]:opacity-100 [@media(pointer:fine)]:size-10"
          >
            <ReadStateIcon
              className="size-4 shrink-0 text-foreground"
              aria-hidden="true"
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          {isReadActionDisabled
            ? `Reconnect to ${actionLabel.toLowerCase()}.`
            : actionLabel}
        </TooltipContent>
      </Tooltip>
    </span>
  );
}

interface NotificationSourceVisualProps {
  avatarBadgeTone: AvatarBadgeTone;
  icon: LucideIcon;
  iconTone: IconTileTone;
  item: Notification;
}

function NotificationSourceVisual({
  avatarBadgeTone,
  icon: Icon,
  iconTone,
  item,
}: NotificationSourceVisualProps) {
  if (item.avatarUrl) {
    return (
      <AvatarWithBadge
        src={item.avatarUrl}
        name={item.title}
        icon={Icon}
        badgeTone={avatarBadgeTone}
      />
    );
  }

  return (
    <IconTile
      icon={Icon}
      tone={iconTone}
      size="lg"
      shape="square"
      iconClassName="size-4"
    />
  );
}
