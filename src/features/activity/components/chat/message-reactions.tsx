import { cn } from "@/shared/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { memo } from "react";
import { Button } from "@/shared/components/ui/button";

export interface ReactionGroup {
  emoji: string;
  count: number;
  isActive?: boolean;
}

interface MessageReactionsProps {
  reactions?: ReactionGroup[];
  isOwn?: boolean;
  className?: string;
  onToggleReaction?: (emoji: string) => void;
}

export const MessageReactions = memo(function MessageReactions({
  reactions,
  isOwn,
  className,
  onToggleReaction,
}: MessageReactionsProps) {
  if (!reactions || reactions.length === 0) return null;

  return (
    <TooltipProvider delayDuration={150}>
      <div
        className={cn(
          "flex flex-wrap gap-1 mt-1 animate-in fade-in zoom-in-95 duration-500",
          isOwn ? "justify-end" : "justify-start",
          className,
        )}
      >
        {reactions.map((reaction) => (
          <Tooltip key={reaction.emoji}>
            <TooltipTrigger asChild>
              <Button
                variant={reaction.isActive ? "primary" : "subtle"}
                size="xs"
                className={cn(
                  "h-auto py-0.5 px-1.5 rounded-full border text-micro font-bold transition-all",
                  reaction.isActive
                    ? "bg-forge-teal/10 border-forge-teal/20 text-forge-teal shadow-[0_2px_8px_-2px_rgba(13,148,136,0.2)]"
                    : "border-transparent",
                )}
                onClick={() => onToggleReaction?.(reaction.emoji)}
              >
                <span className="text-xs leading-none">{reaction.emoji}</span>
                {reaction.count > 1 && (
                  <span className="opacity-80 tabular-nums">
                    {reaction.count}
                  </span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="px-2 py-1 bg-black/80 backdrop-blur-md rounded-lg border-white/10 text-micro font-bold text-white shadow-xl"
            >
              Reactions: {reaction.emoji}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
});
