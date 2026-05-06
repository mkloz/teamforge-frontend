import { useActiveRoute } from "@/features/app-shell/hooks/use-active-route";
import type { AppNavigationItem } from "@/features/app-shell/lib/app-navigation";
import { cn } from "@/shared/lib/utils";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";

interface TabButtonProps {
  item: AppNavigationItem;
}

export function TabButton({ item }: TabButtonProps) {
  const { isActive, startsWith } = useActiveRoute();
  const ItemIcon = item.icon;
  const isForge = item.id === "forge";

  const active =
    item.matchMode === "prefix"
      ? startsWith(item.navigation.to)
      : isActive(item.navigation.to);

  const activeColorText = isForge
    ? "text-accent stroke-[2.5]"
    : "text-primary stroke-[2.5]";
  const activeColorBg = isForge
    ? "bg-accent/20 dark:bg-accent/25"
    : "bg-primary/20 dark:bg-primary/25";
  const inactiveColorText = "text-muted-foreground stroke-[1.5]";

  return (
    <Link
      {...item.navigation}
      aria-current={active ? "page" : undefined}
      aria-label={item.label}
      className={cn(
        "relative flex h-full w-12 flex-none flex-col items-center justify-center px-0 min-[380px]:w-14",
        "min-w-0 transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset rounded-2xl",
      )}
    >
      <motion.div
        whileTap={{ scale: 0.85 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className="relative flex flex-col items-center justify-center z-10 w-full h-full"
      >
        <div
          className={cn(
            "relative flex items-center justify-center transition-colors duration-300",
            active
              ? `w-10 h-10 rounded-full ${activeColorBg} shadow-inner`
              : "w-9 h-9 rounded-full bg-transparent shadow-none",
          )}
        >
          <ItemIcon
            size={active ? 20 : 18}
            aria-hidden="true"
            className={cn(
              "shrink-0 transition-colors duration-300",
              active ? activeColorText : inactiveColorText,
            )}
          />
          {item.badge != null && item.badge > 0 && (
            <span
              className={cn(
                "absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground shadow-sm",
                "border-2 border-background",
                active && "scale-110",
              )}
            >
              {item.badge > 9 ? "9+" : item.badge}
            </span>
          )}
        </div>

        <span
          className={cn(
            "text-micro font-semibold tracking-tight transition duration-300 whitespace-nowrap",
            active
              ? "absolute opacity-0 scale-50 translate-y-4"
              : "relative opacity-100 scale-100 translate-y-0 text-muted-foreground -mt-1",
          )}
        >
          {item.label}
        </span>
      </motion.div>
    </Link>
  );
}
