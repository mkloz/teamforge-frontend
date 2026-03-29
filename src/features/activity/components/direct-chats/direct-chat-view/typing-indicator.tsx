import { memo } from "react";

interface TypingIndicatorProps {
  name: string;
  avatar: string;
}

/**
 * TypingIndicator - Renders a typing dot animation with user avatar.
 * Memoized to prevent redundant re-renders.
 */
export const TypingIndicator = memo(function TypingIndicator({
  name,
  avatar,
}: TypingIndicatorProps) {
  return (
    <div className="flex items-end gap-2 px-2 mt-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <img
        src={avatar}
        alt={name}
        className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-border shadow-sm"
      />
      <div className="bg-card border border-border/60 p-3 rounded-4xl rounded-bl-md shadow-sm">
        <div className="flex gap-1.5 items-center justify-center min-w-8 h-4">
          <span
            className="w-1.5 h-1.5 rounded-full bg-slate-muted/60 animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="w-1.5 h-1.5 rounded-full bg-slate-muted/60 animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="w-1.5 h-1.5 rounded-full bg-slate-muted/60 animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
});
