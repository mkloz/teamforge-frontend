import { cn } from "@/shared/lib/utils";
import type { Message } from "../../types/groups.types";

interface SystemMessageProps {
  message: Message;
}

export function SystemMessage({ message }: SystemMessageProps) {
  // Detect if this is a "positive" event (join, confirmed) vs neutral
  const isPositive = message.content.toLowerCase().includes("joined") || 
                     message.content.toLowerCase().includes("confirmed");

  return (
    <div className="flex justify-center my-3">
      <p className={cn(
        "text-[11px] font-medium px-3 py-1 rounded-full",
        "bg-muted/60 text-muted-foreground",
        isPositive && "bg-primary/10 text-primary",
      )}>
        {message.content}
      </p>
    </div>
  );
}
