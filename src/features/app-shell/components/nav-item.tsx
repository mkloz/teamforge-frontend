import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";
import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { useActiveRoute } from "../hooks/use-active-route";

interface NavItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
  badge?: number;
  /** Match on prefix instead of exact path (e.g. /activity matches /activity/groups/123) */
  matchPrefix?: boolean;
}

export function NavItem({
  to,
  icon: Icon,
  label,
  badge,
  matchPrefix = false,
}: NavItemProps) {
  const { isActive, startsWith } = useActiveRoute();
  const active = matchPrefix ? startsWith(to) : isActive(to);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          to={to}
          aria-current={active ? "page" : undefined}
          aria-label={label}
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

            {badge != null && badge > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground shadow-sm border-2 border-sidebar"
                aria-label={`${badge} unread`}
              >
                {badge > 9 ? "9+" : badge}
              </span>
            )}
          </div>
          <span className="sr-only">{label}</span>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right">
        {label}
        {badge != null && badge > 0 && ` (${badge})`}
      </TooltipContent>
    </Tooltip>
  );
}
