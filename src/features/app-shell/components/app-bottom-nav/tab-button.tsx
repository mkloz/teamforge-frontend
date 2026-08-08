import { Link } from "@tanstack/react-router";
import {
  type AppNavigationItem,
  isAppNavigationItemActive,
} from "@/features/app-shell/public/app-navigation";
import { CountBadge } from "@/shared/components/ui/count-badge";
import { cn } from "@/shared/lib/utils";

interface TabButtonProps {
  item: AppNavigationItem;
  pathname: string;
}

interface TabButtonState {
  active: boolean;
  activeBackgroundClassName: string;
  activeTextClassName: string;
  ariaLabel: string;
  badge: number;
  hasBadge: boolean;
}

const INACTIVE_ICON_CLASS_NAME = "text-muted-foreground stroke-[1.5]";

function getTabButtonState(
  item: AppNavigationItem,
  pathname: string,
): TabButtonState {
  const badge = item.badge ?? 0;
  const hasBadge = badge > 0;
  const isForge = item.id === "forge";

  return {
    active: isAppNavigationItemActive(item, pathname),
    activeBackgroundClassName: getActiveBackgroundClassName(isForge),
    activeTextClassName: getActiveTextClassName(isForge),
    ariaLabel: getTabAriaLabel(item, badge),
    badge,
    hasBadge,
  };
}

function getTabAriaLabel(item: AppNavigationItem, badge: number) {
  if (badge <= 0) {
    return item.label;
  }

  return item.id === "home"
    ? `${item.label}, ${badge} unread notifications`
    : `${item.label}, ${badge} unread`;
}

function getActiveTextClassName(isForge: boolean) {
  return isForge ? "text-accent stroke-[2.5]" : "text-foreground stroke-[2.5]";
}

function getActiveBackgroundClassName(isForge: boolean) {
  return isForge
    ? "border-accent/25 bg-accent/15 dark:bg-accent/20"
    : "border-foreground/15 bg-foreground/8 dark:bg-white/8";
}

function getTabBadgeClassName(badge: number) {
  return cn(
    "absolute -top-1.5 -right-2 z-10 ring-2 ring-canvas",
    badge > 9 ? "h-4.5 min-w-5 px-1" : "size-4.5 p-0",
  );
}

export function TabButton({ item, pathname }: TabButtonProps) {
  const ItemIcon = item.icon;
  const state = getTabButtonState(item, pathname);

  return (
    <Link
      {...item.navigation}
      data-onboarding-tour={`nav-${item.id}`}
      aria-current={state.active ? "page" : undefined}
      aria-label={state.ariaLabel}
      className={cn(
        "relative flex h-full min-w-0 items-center justify-center rounded-full",
        "transition-colors duration-200 hover:bg-muted/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
      )}
    >
      <div
        className={cn(
          "relative z-10 flex size-full min-w-0 flex-col items-center justify-center gap-0.5",
          "transition-transform duration-150 active:scale-90",
        )}
      >
        <div
          className={cn(
            "relative flex items-center justify-center transition-[background-color,border-color,box-shadow,width,height] duration-300 ease-out",
            state.active
              ? `size-10 rounded-full border ${state.activeBackgroundClassName}`
              : "size-8 rounded-full bg-transparent shadow-none",
          )}
        >
          <ItemIcon
            size={state.active ? 21 : 17}
            aria-hidden="true"
            className={cn(
              "shrink-0 transition-colors duration-300",
              state.active
                ? state.activeTextClassName
                : INACTIVE_ICON_CLASS_NAME,
            )}
          />
          <TabButtonBadge state={state} />
        </div>

        <TabButtonLabel isActive={state.active} label={item.label} />
      </div>
    </Link>
  );
}

function TabButtonBadge({ state }: { state: TabButtonState }) {
  return state.hasBadge ? (
    <CountBadge
      aria-hidden="true"
      count={state.badge}
      max={9}
      size="sm"
      tone="amber"
      className={getTabBadgeClassName(state.badge)}
    />
  ) : null;
}

function TabButtonLabel({
  isActive,
  label,
}: {
  isActive: boolean;
  label: string;
}) {
  return (
    <span
      aria-hidden={isActive}
      className={cn(
        "max-w-full overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-muted-foreground text-xs leading-none tracking-tight",
        "transition-[max-height,opacity,transform] duration-200 ease-out",
        isActive
          ? "max-h-0 -translate-y-0.5 opacity-0"
          : "max-h-4 translate-y-0 opacity-100",
      )}
    >
      {label}
    </span>
  );
}
