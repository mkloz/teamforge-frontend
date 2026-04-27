import { TeamForgeLogo } from "@/assets/logo";
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";
import { Link } from "@tanstack/react-router";
import {
  Compass,
  Home,
  MessageSquare,
  Settings,
  Flame,
  User,
} from "lucide-react";
import type { ReactNode } from "react";
import { useActiveRoute } from "../hooks/use-active-route";
import { NavItem } from "./nav-item";
import { useForgeStore } from "../../forge/store/forge-store";

const NAV_ITEMS = [
  { to: "/home", icon: Home, label: "Home" },
  { to: "/explore", icon: Compass, label: "Explore" },
  {
    to: "/activity",
    icon: MessageSquare,
    label: "Activity",
    matchPrefix: true,
    badge: 5,
  },
  { to: "/profile", icon: User, label: "Profile" },
] as const;

interface AppSidebarProps {
  className?: string;
  notificationsTrigger?: ReactNode;
}

export function AppSidebar({
  className,
  notificationsTrigger,
}: AppSidebarProps) {
  const { isActive } = useActiveRoute();
  const isForgeActive = isActive("/forge");
  const { openWizard } = useForgeStore();

  const handleForgeClick = (e: React.MouseEvent) => {
    if (isForgeActive) {
      e.preventDefault();
      openWizard();
    }
  };

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
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            badge={"badge" in item ? (item.badge as number) : undefined}
            matchPrefix={"matchPrefix" in item ? item.matchPrefix : false}
          />
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-1.5 h-px bg-sidebar-border/50" aria-hidden="true" />

      {/* Bottom section: notifications, settings + forge */}
      <div className="px-1.5 py-4 flex flex-col items-center gap-3">
        {notificationsTrigger}

        <NavItem to="/settings" icon={Settings} label="Settings" />

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
              <Link
                to="/forge"
                onClick={handleForgeClick}
                aria-label="Forge my group"
              >
                {/* Active indicator */}
                {isForgeActive && (
                  <span
                    className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-accent"
                    aria-hidden="true"
                  />
                )}

                <Flame
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
