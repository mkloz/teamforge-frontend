import { cn } from "@/shared/lib/utils";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Compass, Home, MessageSquare, User, Zap } from "lucide-react";
import { useActiveRoute } from "../hooks/use-active-route";

interface NavItem {
  id: string;
  to?: string;
  icon: LucideIcon;
  label: string;
  matchPrefix?: boolean;
}

const TABS: NavItem[] = [
  { id: "home", to: "/home", icon: Home, label: "Home" },
  { id: "explore", to: "/explore", icon: Compass, label: "Explore" },
  { id: "forge", to: "/forge", icon: Zap, label: "Forge" },
  {
    id: "activity",
    to: "/activity",
    icon: MessageSquare,
    label: "Activity",
    matchPrefix: true,
  },
  { id: "profile", to: "/profile", icon: User, label: "Profile" },
];

function ActiveSlidingWaves({
  label,
  isForge,
}: {
  label: string;
  isForge: boolean;
}) {
  // Forge button uses Yellow (Accent), normal tabs use Teal (Primary)
  const wave1Class = isForge
    ? "fill-accent/25 dark:fill-accent/15"
    : "fill-primary/25 dark:fill-primary/15";
  const wave2Class = isForge ? "fill-accent" : "fill-primary";
  const textColorClass = isForge
    ? "text-accent-foreground"
    : "text-primary-foreground";

  return (
    <motion.div
      layoutId="active-wave-group"
      className="absolute bottom-full left-1/2 -translate-x-1/2 flex items-center justify-center z-20 pointer-events-none"
      transition={{ type: "spring", stiffness: 300, damping: 26, mass: 0.9 }}
    >
      <svg
        viewBox="0 0 800 64"
        className="w-200 h-16 overflow-visible preserve-3d"
      >
        {/* Wave 1 Background: Extremely shallow sweep to match request */}
        <path
          d="M 0 64 L 100 64 C 200 64, 280 52, 400 52 C 520 52, 600 64, 700 64 L 800 64 Z"
          className={cn(
            "transition-colors duration-500 ease-in-out",
            wave1Class,
          )}
        />

        {/* Wave 2 Foreground: Even shallower height to integrated with base better */}
        <path
          d="M 250 64 C 300 64, 340 44, 400 44 C 460 44, 500 64, 550 64 Z"
          className={cn(
            "transition-colors duration-500 ease-in-out shadow-xl",
            wave2Class,
          )}
        />
      </svg>

      {/* Text perfectly centered inside the new extremely shallow focal peak (Midpoint 54) */}
      <motion.span
        initial={{ opacity: 0, scale: 0.6, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 22 }}
        transition={{ delay: 0.05, duration: 0.25, type: "spring" }}
        className={cn(
          "absolute text-[12px] font-bold tracking-wider",
          textColorClass,
        )}
      >
        {label}
      </motion.span>
    </motion.div>
  );
}

interface TabButtonProps {
  item: NavItem;
}

function TabButton({ item }: TabButtonProps) {
  const { isActive, startsWith } = useActiveRoute();

  const isForge = item.id === "forge";

  const active = item.to
    ? item.matchPrefix
      ? startsWith(item.to)
      : isActive(item.to)
    : false;

  const activeColorText = isForge
    ? "text-accent stroke-[2.5]"
    : "text-primary stroke-[2.5]";
  const activeColorBg = isForge
    ? "bg-accent/20 dark:bg-accent/25"
    : "bg-primary/20 dark:bg-primary/25";
  const inactiveColorText = "text-muted-foreground stroke-[1.5]";

  const content = (
    <>
      <AnimatePresence>
        {active && <ActiveSlidingWaves label={item.label} isForge={isForge} />}
      </AnimatePresence>

      <motion.div
        whileTap={{ scale: 0.85 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className="relative flex flex-col items-center justify-center z-10 w-full h-full -mt-1"
      >
        {/* Active state gets a perfectly round, saturated background to ground the focal point */}
        <div
          className={cn(
            "flex items-center justify-center transition-all duration-300",
            active
              ? `w-10 h-10 rounded-full ${activeColorBg} shadow-inner`
              : "w-9 h-9 rounded-full bg-transparent shadow-none",
          )}
        >
          <item.icon
            size={active ? 20 : 18}
            aria-hidden="true"
            className={cn(
              "shrink-0 transition-all duration-300",
              active ? activeColorText : inactiveColorText,
            )}
          />
        </div>

        {/* The text literally vanishes underneath to make space for the icon when active */}
        <span
          className={cn(
            "text-[10px] font-semibold tracking-tight transition-all duration-300 whitespace-nowrap",
            active
              ? "absolute opacity-0 scale-50 translate-y-4"
              : "relative opacity-100 scale-100 translate-y-0 text-muted-foreground -mt-1",
          )}
        >
          {item.label}
        </span>
      </motion.div>
    </>
  );

  const buttonClasses = cn(
    "relative flex flex-col items-center justify-center flex-1 h-full px-1",
    "min-w-0 transition-colors duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset rounded-2xl",
  );

  // Fallback missing `to` gracefully
  if (!item.to) return null;

  return (
    <Link
      to={item.to}
      aria-current={active ? "page" : undefined}
      aria-label={item.label}
      className={buttonClasses}
    >
      {content}
    </Link>
  );
}

interface AppBottomNavProps {
  className?: string;
}

export function AppBottomNav({ className }: AppBottomNavProps) {
  return (
    <nav
      aria-label="Mobile navigation"
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40",
        "flex md:hidden items-stretch h-14 pt-0 pb-0",
        "bg-background/95 backdrop-blur-2xl",
        "safe-area-inset-bottom pointer-events-auto", // Removed hard horizontal border mapping
        className,
      )}
    >
      <div className="flex w-full items-center justify-around px-2 z-10 h-full">
        {TABS.map((tab) => (
          <TabButton key={tab.id} item={tab} />
        ))}
      </div>
    </nav>
  );
}
