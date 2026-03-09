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
        "flex flex-col items-center justify-center gap-1 flex-1 py-2",
        "min-h-[44px] min-w-0",
        "text-[11px] font-medium transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
        active ? "text-primary" : "text-muted-foreground",
        className,
      )}
    >
      <Icon
        size={20}
        aria-hidden="true"
        className={cn(
          "shrink-0 transition-transform duration-150",
          active && "scale-110",
        )}
      />
      <span className="leading-none truncate">{label}</span>
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
        // Height accounts for the raised Forge button + safe area
        "fixed bottom-0 left-0 right-0 z-50",
        "flex lg:hidden items-end",
        "bg-card/96 backdrop-blur-md border-t border-border",
        // Proper safe area — uses the CSS class defined in index.css
        "safe-area-inset-bottom",
        className,
      )}
    >
      {/* Left two tabs — vertically centred within the 64px track */}
      <div className="flex flex-1 h-16 items-center">
        {LEFT_TABS.map((tab) => (
          <TabButton key={tab.to} {...tab} />
        ))}
      </div>

      {/* Center Forge column — taller to accommodate the raised button */}
      <div className="flex flex-col items-center justify-end flex-1 pb-2">
        {/* Raised button sits above the nav baseline */}
        <div className="-translate-y-3">
          <ForgeTriggerButton variant="tab" onClick={onForgeClick} />
        </div>
        <span
          className="text-[11px] font-medium text-muted-foreground leading-none mt-1"
          aria-hidden="true"
        >
          Forge
        </span>
      </div>

      {/* Right two tabs */}
      <div className="flex flex-1 h-16 items-center">
        {RIGHT_TABS.map((tab) => (
          <TabButton key={tab.to} {...tab} />
        ))}
      </div>
    </nav>
  );
}
