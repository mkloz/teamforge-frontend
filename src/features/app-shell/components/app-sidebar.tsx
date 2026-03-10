import { cn } from "@/shared/lib/utils";
import { Compass, Home, MessageSquare, Settings, User, Zap } from "lucide-react";
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
      <div
        className="mx-2 lg:mx-3 h-px bg-sidebar-border"
        aria-hidden="true"
      />

      {/* Bottom section: settings + forge */}
      <div className="px-2 lg:px-3 py-4 flex flex-col gap-2">
        <NavItem to="/settings" icon={Settings} label="Settings" />

        {/* Forge button — icon only on tablet, full on desktop */}
        <button
          type="button"
          onClick={onForgeClick}
          aria-label="Forge my group"
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl",
            // Tablet: square icon button
            "h-10 w-10 lg:h-auto lg:w-full lg:px-4 lg:py-3",
            "bg-accent text-accent-foreground font-semibold text-sm",
            "shadow-[0_4px_20px_rgba(245,158,11,0.35)]",
            "transition-all duration-150",
            "hover:shadow-[0_6px_28px_rgba(245,158,11,0.5)] hover:brightness-105",
            "active:scale-[0.98]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
            // Subtle pulse animation on initial render
            "motion-safe:animate-[pulse-glow-amber_2.5s_ease-in-out_1]",
          )}
        >
          <Zap size={16} aria-hidden="true" className="shrink-0" />
          <span className="hidden lg:inline">Forge My Group</span>
        </button>
      </div>
    </aside>
  );
}
