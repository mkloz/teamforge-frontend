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
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        active
          ? "bg-secondary text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {/* Active left-border indicator */}
      {active && (
        <span
          className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary"
          aria-hidden="true"
        />
      )}

      <Icon
        size={18}
        className={cn(
          "shrink-0 transition-colors duration-150",
          active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
        )}
        aria-hidden="true"
      />

      <span className="flex-1 truncate">{label}</span>

      {badge != null && badge > 0 && (
        <span
          className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground"
          aria-label={`${badge} unread`}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}
