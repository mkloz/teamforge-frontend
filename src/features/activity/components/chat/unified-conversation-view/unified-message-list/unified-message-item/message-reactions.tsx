import { memo } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
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
                  ? "border-forge-teal/20 bg-forge-teal/10 text-forge-teal shadow-sm"
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
          <TooltipContent side="top">
            Reactions: {reaction.emoji}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
});
