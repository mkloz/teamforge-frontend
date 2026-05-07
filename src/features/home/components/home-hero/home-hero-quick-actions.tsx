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
      <span className="inline-flex min-h-9 max-w-full min-w-0 shrink-0 items-center gap-1.5 rounded-full border border-forge-teal/20 bg-forge-teal/8 px-3 py-1.5 text-xs font-bold text-slate-muted sm:min-h-8 sm:px-2.5">
        <Route className="size-3.5" aria-hidden="true" />
        <span className="truncate">{signal}</span>
      </span>
      {homeQuickActions.map(({ id, label, icon: Icon, navigation }) => (
        <Link
          key={id}
          {...navigation}
          className={cn(
            "inline-flex min-h-11 shrink-0 items-center gap-1 rounded-full border border-transparent px-3 py-1.5 sm:min-h-8 sm:px-2.5",
            "text-xs font-bold text-muted-foreground transition-colors duration-150",
            "hover:bg-secondary hover:text-forge-teal",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          )}
        >
          <Icon className="size-3.5" aria-hidden="true" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
