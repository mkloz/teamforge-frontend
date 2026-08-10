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
  const isPlanCreation = item.id === "planCreation";

  return {
    active: isAppNavigationItemActive(item, pathname),
    activeBackgroundClassName: getActiveBackgroundClassName(isPlanCreation),
    activeTextClassName: getActiveTextClassName(isPlanCreation),
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

function getActiveTextClassName(isPlanCreation: boolean) {
  return isPlanCreation
    ? "text-accent stroke-[2.5]"
    : "text-foreground stroke-[2.5]";
}

function getActiveBackgroundClassName(isPlanCreation: boolean) {
  return isPlanCreation
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
        "group relative flex h-full min-w-0 items-center justify-center rounded-full",
        "transition-colors duration-150 hover:bg-muted/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset active:bg-muted/60 motion-reduce:transition-none",
      )}
    >
      <div className="relative z-10 grid size-full min-w-0 grid-rows-[2.5rem_0.875rem] place-items-center content-center gap-0.5">
        <div className="relative flex size-10 items-center justify-center">
          <span
            className={cn(
              "absolute inset-0 flex items-center justify-center rounded-full border border-transparent",
              "transition-[background-color,border-color,transform] duration-150 ease-out group-active:scale-[0.96] motion-reduce:transform-none motion-reduce:transition-none",
              state.active && state.activeBackgroundClassName,
            )}
          >
            <ItemIcon
              size={21}
              aria-hidden="true"
              className={cn(
                "shrink-0 transition-[color,transform] duration-150 ease-out motion-reduce:transition-none",
                state.active
                  ? `scale-100 ${state.activeTextClassName}`
                  : `scale-[0.81] ${INACTIVE_ICON_CLASS_NAME}`,
              )}
            />
          </span>
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
        "h-3.5 max-w-full overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-muted-foreground text-xs leading-none tracking-tight",
        "transition-[opacity,transform] duration-150 ease-out motion-reduce:transition-none",
        isActive
          ? "-translate-y-0.5 opacity-0 motion-reduce:transform-none"
          : "translate-y-0 opacity-100",
      )}
    >
      {label}
    </span>
  );
}
