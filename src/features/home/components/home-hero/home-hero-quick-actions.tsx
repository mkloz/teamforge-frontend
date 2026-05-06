import { Link } from "@tanstack/react-router";
import { Route } from "lucide-react";

import { homeQuickActions } from "@/features/app-shell/lib/app-navigation";
import { cn } from "@/shared/lib/utils";

interface HomeHeroQuickActionsProps {
  signal: string;
}

export function HomeHeroQuickActions({ signal }: HomeHeroQuickActionsProps) {
  return (
    <nav
      aria-label="Quick actions"
      className="flex flex-wrap items-center gap-1 sm:gap-1.5"
    >
      <span className="inline-flex min-h-8 min-w-0 max-w-full shrink-0 items-center gap-1 rounded-full border border-forge-teal/20 bg-forge-teal/8 px-2.5 py-1.5 text-[11px] font-bold text-slate-muted sm:text-xs">
        <Route className="size-3 sm:size-3.5" aria-hidden="true" />
        <span className="truncate">{signal}</span>
      </span>
      {homeQuickActions.map(({ id, label, icon: Icon, navigation }) => (
        <Link
          key={id}
          {...navigation}
          className={cn(
            "inline-flex min-h-11 shrink-0 items-center gap-1 rounded-full border border-transparent px-3 py-1.5 sm:min-h-8 sm:px-2.5",
            "text-[11px] font-bold text-muted-foreground transition-colors duration-150 sm:text-xs",
            "hover:bg-secondary hover:text-forge-teal",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
        >
          <Icon className="size-3 sm:size-3.5" aria-hidden="true" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
