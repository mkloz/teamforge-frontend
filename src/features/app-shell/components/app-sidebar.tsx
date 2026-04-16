import { TeamForgeLogo } from "@/assets/logo";
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";
import { Link } from "@tanstack/react-router";
import { Compass, Home, MessageSquare, Settings, User } from "lucide-react";
import { useActiveRoute } from "../hooks/use-active-route";
import { NavItem } from "./nav-item";

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
}

import { useForgeStore } from "../../forge/store/forge-store";

export function AppSidebar({ className }: AppSidebarProps) {
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
        "fixed top-16 left-0 bottom-0 z-40",
        // Hidden on mobile, icon-only on tablet and desktop
        "hidden md:flex flex-col",
        "w-14",
        "bg-sidebar border-r border-sidebar-border",
        className,
      )}
    >
      {/* Primary nav */}
      <nav
        className="flex flex-col items-center gap-1 px-1.5 pt-1.5 pb-2 flex-1"
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
      </nav>

      {/* Divider between nav and utility section */}
      <div className="mx-1.5 h-px bg-sidebar-border" aria-hidden="true" />

      {/* Bottom section: settings + forge */}
      <div className="px-1.5 py-2 flex flex-col items-center gap-1.5">
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
