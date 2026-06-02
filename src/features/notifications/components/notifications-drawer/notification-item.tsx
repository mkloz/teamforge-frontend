import { Check, Loader2, type LucideIcon, Mail } from "lucide-react";
import { type PointerEvent, useRef } from "react";
import {
  type AvatarBadgeTone,
  AvatarWithBadge,
} from "@/shared/components/common/avatar-with-badge";
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";
import type { Notification } from "@/shared/schemas";
import { getTypeConfig, relativeTime } from "./notification-display";

const SWIPE_TOGGLE_THRESHOLD = 48;
const SWIPE_VERTICAL_TOLERANCE = 36;

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
  const swipeStartRef = useRef<{
    pointerId: number;
    x: number;
    y: number;
  } | null>(null);
  const didSwipeRef = useRef(false);

  function handleSelect() {
    if (didSwipeRef.current) {
      didSwipeRef.current = false;
      return;
    }

    onSelect(item);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "touch" || isBusy || isReadActionDisabled) {
      return;
    }

    swipeStartRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerCancel() {
    swipeStartRef.current = null;
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    const start = swipeStartRef.current;
    swipeStartRef.current = null;

    if (
      !start ||
      start.pointerId !== event.pointerId ||
      event.pointerType !== "touch" ||
      isBusy ||
      isReadActionDisabled
    ) {
      return;
    }

    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    const isHorizontalSwipe =
      Math.abs(deltaX) >= SWIPE_TOGGLE_THRESHOLD &&
      Math.abs(deltaY) <= SWIPE_VERTICAL_TOLERANCE &&
      Math.abs(deltaX) > Math.abs(deltaY) * 1.25;

    if (!isHorizontalSwipe) {
      return;
    }

    didSwipeRef.current = true;
    onToggleRead(item);
    window.setTimeout(() => {
      didSwipeRef.current = false;
    }, 0);
  }

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerCancel={handlePointerCancel}
      onPointerUp={handlePointerUp}
      className={cn(
        "group flex w-full touch-pan-y transition-colors duration-200 focus-within:bg-muted/35 hover:bg-muted/35",
        !item.isRead &&
          "bg-forge-teal/8 focus-within:bg-forge-teal/10 hover:bg-forge-teal/10",
      )}
    >
      <NotificationSource
        avatarBadgeTone={config.avatarBadgeTone}
        icon={Icon}
        iconClassName={config.iconClassName}
        item={item}
        isDisabled={isBusy || isReadActionDisabled}
        isTogglingRead={isTogglingRead}
        onToggleRead={() => onToggleRead(item)}
      />

      <Button
        variant="ghost"
        onClick={handleSelect}
        disabled={isBusy}
        aria-label={`Open notification details. ${item.isRead ? "Read" : "Unread"} notification. ${item.title}. ${item.message}`}
        className="h-auto min-w-0 flex-1 justify-start rounded-none border-none py-4 pr-5 pl-0 text-left focus-visible:ring-inset active:enabled:bg-transparent hover:enabled:bg-transparent"
      >
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex min-w-0 items-start gap-2">
            <span
              className={cn(
                "min-w-0 flex-1 truncate text-sm leading-tight",
                item.isRead
                  ? "font-semibold text-ink/80"
                  : "font-bold text-ink",
              )}
            >
              {item.title}
            </span>
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
          </span>
          <span className="min-w-0 truncate font-normal text-slate-muted text-sm leading-snug">
            {item.message}
          </span>
          {isPending && (
            <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="inline-flex items-center gap-1 font-semibold text-forge-teal text-xs">
                <Loader2
                  className="size-3 shrink-0 animate-spin"
                  aria-hidden="true"
                />
                Opening
              </span>
            </span>
          )}
        </span>
      </Button>
    </div>
  );
}

interface NotificationSourceProps {
  avatarBadgeTone: AvatarBadgeTone;
  icon: LucideIcon;
  iconClassName: string;
  isDisabled: boolean;
  isTogglingRead: boolean;
  item: Notification;
  onToggleRead: () => void;
}

function NotificationSource({
  avatarBadgeTone,
  icon: Icon,
  iconClassName,
  isDisabled,
  isTogglingRead,
  item,
  onToggleRead,
}: NotificationSourceProps) {
  const ReadStateIcon = item.isRead ? Mail : Check;
  const actionLabel = item.isRead ? "Mark as unread" : "Mark as read";

  return (
    <span className="relative mt-4 mr-3 ml-5 size-10 shrink-0">
      <span className="block transition-opacity duration-150 lg:group-hover:opacity-0 lg:group-focus-within:opacity-0">
        <NotificationSourceVisual
          avatarBadgeTone={avatarBadgeTone}
          icon={Icon}
          iconClassName={iconClassName}
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
            className="absolute inset-0 hidden size-10 rounded-md bg-canvas/95 p-0 opacity-0 shadow-sm transition-opacity duration-150 lg:inline-flex lg:group-hover:opacity-100 lg:group-focus-within:opacity-100"
          >
            <ReadStateIcon
              className="size-4 shrink-0 text-forge-teal"
              aria-hidden="true"
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">{actionLabel}</TooltipContent>
      </Tooltip>
    </span>
  );
}

interface NotificationSourceVisualProps {
  avatarBadgeTone: AvatarBadgeTone;
  icon: LucideIcon;
  iconClassName: string;
  item: Notification;
}

function NotificationSourceVisual({
  avatarBadgeTone,
  icon: Icon,
  iconClassName,
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
    <span
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-md",
        iconClassName,
      )}
      aria-hidden="true"
    >
      <Icon className="size-4 shrink-0" strokeWidth={2} />
    </span>
  );
}
