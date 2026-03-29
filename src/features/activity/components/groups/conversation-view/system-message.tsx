import { cn } from "@/shared/lib/utils";
import type { Message } from "@/features/activity/types/groups.types";
import { memo } from "react";

interface SystemMessageProps {
  message: Message;
}

/**
 * SystemMessage - Renders a system message (joined, confirmed, etc).
 * Memoized to prevent redundant re-renders.
 */
export const SystemMessage = memo(function SystemMessage({
  message,
}: SystemMessageProps) {
  // Detect if this is a "positive" event (join, confirmed) vs neutral
  const isPositive =
    message.content.toLowerCase().includes("joined") ||
    message.content.toLowerCase().includes("confirmed");

  return (
    <div className="flex justify-center my-3">
      <p
        className={cn(
          "text-[11px] font-medium px-3 py-1 rounded-full",
          "bg-muted/60 text-muted-foreground",
          isPositive && "bg-primary/10 text-primary",
        )}
      >
        {message.content}
      </p>
    </div>
  );
});
