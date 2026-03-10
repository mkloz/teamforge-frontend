import { cn } from "@/shared/lib/utils";
import { Compass, Home, MessageSquare, Settings, User } from "lucide-react";
import { ForgeTriggerButton } from "./forge-trigger-button";
import { NavItem } from "./nav-item";

const NAV_ITEMS = [
  { to: "/home", icon: Home, label: "Home" },
  { to: "/explore", icon: Compass, label: "Explore" },
  { to: "/activity", icon: MessageSquare, label: "Activity", matchPrefix: true },
  { to: "/profile", icon: User, label: "Profile" },
] as const;

interface AppSidebarProps {
  onForgeClick: () => void;
  className?: string;
}

export function AppSidebar({ onForgeClick, className }: AppSidebarProps) {
  return (
    <aside
      aria-label="Main navigation"
      className={cn(
        "fixed top-16 left-0 bottom-0 z-40 w-60",
        "hidden lg:flex flex-col",
        "bg-sidebar border-r border-sidebar-border",
        className,
      )}
    >
      {/* Primary nav */}
      <nav
        className="flex flex-col gap-1 px-3 pt-3 pb-4 flex-1"
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

      {/* Bottom section: settings + forge */}
      <div className="px-3 pb-6 flex flex-col gap-2">
        <NavItem to="/settings" icon={Settings} label="Settings" />
        <div className="mt-1">
          <ForgeTriggerButton variant="sidebar" onClick={onForgeClick} />
        </div>
      </div>
    </aside>
  );
}
