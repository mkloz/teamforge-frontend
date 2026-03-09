import { cn } from "@/shared/lib/utils";
import { Link } from "@tanstack/react-router";
import { Compass, Home, MessageSquare, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ForgeTriggerButton } from "./forge-trigger-button";
import { useActiveRoute } from "../hooks/use-active-route";

interface TabItem {
  to: string;
  icon: LucideIcon;
  label: string;
  matchPrefix?: boolean;
}

const LEFT_TABS: TabItem[] = [
  { to: "/home", icon: Home, label: "Home" },
  { to: "/explore", icon: Compass, label: "Explore" },
];

const RIGHT_TABS: TabItem[] = [
  { to: "/activity", icon: MessageSquare, label: "Activity", matchPrefix: true },
  { to: "/profile", icon: User, label: "Profile" },
];

interface TabButtonProps extends TabItem {
  className?: string;
}

function TabButton({ to, icon: Icon, label, matchPrefix = false, className }: TabButtonProps) {
  const { isActive, startsWith } = useActiveRoute();
  const active = matchPrefix ? startsWith(to) : isActive(to);

  return (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      aria-label={label}
      className={cn(
        "flex flex-col items-center justify-center gap-1 flex-1 py-2 min-h-[44px]",
        "text-xs font-medium transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active ? "text-primary" : "text-muted-foreground",
        className,
      )}
    >
      <Icon size={20} aria-hidden="true" className="shrink-0" />
      <span className="leading-none">{label}</span>
    </Link>
  );
}

interface AppBottomNavProps {
  onForgeClick: () => void;
  className?: string;
}

export function AppBottomNav({ onForgeClick, className }: AppBottomNavProps) {
  return (
    <nav
      aria-label="Main navigation"
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 h-20",
        "flex lg:hidden items-center",
        "bg-card/95 backdrop-blur-md border-t border-border",
        // Safe area inset for notched devices
        "pb-safe",
        className,
      )}
    >
      {/* Left two tabs */}
      {LEFT_TABS.map((tab) => (
        <TabButton key={tab.to} {...tab} />
      ))}

      {/* Center forge button (raised) */}
      <div className="flex flex-col items-center justify-center flex-1 relative">
        {/* Negative margin to lift the button above the nav bar */}
        <div className="-mt-8">
          <ForgeTriggerButton variant="tab" onClick={onForgeClick} />
        </div>
        <span className="text-[10px] font-medium text-muted-foreground mt-1 leading-none">
          Forge
        </span>
      </div>

      {/* Right two tabs */}
      {RIGHT_TABS.map((tab) => (
        <TabButton key={tab.to} {...tab} />
      ))}
    </nav>
  );
}
