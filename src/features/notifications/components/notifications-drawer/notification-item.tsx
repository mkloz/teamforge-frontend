import { Check, Loader2, type LucideIcon, Mail } from "lucide-react";
import { type MutableRefObject, type PointerEvent, useRef } from "react";
import {
  type AvatarBadgeTone,
  AvatarWithBadge,
} from "@/shared/components/common/avatar-with-badge";
import { Button } from "@/shared/components/ui/button";
import { IconTile, type IconTileTone } from "@/shared/components/ui/icon-tile";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { scheduleDelay } from "@/shared/lib/browser-scheduling";
import { cn } from "@/shared/lib/utils";
import type { Notification } from "@/shared/schemas";
import { getTypeConfig, relativeTime } from "./notification-display";

const SWIPE_TOGGLE_THRESHOLD = 48;
const SWIPE_VERTICAL_TOLERANCE = 36;

interface SwipeStart {
  pointerId: number;
  x: number;
  y: number;
}

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
  const swipeStartRef = useRef<SwipeStart | null>(null);
  const didSwipeRef = useRef(false);

  function handleSelect() {
    if (didSwipeRef.current) {
      didSwipeRef.current = false;
      return;
    }

    onSelect(item);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (
      !canStartReadSwipe({
        event,
        isBusy,
        isReadActionDisabled,
      })
    ) {
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
      !canCompleteReadSwipe({ event, isBusy, isReadActionDisabled, start })
    ) {
      return;
    }

    if (!isHorizontalReadSwipe(getSwipeDelta(event, start))) {
      return;
    }

    didSwipeRef.current = true;
    onToggleRead(item);
    resetSwipeSelectionGuard(didSwipeRef);
  }

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerCancel={handlePointerCancel}
      onPointerUp={handlePointerUp}
      className={cn(
        "group relative flex min-h-20 w-full touch-pan-y transition-colors duration-200 focus-within:bg-foreground/4 hover:bg-foreground/4",
        !item.isRead &&
          "bg-(--grouped-menu-selected) focus-within:bg-forge-teal/9 hover:bg-forge-teal/9",
      )}
    >
      {!item.isRead ? (
        <span
          className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-forge-teal"
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
        onClick={handleSelect}
        disabled={isBusy}
        aria-label={`Open notification details. ${item.isRead ? "Read" : "Unread"} notification. ${item.title}. ${item.message}`}
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
  return (
    <span className="flex min-w-0 flex-1 flex-col gap-1.5">
      <NotificationTitleLine item={item} />
      <span className="line-clamp-2 min-w-0 whitespace-normal font-normal text-slate-muted text-sm leading-snug">
        {item.message}
      </span>
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
        className="mt-px shrink-0 font-medium text-[0.6875rem] text-slate-muted/60"
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
      <span className="inline-flex items-center gap-1 font-semibold text-forge-teal text-xs">
        <Loader2 className="size-3 shrink-0 animate-spin" aria-hidden="true" />
        Opening
      </span>
    </span>
  );
}

function canStartReadSwipe({
  event,
  isBusy,
  isReadActionDisabled,
}: {
  event: PointerEvent<HTMLDivElement>;
  isBusy: boolean;
  isReadActionDisabled: boolean;
}) {
  return event.pointerType === "touch" && !isBusy && !isReadActionDisabled;
}

function canCompleteReadSwipe({
  event,
  isBusy,
  isReadActionDisabled,
  start,
}: {
  event: PointerEvent<HTMLDivElement>;
  isBusy: boolean;
  isReadActionDisabled: boolean;
  start: SwipeStart;
}) {
  return (
    start.pointerId === event.pointerId &&
    event.pointerType === "touch" &&
    !isBusy &&
    !isReadActionDisabled
  );
}

function getSwipeDelta(event: PointerEvent<HTMLDivElement>, start: SwipeStart) {
  return {
    x: event.clientX - start.x,
    y: event.clientY - start.y,
  };
}

function isHorizontalReadSwipe({ x, y }: { x: number; y: number }) {
  const absoluteX = Math.abs(x);
  const absoluteY = Math.abs(y);

  return (
    absoluteX >= SWIPE_TOGGLE_THRESHOLD &&
    absoluteY <= SWIPE_VERTICAL_TOLERANCE &&
    absoluteX > absoluteY * 1.25
  );
}

function resetSwipeSelectionGuard(didSwipeRef: MutableRefObject<boolean>) {
  scheduleDelay(() => {
    didSwipeRef.current = false;
  }, 0);
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
      <span className="flex size-full items-center justify-center transition-opacity duration-150 lg:group-hover:opacity-0 lg:group-focus-within:opacity-0 lg:[@media(pointer:coarse)]:opacity-0">
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
            className="absolute inset-0 hidden size-11 rounded-md bg-canvas/95 p-0 opacity-0 shadow-sm transition-opacity duration-150 lg:inline-flex lg:group-hover:opacity-100 lg:group-focus-within:opacity-100 lg:[@media(pointer:coarse)]:opacity-100 [@media(pointer:fine)]:size-10"
          >
            <ReadStateIcon
              className="size-4 shrink-0 text-forge-teal"
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
