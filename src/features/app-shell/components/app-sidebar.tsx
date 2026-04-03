import { TeamForgeLogo } from "@/assets/logo";
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

export function AppSidebar({ className }: AppSidebarProps) {
  const { isActive } = useActiveRoute();
  const isForgeActive = isActive("/forge");

  return (
    <aside
      aria-label="Desktop navigation"
      className={cn(
        "fixed top-16 left-0 bottom-0 z-40",
        // Hidden on mobile, icon-only on tablet, full on desktop
        "hidden md:flex flex-col",
        "w-16 lg:w-60",
        "bg-sidebar border-r border-sidebar-border",
        className,
      )}
    >
      {/* Primary nav */}
      <nav
        className="flex flex-col gap-1 px-2 lg:px-3 pt-3 pb-4 flex-1"
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
      <div className="mx-2 lg:mx-3 h-px bg-sidebar-border" aria-hidden="true" />

      {/* Bottom section: settings + forge */}
      <div className="px-2 lg:px-3 py-4 flex flex-col gap-2">
        <NavItem to="/settings" icon={Settings} label="Settings" />

        {/* Forge button — icon only on tablet, full on desktop */}
        <Link
          to="/forge"
          aria-label="Forge my group"
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl transition duration-300 relative",
            // Tablet: square icon button
            "h-10 w-10 lg:h-auto lg:w-full lg:px-4 lg:py-3",
            "font-semibold text-sm",
            isForgeActive
              ? "bg-accent text-accent-foreground shadow-[0_0_20px_rgba(245,158,11,0.4)]"
              : "bg-muted text-foreground hover:bg-accent/10 hover:text-accent border border-accent/20",
            "active:scale-[0.98]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
          )}
        >
          <TeamForgeLogo
            className={cn(
              "w-4 h-4 transition-transform duration-300",
              isForgeActive && "scale-110",
            )}
            showBackground={false}
          />
          <span className="hidden lg:inline">Forge My Group</span>
        </Link>
      </div>
    </aside>
  );
}
