import { Link } from "@tanstack/react-router";
import {
  type AppNavigationItem,
  isAppNavigationItemActive,
} from "@/features/app-shell/public/app-navigation";
import { CountBadge } from "@/shared/components/ui/count-badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";

interface NavItemProps {
  item: AppNavigationItem;
  pathname: string;
}

function getNavItemState(item: AppNavigationItem, pathname: string) {
  const badge = item.badge ?? 0;
  const hasBadge = badge > 0;

  return {
    active: isAppNavigationItemActive(item, pathname),
    ariaLabel: hasBadge ? `${item.label}, ${badge} unread` : item.label,
    badge,
    hasBadge,
    tooltipLabel: hasBadge ? `${item.label} (${badge})` : item.label,
  };
}

function getNavLinkClassName(active: boolean) {
  return cn(
    "group relative flex items-center rounded-lg transition-colors duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
    // Icon-only centered square for both tablet and desktop
    "size-10 justify-center",
    "font-medium text-sm",
    active
      ? "bg-secondary text-primary"
      : "text-muted-foreground hover:bg-muted hover:text-foreground",
  );
}

function getNavIconClassName(active: boolean) {
  return cn(
    "shrink-0 transition-colors duration-150",
    active
      ? "text-primary"
      : "text-muted-foreground group-hover:text-foreground",
  );
}

function getNavBadgeClassName(badge: number) {
  return cn(
    "type-signature-label absolute -top-1.5 -right-1.5 z-10 h-4 min-w-4 ring-2 ring-canvas",
    badge > 9 ? "min-w-5 px-1" : "p-0",
  );
}

export function NavItem({ item, pathname }: NavItemProps) {
  const Icon = item.icon;
  const { active, ariaLabel, badge, hasBadge, tooltipLabel } = getNavItemState(
    item,
    pathname,
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          {...item.navigation}
          aria-current={active ? "page" : undefined}
          aria-label={ariaLabel}
          className={getNavLinkClassName(active)}
        >
          {/* Active left-border indicator — thin and subtle */}
          {active && (
            <span
              className="absolute top-1/2 left-0 h-6 w-1 -translate-y-1/2 rounded-full bg-primary"
              aria-hidden="true"
            />
          )}

          <div className="relative flex items-center justify-center">
            <Icon
              size={20}
              className={getNavIconClassName(active)}
              aria-hidden="true"
            />

            {hasBadge && (
              <CountBadge
                aria-hidden="true"
                count={badge}
                max={9}
                size="xs"
                tone="amber"
                className={getNavBadgeClassName(badge)}
              />
            )}
          </div>
          <span className="sr-only">{item.label}</span>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right">{tooltipLabel}</TooltipContent>
    </Tooltip>
  );
}
