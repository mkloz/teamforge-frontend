import { motion, useReducedMotion } from "framer-motion";
import { Bell } from "lucide-react";
import { useUnreadNotificationCount } from "@/features/notifications/hooks/use-notifications";
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";

interface NotificationsBellTriggerProps {
  onClick: () => void;
}

export function NotificationsBellTrigger({
  onClick,
}: NotificationsBellTriggerProps) {
  const { count } = useUnreadNotificationCount();
  const shouldReduceMotion = useReducedMotion();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClick}
          aria-label={
            count > 0 ? `Notifications, ${count} unread` : "Notifications"
          }
          className={cn(
            "relative size-10 shrink-0 rounded-lg",
            "text-slate-muted hover:text-ink",
          )}
        >
          <Bell size={18} strokeWidth={2} aria-hidden="true" />
          {count > 0 && (
            <motion.span
              key={count}
              initial={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.92 }
              }
              animate={
                shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }
              }
              transition={{
                duration: shouldReduceMotion ? 0.08 : 0.14,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="absolute top-0.5 right-0.5 z-10 flex h-3.5 min-w-3.5 items-center justify-center rounded-full border border-spark-amber/40 bg-canvas px-0.5 font-bold text-nano text-spark-amber tabular-nums leading-none shadow-[inset_0_0_0_999px_color-mix(in_srgb,var(--color-spark-amber)_16%,transparent)] ring-2 ring-canvas"
              aria-hidden="true"
            >
              {count > 9 ? "9+" : count}
            </motion.span>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">
        {count > 0 ? `${count} unread notifications` : "Notifications"}
      </TooltipContent>
    </Tooltip>
  );
}
