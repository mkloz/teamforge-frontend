import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import type { AppNavigationItem } from "@/features/app-shell/lib/app-navigation";
import { cn } from "@/shared/lib/utils";
import { Link } from "@tanstack/react-router";
import { useActiveRoute } from "@/features/app-shell/hooks/use-active-route";

interface NavItemProps {
  item: AppNavigationItem;
}

export function NavItem({ item }: NavItemProps) {
  const { isActive, startsWith } = useActiveRoute();
  const Icon = item.icon;
  const activePath = item.navigation.to;
  const active =
    item.matchMode === "prefix" ? startsWith(activePath) : isActive(activePath);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          {...item.navigation}
          aria-current={active ? "page" : undefined}
          aria-label={item.label}
          className={cn(
            "group relative flex items-center rounded-xl transition-colors duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
            // Icon-only centered square for both tablet and desktop
            "justify-center h-10 w-10",
            "text-sm font-medium",
            active
              ? "bg-secondary text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          {/* Active left-border indicator — thin and subtle */}
          {active && (
            <span
              className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-primary"
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

            {item.badge != null && item.badge > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground shadow-sm border-2 border-sidebar"
                aria-label={`${item.badge} unread`}
              >
                {item.badge > 9 ? "9+" : item.badge}
              </span>
            )}
          </div>
          <span className="sr-only">{item.label}</span>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right">
        {item.label}
        {item.badge != null && item.badge > 0 && ` (${item.badge})`}
      </TooltipContent>
    </Tooltip>
  );
}
