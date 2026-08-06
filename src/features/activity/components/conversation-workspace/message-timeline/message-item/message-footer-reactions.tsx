import { MessageReactions, type ReactionGroup } from "./message-reactions";

export function MessageFooterReactions({
  isOwn,
  onToggleReaction,
  reactionGroups,
  visibleReactionPlaceholderEmojis,
}: {
  isOwn: boolean;
  onToggleReaction?: (emoji: string) => void;
  reactionGroups: ReactionGroup[];
  visibleReactionPlaceholderEmojis: string[];
}) {
  return (
    <div className="flex min-w-0 items-center gap-0.5">
      <MessageReactions
        reactions={reactionGroups}
        isOwn={isOwn}
        onToggleReaction={onToggleReaction}
      />
      <ReactionPlaceholders
        emojis={visibleReactionPlaceholderEmojis}
        onToggleReaction={onToggleReaction}
      />
    </div>
  );
}

function ReactionPlaceholders({
  emojis,
  onToggleReaction,
}: {
  emojis: readonly string[];
  onToggleReaction?: (emoji: string) => void;
}) {
  if (emojis.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-0.5">
      {emojis.map((emoji) => (
        <button
          key={emoji}
          type="button"
          aria-label={`React with ${emoji}`}
          className="group/reaction flex size-5 items-center justify-center rounded-full text-xs leading-none transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25 active:scale-95"
          onClick={() => onToggleReaction?.(emoji)}
        >
          <span
            aria-hidden="true"
            className="flex size-5 items-center justify-center rounded-full border border-border/55 bg-card/55 opacity-70 transition group-hover/reaction:border-accent/35 group-hover/reaction:bg-accent/12 group-hover/reaction:opacity-100"
          >
            {emoji}
          </span>
        </button>
      ))}
    </div>
  );
}
