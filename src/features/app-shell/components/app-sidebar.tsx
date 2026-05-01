import { TeamForgeLogo } from "@/assets/logo";
import { Button } from "@/shared/components/ui/button";
import {
  appSidebarNavigation,
  getAppNavigationItem,
} from "@/shared/lib/app-navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useActiveRoute } from "@/features/app-shell/hooks/use-active-route";
import { NavItem } from "@/features/app-shell/components/nav-item";

interface AppSidebarProps {
  className?: string;
  notificationTrigger?: ReactNode;
}

export function AppSidebar({
  className,
  notificationTrigger,
}: AppSidebarProps) {
  const { isActive } = useActiveRoute();
  const forgeItem = getAppNavigationItem("forge");
  const settingsItem = getAppNavigationItem("settings");
  const ForgeIcon = forgeItem.icon;
  const isForgeActive = isActive("/forge");

  return (
    <aside
      aria-label="Desktop navigation"
      className={cn(
        "fixed top-0 left-0 bottom-0 z-40",
        // Hidden on mobile, icon-only on tablet and desktop
        "hidden md:flex flex-col",
        "w-14",
        "bg-sidebar border-r border-sidebar-border",
        className,
      )}
    >
      {/* Top section: Logo */}
      <div className="flex h-16 items-center justify-center shrink-0">
        <Link
          to="/"
          className="hover:opacity-80 transition-opacity"
          aria-label="TeamForge landing page"
        >
          <TeamForgeLogo className="size-8" showBackground={false} />
        </Link>
      </div>

      <div className="mx-1.5 h-px bg-sidebar-border/50" aria-hidden="true" />

      {/* Primary nav */}
      <nav
        className="flex flex-col items-center gap-1 px-1.5 pt-3 pb-2 flex-1"
        aria-label="App navigation"
      >
        {appSidebarNavigation.map((item) => (
          <NavItem key={item.id} item={item} />
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-1.5 h-px bg-sidebar-border/50" aria-hidden="true" />

      {/* Bottom section: notifications, settings + forge */}
      <div className="px-1.5 py-4 flex flex-col items-center gap-3">
        {notificationTrigger}

        <NavItem item={settingsItem} />

        {/* Forge button — icon only */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              asChild
              size="icon"
              variant="ghost"
              className={cn(
                "group relative flex items-center justify-center rounded-xl transition-all duration-150 size-10",
                isForgeActive
                  ? "bg-accent/10 text-accent"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Link {...forgeItem.navigation} aria-label="Forge my group">
                {/* Active indicator */}
                {isForgeActive && (
                  <span
                    className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-accent"
                    aria-hidden="true"
                  />
                )}

                <ForgeIcon
                  className={cn(
                    "size-5 transition-transform duration-300",
                    isForgeActive && "scale-110",
                  )}
                />
                <span className="sr-only">Forge My Group</span>
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Forge My Group</TooltipContent>
        </Tooltip>
      </div>
    </aside>
  );
}
