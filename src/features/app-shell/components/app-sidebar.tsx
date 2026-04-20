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
  Search,
  Settings,
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
  },
  { to: "/profile", icon: User, label: "Profile" },
] as const;

interface AppSidebarProps {
  className?: string;
  notificationsTrigger?: ReactNode;
  onSearchClick?: () => void;
}

export function AppSidebar({
  className,
  notificationsTrigger,
  onSearchClick,
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
          to="/home"
          className="hover:opacity-80 transition-opacity"
          aria-label="TeamForge home"
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
            matchPrefix={"matchPrefix" in item ? item.matchPrefix : false}
          />
        ))}

        {/* Desktop Search Trigger */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onSearchClick}
              aria-label="Search"
              className="size-10 rounded-xl text-foreground/70 hover:text-foreground hover:bg-accent/10"
            >
              <Search size={20} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Search (⌘K)</TooltipContent>
        </Tooltip>
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
              variant={isForgeActive ? "secondary" : "ghost"}
              className={cn(
                "relative flex items-center justify-center rounded-xl transition-all duration-300 size-10",
                isForgeActive
                  ? "shadow-amber-glow brightness-110"
                  : "bg-muted/50 text-foreground hover:bg-accent/10 hover:text-accent border border-accent/10 hover:border-accent/30",
              )}
            >
              <Link
                to="/forge"
                onClick={handleForgeClick}
                aria-label="Forge my group"
              >
                <TeamForgeLogo
                  className={cn(
                    "size-5 transition-transform duration-300",
                    isForgeActive && "scale-110",
                  )}
                  showBackground={false}
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
