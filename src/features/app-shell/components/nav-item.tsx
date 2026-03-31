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
      aria-label={label}
      className={cn(
        "group relative flex items-center rounded-xl transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        // Tablet (md): icon-only centered square
        "justify-center h-10 w-10 lg:justify-start lg:h-auto lg:w-auto lg:gap-3 lg:px-3 lg:py-2.5",
        "text-sm font-medium",
        active
          ? "bg-secondary text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {/* Active left-border indicator — wider and taller for visibility */}
      {active && (
        <span
          className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-primary"
          aria-hidden="true"
        />
      )}

      <Icon
        size={18}
        className={cn(
          "shrink-0 transition-colors duration-150",
          active
            ? "text-primary"
            : "text-muted-foreground group-hover:text-foreground",
        )}
        aria-hidden="true"
      />

      {/* Label: hidden on tablet, visible on desktop */}
      <span className="hidden lg:inline flex-1 truncate">{label}</span>

      {badge != null && badge > 0 && (
        <span
          className="hidden lg:flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-micro font-bold text-accent-foreground"
          aria-label={`${badge} unread`}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}
