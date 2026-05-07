import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import {
  isAppNavigationItemActive,
  type AppNavigationItem,
} from "@/features/app-shell/lib/app-navigation";
import { cn } from "@/shared/lib/utils";
import { Link } from "@tanstack/react-router";

interface NavItemProps {
  item: AppNavigationItem;
  pathname: string;
}

export function NavItem({ item, pathname }: NavItemProps) {
  const Icon = item.icon;
  const active = isAppNavigationItemActive(item, pathname);
  const badge = item.badge ?? 0;
  const hasBadge = badge > 0;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          {...item.navigation}
          aria-current={active ? "page" : undefined}
          aria-label={item.label}
          className={cn(
            "group relative flex items-center rounded-lg transition-colors duration-150",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:outline-none",
            // Icon-only centered square for both tablet and desktop
            "h-10 w-10 justify-center",
            "text-sm font-medium",
            active
              ? "bg-secondary text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
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
              className={cn(
                "shrink-0 transition-colors duration-150",
                active
                  ? "text-primary"
                  : "text-muted-foreground group-hover:text-foreground",
              )}
              aria-hidden="true"
            />

            {hasBadge && (
              <span
                className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-sidebar bg-accent px-1 text-xs font-bold text-accent-foreground shadow-sm"
                aria-label={`${badge} unread`}
              >
                {badge > 9 ? "9+" : badge}
              </span>
            )}
          </div>
          <span className="sr-only">{item.label}</span>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right">
        {item.label}
        {hasBadge && ` (${badge})`}
      </TooltipContent>
    </Tooltip>
  );
}
