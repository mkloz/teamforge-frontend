import { cn } from "@/shared/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { memo } from "react";

export interface ReactionGroup {
  emoji: string;
  count: number;
  isActive?: boolean;
}

interface MessageReactionsProps {
  reactions?: ReactionGroup[];
  isOwn?: boolean;
  className?: string;
}

export const MessageReactions = memo(function MessageReactions({
  reactions,
  isOwn,
  className,
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
              <button
                className={cn(
                  "flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-micro font-bold transition hover:scale-105 active:scale-95",
                  reaction.isActive
                    ? "bg-forge-teal/10 border-forge-teal/20 text-forge-teal shadow-[0_2px_8px_-2px_rgba(13,148,136,0.2)]"
                    : "bg-white/10 dark:bg-black/10 border-white/10 dark:border-white/5 text-slate-muted hover:border-slate-muted/20",
                )}
              >
                <span className="text-xs leading-none">{reaction.emoji}</span>
                {reaction.count > 1 && (
                  <span className="opacity-80 tabular-nums">
                    {reaction.count}
                  </span>
                )}
              </button>
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
