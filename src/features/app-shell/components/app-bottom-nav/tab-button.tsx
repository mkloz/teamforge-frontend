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
  const badge = item.badge ?? 0;
  const hasBadge = badge > 0;
  const ariaLabel = hasBadge ? `${item.label}, ${badge} unread` : item.label;

  const activeColorText = isForge
    ? "text-accent stroke-[2.5]"
    : "text-primary stroke-[2.5]";
  const activeColorBg = isForge
    ? "border-accent/25 bg-accent/15 dark:bg-accent/20"
    : "border-primary/25 bg-primary/15 dark:bg-primary/20";
  const inactiveColorText = "text-muted-foreground stroke-[1.5]";

  return (
    <Link
      {...item.navigation}
      aria-current={active ? "page" : undefined}
      aria-label={ariaLabel}
      className={cn(
        "relative flex h-full min-w-0 items-center justify-center rounded-full",
        "transition-colors duration-200 hover:bg-muted/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
      )}
    >
      <motion.div
        layout
        whileTap={{ scale: 0.85 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className="relative z-10 flex size-full min-w-0 flex-col items-center justify-center gap-0.5"
      >
        <motion.div
          layout
          className={cn(
            "relative flex items-center justify-center transition-colors duration-300",
            active
              ? `size-10 rounded-full border ${activeColorBg}`
              : "size-8 rounded-full bg-transparent shadow-none",
          )}
        >
          <ItemIcon
            size={active ? 21 : 17}
            aria-hidden="true"
            className={cn(
              "shrink-0 transition-colors duration-300",
              active ? activeColorText : inactiveColorText,
            )}
          />
          {hasBadge && (
            <span
              className={cn(
                "type-signature-label absolute top-0.5 right-0.5 flex items-center justify-center rounded-full bg-accent font-black text-accent-foreground leading-none shadow-sm",
                badge > 9 ? "h-4 min-w-5 px-1" : "size-4 p-0",
                "border-2 border-background",
                active && "scale-110",
              )}
            >
              {badge > 9 ? "9+" : badge}
            </span>
          )}
        </motion.div>

        <motion.span
          animate={
            active
              ? { height: 0, opacity: 0, y: -2 }
              : { height: "auto", opacity: 1, y: 0 }
          }
          aria-hidden={active}
          className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-muted-foreground text-xs leading-none tracking-tight"
          initial={false}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {item.label}
        </motion.span>
      </motion.div>
    </Link>
  );
}
