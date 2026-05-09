import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  type AppNavigationItem,
  isAppNavigationItemActive,
} from "@/features/app-shell/lib/app-navigation";
import { cn } from "@/shared/lib/utils";

interface TabButtonProps {
  item: AppNavigationItem;
  pathname: string;
}

export function TabButton({ item, pathname }: TabButtonProps) {
  const ItemIcon = item.icon;
  const isForge = item.id === "forge";
  const active = isAppNavigationItemActive(item, pathname);

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
        "relative flex h-full min-w-0 items-center justify-center rounded-2xl px-0.5",
        "transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
      )}
    >
      <motion.div
        whileTap={{ scale: 0.85 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className="relative z-10 flex size-full min-w-0 flex-col items-center justify-center gap-0.5"
      >
        <div
          className={cn(
            "relative flex items-center justify-center transition-colors duration-300",
            active
              ? `size-8 rounded-full ${activeColorBg} shadow-inner`
              : "size-8 rounded-full bg-transparent shadow-none",
          )}
        >
          <ItemIcon
            size={active ? 18 : 17}
            aria-hidden="true"
            className={cn(
              "shrink-0 transition-colors duration-300",
              active ? activeColorText : inactiveColorText,
            )}
          />
          {item.badge != null && item.badge > 0 && (
            <span
              className={cn(
                "absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 font-bold text-accent-foreground text-xs shadow-sm",
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
            "max-w-full truncate font-semibold text-xs leading-none tracking-tight transition-colors duration-300",
            active ? activeColorText : "text-muted-foreground",
          )}
        >
          {item.label}
        </span>
      </motion.div>
    </Link>
  );
}
