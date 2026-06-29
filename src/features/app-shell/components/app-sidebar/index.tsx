import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { TeamForgeLogo } from "@/assets/logo";
import { useActivePathname } from "@/features/app-shell/hooks/use-active-pathname";
import {
  applyAppNavigationBadges,
  appSidebarNavigation,
  getAppNavigationItem,
  isAppNavigationItemActive,
} from "@/features/app-shell/public/app-navigation";
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";
import { buildHomeNavigation } from "@/shared/navigation/home-navigation";
import { NavItem } from "./nav-item";

interface AppSidebarProps {
  className?: string;
  activityUnreadCount?: number;
  notificationTrigger?: ReactNode;
}

export function AppSidebar({
  activityUnreadCount = 0,
  className,
  notificationTrigger,
}: AppSidebarProps) {
  const pathname = useActivePathname();
  const sidebarItems = applyAppNavigationBadges(appSidebarNavigation, {
    activity: activityUnreadCount,
  });
  const forgeItem = getAppNavigationItem("forge");
  const settingsItem = getAppNavigationItem("settings");
  const ForgeIcon = forgeItem.icon;
  const isForgeActive = isAppNavigationItemActive(forgeItem, pathname);

  return (
    <aside
      aria-label="Desktop navigation"
      className={cn(
        "fixed top-0 bottom-0 left-0 z-40",
        // Hidden on mobile, icon-only on tablet and desktop
        "hidden flex-col md:flex",
        "w-14",
        "border-sidebar-border border-r bg-sidebar",
        className,
      )}
    >
      {/* Top section: Logo */}
      <div className="flex h-16 shrink-0 items-center justify-center">
        <Link
          {...buildHomeNavigation()}
          className="transition-opacity hover:opacity-80"
          aria-label="TeamForge home"
        >
          <TeamForgeLogo className="size-8" showBackground={false} />
        </Link>
      </div>

      <div className="mx-1.5 h-px bg-sidebar-border/50" aria-hidden="true" />

      {/* Primary nav */}
      <nav
        className="flex flex-1 flex-col items-center gap-1 px-1.5 pt-3 pb-2"
        aria-label="App navigation"
      >
        {sidebarItems.map((item) => (
          <NavItem key={item.id} item={item} pathname={pathname} />
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-1.5 h-px bg-sidebar-border/50" aria-hidden="true" />

      {/* Bottom section: notifications, settings + forge */}
      <div className="flex flex-col items-center gap-3 px-1.5 py-4">
        {notificationTrigger}

        <NavItem item={settingsItem} pathname={pathname} />

        {/* Forge button — icon only */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              asChild
              size="icon"
              variant="ghost"
              className={cn(
                "group relative flex size-10 items-center justify-center rounded-lg transition-all duration-150",
                isForgeActive
                  ? "bg-accent/10 text-accent"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Link {...forgeItem.navigation} aria-label="Forge my group">
                {/* Active indicator */}
                {isForgeActive && (
                  <span
                    className="absolute top-1/2 left-0 h-6 w-1 -translate-y-1/2 rounded-full bg-accent"
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
