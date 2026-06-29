import { Link } from "@tanstack/react-router";
import { Route } from "lucide-react";

import { homeQuickActions } from "@/features/app-shell/public/app-navigation";
import { StatusPill } from "@/shared/components/ui/status-pill";
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
      <StatusPill
        icon={Route}
        size="md"
        tone="teal"
        surface="soft"
        className="min-h-9 min-w-0 max-w-full text-slate-muted sm:min-h-8 sm:px-2.5"
      >
        <span className="truncate">{signal}</span>
      </StatusPill>
      {homeQuickActions.map(({ id, label, icon: Icon, navigation }) => (
        <Link
          key={id}
          {...navigation}
          className={cn(
            "inline-flex min-h-11 shrink-0 items-center gap-1 rounded-full border border-transparent px-3 py-1.5 sm:min-h-8 sm:px-2.5",
            "font-bold text-muted-foreground text-xs transition-colors duration-150",
            "hover:bg-secondary hover:text-forge-teal",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
        >
          <Icon className="size-3.5" aria-hidden="true" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
