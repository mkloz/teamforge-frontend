import { memo } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";

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
          "zoom-in-95 fade-in mt-1 flex animate-in flex-wrap gap-1 duration-500",
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
                  "h-auto rounded-full border px-1.5 py-0.5 font-bold text-xs transition-all",
                  reaction.isActive
                    ? "border-forge-teal/20 bg-forge-teal/10 text-forge-teal shadow-[0_2px_8px_-2px_rgba(13,148,136,0.2)]"
                    : "border-transparent",
                )}
                onClick={() => onToggleReaction?.(reaction.emoji)}
              >
                <span className="text-xs leading-none">{reaction.emoji}</span>
                {reaction.count > 1 && (
                  <span className="tabular-nums opacity-80">
                    {reaction.count}
                  </span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="rounded-lg border-white/10 bg-black/80 px-2 py-1 font-bold text-white text-xs shadow-xl backdrop-blur-md"
            >
              Reactions: {reaction.emoji}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
});
